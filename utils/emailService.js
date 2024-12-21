const { Resend } = require("resend");

const resend = new Resend("re_E5gMjRAA_5CiYCRb7nxVBwuY8XRALc285");

const sendEmail = (email, subject, letter) => {
  resend.emails.send({
    from: "noreply@jethings.com",
    to: email,
    subject,
    html: letter,
  });
};

module.exports = sendEmail;
