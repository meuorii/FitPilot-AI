import 'dotenv/config';
import { sendVerificationEmail } from '../services/email.service.js';

const testVerificationEmail = async (): Promise<void> => {
  try {
    const testEmail = 'fontillaskian@gmail.com';
    const testCode = '482193';
    console.log('Sending verification email...');
    console.log(`Recipient: ${testEmail}`);
    await sendVerificationEmail(testEmail, testCode);
    console.log('✅ Verification email sent successfully!');
    console.log(`Test code: ${testCode}`);
  } catch (error) {
    console.error('❌ Failed to send verification email.');
    if (error instanceof Error) { console.error(error.message); } else { console.error(error); }
    process.exit(1);
  }
};

testVerificationEmail();