import 'pdf-parse/worker';
import { PDFParse } from 'pdf-parse';

const ROMAN_NUMERAL = '(?=[ivxlc])c{0,3}(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})';
const PAGE_NUMBER_LINE = new RegExp(`^(page\\s*)?(\\d{1,3}|${ROMAN_NUMERAL})(\\s*(of|/)\\s*\\d{1,3})?$`, 'i');
const ABSTRACT_HEADING = /^abstract\b[\s.:\-–—]*/i;
const SECTION_AFTER_ABSTRACT =
  /^(\d+(\.\d+)*\.?\s+)?(keywords?|index terms|introduction|table of contents|contents|acknowledge?ments?|chapter\b|list of (figures|tables)|declaration|dedication)/i;
const MIN_ABSTRACT_LENGTH = 150;
const MAX_ABSTRACT_LENGTH = 2000;
const MIN_READABLE_WORDS = 50;

const normalizeLine = (line) =>
  line
    .replace(/[\u0000-\u0008\u000b-\u001f­]/g, '')
    .replace(/[ \t ]+/g, ' ')
    .trim();

const lineKey = (line) => line.toLowerCase().replace(/\d+/g, '#');

function findRepeatedLines(pages) {
  if (pages.length < 3) return new Set();

  const counts = new Map();
  for (const lines of pages) {
    for (const key of new Set(lines.map(lineKey))) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const threshold = Math.max(3, Math.ceil(pages.length * 0.5));
  return new Set([...counts].filter(([key, count]) => count >= threshold && key.length < 120).map(([key]) => key));
}

function cleanPages(pages) {
  const pageLines = pages.map((page) => page.text.split('\n').map(normalizeLine).filter(Boolean));
  const repeated = findRepeatedLines(pageLines);

  return pageLines
    .map((lines) => lines.filter((line) => !PAGE_NUMBER_LINE.test(line) && !repeated.has(lineKey(line))).join('\n'))
    .join('\n\n')
    .replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function trimToSentence(text, maxLength) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastStop = cut.lastIndexOf('. ');
  return lastStop > maxLength / 2 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`;
}

export function findAbstract(cleanedText) {
  const lines = cleanedText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (!ABSTRACT_HEADING.test(lines[i])) continue;

    const collected = [lines[i].replace(ABSTRACT_HEADING, '')];
    for (const line of lines.slice(i + 1)) {
      if (SECTION_AFTER_ABSTRACT.test(line) || collected.join(' ').length > MAX_ABSTRACT_LENGTH * 1.5) break;
      collected.push(line);
    }

    const abstract = collected.join(' ').replace(/\s+/g, ' ').trim();
    const looksLikeContentsPage = /\.{4,}/.test(abstract);
    if (abstract.length >= MIN_ABSTRACT_LENGTH && !looksLikeContentsPage) {
      return trimToSentence(abstract, MAX_ABSTRACT_LENGTH);
    }
  }

  return null;
}

export const countWords = (text) => text.match(/\p{L}[\p{L}\p{N}'’-]*/gu)?.length ?? 0;

export async function extractPdfText(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const { pages, text, total } = await parser.getText({ pageJoiner: '' });
    const cleanedText = cleanPages(pages);
    const wordCount = countWords(cleanedText);

    return {
      rawText: text,
      cleanedText,
      pageCount: total,
      wordCount,
      abstract: findAbstract(cleanedText),
      isReadable: wordCount >= MIN_READABLE_WORDS,
    };
  } finally {
    await parser.destroy();
  }
}
