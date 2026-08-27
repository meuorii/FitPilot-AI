import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (email: string, verificationCode: string): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials are not configured.');
  }

  await transporter.sendMail({
    from: `"FitPilot AI" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your FitPilot AI verification code',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="margin: 0; padding: 0; background: #f5f6f8; font-family: Arial, Helvetica, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 16px; background: #f5f6f8;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 20px; padding: 40px;">
                  <tr>
                    <td align="center">
                      <h2 style="color: #101516; margin-top: 0; margin-bottom: 12px;">Verify your email</h2>
                      <p style="color: #667085; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                        Enter this 6-digit code to verify your FitPilot AI account.
                      </p>
                      <div style="margin: 24px 0; font-size: 38px; font-weight: 700; letter-spacing: 10px; color: #101516;">
                        ${verificationCode}
                      </div>
                      <p style="color: #98A2B3; font-size: 13px; margin: 16px 0 4px 0;">
                        This code expires in 10 minutes.
                      </p>
                      <p style="color: #98A2B3; font-size: 13px; margin: 0;">
                        If you didn't create this account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};