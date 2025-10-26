import nodemailer from "nodemailer";
import { emailAccounts, emailCounters, DAILY_LIMIT } from './emailPool';

// Move your sendEmail function here
export async function sendEmail(to: string, subject: string, text: string, html: string) {
  try {
    const { transporter, index, user } = getAvailableTransporter();

    const mailOptions = {
      from: user,
      to,
      subject,
      text,
      html
    };

    await transporter.sendMail(mailOptions);
    emailCounters[index]++;
    console.log(`Email sent successfully using ${user}. Total sent: ${emailCounters[index]}`);
  } catch (error: any) {
    console.error('Error sending email:', error.message || error);
    throw error;
  }
}

// If you have a getAvailableTransporter function, move that here too
function getAvailableTransporter() {
  for (let i = 0; i < emailAccounts.length; i++) {
    if (emailCounters[i] < DAILY_LIMIT) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailAccounts[i].user,
          pass: emailAccounts[i].pass
        }
      });
      return { transporter, index: i, user: emailAccounts[i].user };
    }
  }
  throw new Error('All email accounts have reached the daily limit.');
}