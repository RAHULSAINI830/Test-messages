// lib/providers/telegram.js
const sendMessage = async (thread, text, replyToProviderMessageId) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const payload = {
    chat_id: thread.providerThreadId,
    text: text,
  };

  if (replyToProviderMessageId) {
    payload.reply_to_message_id = replyToProviderMessageId;
    payload.allow_sending_without_reply = true;
  }

  const tgResp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(r => r.json());

  if (!tgResp.ok) {
    throw new Error(tgResp.description || 'Telegram send failed');
  }

  return tgResp.result;
};

module.exports = { sendMessage };