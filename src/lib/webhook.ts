export const WEBHOOK_URL = "https://webhooks.growave.com.br/webhook/reserva-troia";

export const sendReservationWebhook = async (reservationData: any) => {
  try {
    // Fire and forget
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
      // Optional: if the webhook receiver doesn't support CORS from this domain,
      // mode: "no-cors" could be used, but let's try standard first so we can see errors in console if they occur.
    }).catch((err) => console.error("Erro ao enviar webhook de reserva:", err));
  } catch (error) {
    console.error("Erro interno ao tentar disparar webhook:", error);
  }
};
