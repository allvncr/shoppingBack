// utils/sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "8ae7ce001@smtp-brevo.com",
    pass: "xsmtpsib-8b00ae149972b3583ac79733dbc9332ac9220c8da0a5d51ff4ac10c4f17c784c-7KLN30WDwT1ghQ6X",
  },
});

async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: '"Reserv@babi" <8ae7ce001@smtp-brevo.com>',
    to,
    subject,
    html,
  });
}

module.exports = sendEmail;
