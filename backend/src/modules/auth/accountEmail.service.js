import { env } from '../../config/env.js';
import { sendMail } from '../../lib/mailer.js';
import { passwordResetEmail, verificationEmail } from '../../lib/emailTemplates.js';
import { TOKEN_LIFETIME_MINUTES, issueToken } from './authToken.service.js';

const linkTo = (path, token) => `${env.clientUrl}${path}?token=${encodeURIComponent(token)}`;

export async function sendVerificationEmail(user) {
  const token = await issueToken(user.id, 'email_verification');
  const email = verificationEmail({
    name: user.name,
    link: linkTo('/verify-email', token),
    validHours: TOKEN_LIFETIME_MINUTES.email_verification / 60,
  });
  await sendMail({ to: user.email, ...email });
}

export async function sendPasswordResetEmail(user) {
  const token = await issueToken(user.id, 'password_reset');
  const email = passwordResetEmail({
    name: user.name,
    link: linkTo('/reset-password', token),
    validMinutes: TOKEN_LIFETIME_MINUTES.password_reset,
  });
  await sendMail({ to: user.email, ...email });
}
