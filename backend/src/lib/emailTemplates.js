const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

function layout({ heading, intro, buttonLabel, link, outro }) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px">
            <tr><td style="font-size:18px;font-weight:bold;color:#4338ca">FYP Hub</td></tr>
            <tr><td style="padding-top:24px;font-size:20px;font-weight:bold">${escapeHtml(heading)}</td></tr>
            <tr><td style="padding-top:12px;font-size:14px;line-height:22px;color:#475569">${escapeHtml(intro)}</td></tr>
            <tr>
              <td style="padding-top:24px">
                <a href="${escapeHtml(link)}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 20px;border-radius:8px">${escapeHtml(buttonLabel)}</a>
              </td>
            </tr>
            <tr><td style="padding-top:24px;font-size:12px;line-height:18px;color:#64748b">${escapeHtml(outro)}</td></tr>
            <tr><td style="padding-top:12px;font-size:12px;line-height:18px;color:#94a3b8;word-break:break-all">${escapeHtml(link)}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildEmail({ subject, heading, intro, buttonLabel, link, outro }) {
  return {
    subject,
    text: `${heading}\n\n${intro}\n\n${buttonLabel}: ${link}\n\n${outro}`,
    html: layout({ heading, intro, buttonLabel, link, outro }),
  };
}

export const verificationEmail = ({ name, link, validHours }) =>
  buildEmail({
    subject: 'Verify your FYP Hub email address',
    heading: `Welcome to FYP Hub, ${name}`,
    intro: 'Please confirm your email address to activate your student account.',
    buttonLabel: 'Verify email address',
    link,
    outro: `This link expires in ${validHours} hours. If you did not create an account, you can ignore this email.`,
  });

export const passwordResetEmail = ({ name, link, validMinutes }) =>
  buildEmail({
    subject: 'Reset your FYP Hub password',
    heading: `Hi ${name}, reset your password`,
    intro: 'We received a request to reset the password for your FYP Hub account.',
    buttonLabel: 'Choose a new password',
    link,
    outro: `This link expires in ${validMinutes} minutes and can be used once. If you did not ask for a reset, you can ignore this email and your password will stay the same.`,
  });
