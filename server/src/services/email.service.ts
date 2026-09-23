import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '../config/env.js';
import { verificationEmailTemplate } from '../templates/VerificationEmail.template.js';

const getTransporter = () => {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    throw new Error('SMTP_USER and SMTP_PASSWORD are not configured.');
  }

  const smtpConfig: SMTPTransport.Options & { family?: number } = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  };

  return nodemailer.createTransport(smtpConfig);
};

export const verifyEmailTransport = async (): Promise<void> => {
  const transporter = getTransporter();
  await transporter.verify();
  console.log('[EMAIL] Gmail SMTP connection verified over IPv4.');
  transporter.close();
};

export const sendVerificationEmail = async (
  email: string,
  verificationCode: string,
): Promise<void> => {
  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: `"FitPilot AI" <${env.SMTP_USER}>`,
      to: email,
      subject: 'Your FitPilot AI verification code',
      html: verificationEmailTemplate(verificationCode),
    });

    console.log(`[EMAIL] Verification email sent to ${email}`);
  } finally {
    transporter.close();
  }
};