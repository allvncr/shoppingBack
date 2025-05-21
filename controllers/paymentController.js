const axios = require("axios");

// exports.initierPaiement = async (req, res) => {
//   const { amount, customer_name, customer_email } = req.body;
//   const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY;

//   try {
//     // 1. Créer la transaction
//     const creation = await axios.post(
//       "https://sandbox-api.fedapay.com/v1/transactions",
//       {
//         amount: Number(amount),
//         description: "Paiement de réservation",
//         callback_url: "https://desymtech.net/",
//         currency: {
//           iso: "XOF",
//         },
//         customer: {
//           firstname: customer_name || "Client",
//           email: customer_email || "email@example.com",
//         },
//         description: "Paiement de test",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${FEDAPAY_SECRET_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const transactionId = creation.data["v1/transaction"].id;

//     // 2. Obtenir le lien de paiement
//     const tokenRes = await axios.post(
//       `https://sandbox-api.fedapay.com/v1/transactions/${transactionId}/token`,
//       {},
//       { headers: { Authorization: `Bearer ${FEDAPAY_SECRET_KEY}` } }
//     );

//     const payment_url = tokenRes.data?.url;

//     res.json({ payment_url });
//   } catch (err) {
//     console.error("Erreur FedaPay :", err.response?.data || err.message);
//     res.status(500).json({ error: "Échec lors de la génération du paiement" });
//   }
// };

exports.initierPaiement = async (req, res) => {
  const { amount, customer_name, customer_email } = req.body;

  try {
    const { CINETPAY_API_KEY, CINETPAY_SITE_ID } = process.env;

    // Préparer les données pour l'initialisation du paiement
    const data = {
      apikey: CINETPAY_API_KEY,
      site_id: CINETPAY_SITE_ID,
      transaction_id: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      amount: amount,
      currency: "XOF",
      description: "Paiement de réservation",
      // return_url: "https://desymtech.net/",
      // notify_url: "https://desymtech.net/cinetpay-webhook",
      customer_name: customer_name || "Client",
      customer_email: customer_email || "email@example.com",
      channels: "ALL",
    };

    // Appel à l'API CinetPay pour initier le paiement
    const response = await axios.post(
      "https://api-checkout.cinetpay.com/v2/payment",
      data,
      { headers: { "Content-Type": "application/json" } }
    );

    const payment_url = response.data.data.payment_url;

    res.json({ payment_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Échec lors de la génération du paiement" });
  }
};

exports.fedapayWebhook = async (req, res) => {
  try {
    const event = req.body;

    console.log("📬 Webhook FedaPay reçu :", event);

    const transaction = event.data;

    // Exemple de vérification : statut "approved"
    if (transaction.status === "approved") {
      const transactionId = transaction.id;
      const amount = transaction.amount;

      // 🔄 Ici tu peux mettre à jour ta base de données :
      // await Reservation.findOneAndUpdate({ transactionId }, { status: 'Payée' });

      console.log(`✅ Paiement validé pour transaction ${transactionId}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Erreur webhook FedaPay :", err);
    res.sendStatus(500);
  }
};
