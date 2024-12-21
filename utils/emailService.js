const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API);

const sendEmail = (email, subject, letter) => {
  resend.emails.send({
    from: process.env.MAIL_FROM,
    to: email,
    subject,
    html: letter,
  });
};

module.exports = sendEmail;
