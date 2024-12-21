const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", // Mailtrap's SMTP server
  port: 587, // Use 587 for STARTTLS
  secure: false, // Use STARTTLS
  auth: {
    user: "f7cdeca978835e", // Replace with your Mailtrap credentials
    pass: "94b906313698f8", // Replace with your Mailtrap credentials
  },
  tls: {
    rejectUnauthorized: false, // Allows self-signed certificates (use with caution)
  },
});
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.MAIL_USERNAME,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
