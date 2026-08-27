import nodemailer from 'nodemailer';
import { verificationEmailTemplate } from '../templates/VerificationEmail.template.js';

const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });

export const sendVerificationEmail = async (email: string, verificationCode: string): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) throw new Error('SMTP credentials are not configured.');
  await transporter.sendMail({ from: `"FitPilot AI" <${process.env.SMTP_USER}>`, to: email, subject: 'Your FitPilot AI verification code', html: verificationEmailTemplate(verificationCode) });
};