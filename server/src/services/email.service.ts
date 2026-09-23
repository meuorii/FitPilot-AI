import dns from 'node:dns';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { env } from '../config/env.js';
import { verificationEmailTemplate } from '../templates/VerificationEmail.template.js';

// Force DNS resolution to IPv4 only for SMTP connections.
// Render has no outbound IPv6 route. Node 18.13+ uses Happy Eyeballs
// (autoSelectFamily) by default, which still attempts IPv6 connections
// even with dns.setDefaultResultOrder('ipv4first') set globally — that
// setting only reorders results, it doesn't exclude IPv6. Passing a
// custom `lookup` that only resolves the A record removes IPv6 from
// the equation entirely, so there's nothing for autoSelectFamily to
// race against.
const ipv4OnlyLookup: NonNullable<SMTPTransport.Options['lookup']> = (
  hostname,
  options,
  callback,
) => {
  dns.lookup(hostname, { family: 4 }, callback);
};

const getTransporter = () => {
  if (!env.SMTP_USER || !env.SMTP_PASSWORD) {
    throw new Error('SMTP_USER and SMTP_PASSWORD are not configured.');
  }

  const smtpConfig: SMTPTransport.Options = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    lookup: ipv4OnlyLookup,
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