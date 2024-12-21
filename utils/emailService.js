const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 25,
  secure: false,
  auth: {
    user: "f7cdeca978835e",
    pass: "94b906313698f8",
    authMethod: "PLAIN",
  },
  tls: {
    // Ensure compatibility with various TLS versions
    minVersion: "TLSv1.2", // Adjust this as needed (TLSv1.2 is commonly supported)
    ciphers: "SSLv3",
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
