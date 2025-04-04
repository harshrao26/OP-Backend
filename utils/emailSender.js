import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: 587,
        secure: false, // Must be false for Office365
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          ciphers: "SSLv3",
        },
      });
      

    // Optional: debug connection
    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP verify error:", error);
      } else {
        console.log("SMTP server is ready to send emails");
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
};
