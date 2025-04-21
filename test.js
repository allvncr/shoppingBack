const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "8ae7ce001@smtp-brevo.com", // pas depuis .env
    pass: "xsmtpsib-8b00ae149972b3583ac79733dbc9332ac9220c8da0a5d51ff4ac10c4f17c784c-7KLN30WDwT1ghQ6X",
  },
});

transporter
  .sendMail({
    from: '"Test direct" <8ae7ce001@smtp-brevo.com>',
    to: "vianneyablo9@gmail.com", // teste en t'envoyant à toi-même
    subject: "✅ Test SMTP direct",
    html: "<p>Ceci est un test direct sans .env</p>",
  })
  .then(() => {
    console.log("✅ Email envoyé avec succès !");
  })
  .catch((err) => {
    console.error("❌ Erreur :", err.message);
  });
