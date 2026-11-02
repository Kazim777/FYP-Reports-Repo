import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { ApiError } from './ApiError.js';

const transporter =
  env.gmail && !env.isTest
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.gmail.user, pass: env.gmail.appPassword },
      })
    : null;

export const outbox = [];

export async function sendMail({ to, subject, text, html }) {
  if (transporter) {
    try {
      await transporter.sendMail({ from: { name: env.gmail.fromName, address: env.gmail.user }, to, subject, text, html });
      return;
    } catch (err) {
      console.error('Email could not be sent:', err.message);
      throw new ApiError(503, 'We could not send the email right now. Please try again in a few minutes.');
    }
  }

  if (env.isProduction) {
    throw new ApiError(503, 'Email is not set up on the server yet. Please contact the administrator.');
  }

  outbox.push({ to, subject, text });
  if (!env.isTest) console.info(`\n[email to ${to}] ${subject}\n${text}\n`);
}
