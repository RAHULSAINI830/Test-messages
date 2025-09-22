// api/app/send.js
const { connect } = require('../../lib/db');
const Thread = require('../../models/Thread');
const Message = require('../../models/Message');

module.exports = async (req, res) => {
  // 1) Only allow POST
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // 2) Parse input
    //    - threadId: which conversation to send into
    //    - text: the message content
    //    - (optional) replyToProviderMessageId: reply threading in Telegram
    const { threadId, text, replyToProviderMessageId } = req.body || {};
    if (!threadId || !text) {
      return res.status(400).json({ ok: false, error: 'threadId and text are required' });
    }

    // 3) Ensure DB connection (cached in serverless)
    await connect();

    // 4) Load the thread record
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ ok: false, error: 'Thread not found' });

    // (Optional) You can enforce user ownership here if you add auth later
    // const user = requireAuth(req, res); if (!user) return;

    // 5) We’re sending only for Telegram for now
    if (thread.provider !== 'telegram') {
      return res.status(400).json({ ok: false, error: `Provider ${thread.provider} not supported yet` });
    }

    // 6) Build Telegram sendMessage request
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const payload = {
      chat_id: thread.providerThreadId,  // we stored the Telegram chat id here
      text: text,
      // parse_mode: 'MarkdownV2',        // optional (be careful to escape special chars)
      // disable_web_page_preview: true,  // optional
    };

    if (replyToProviderMessageId) {
      payload.reply_to_message_id = replyToProviderMessageId; // threads the reply in Telegram UI
      payload.allow_sending_without_reply = true;             // avoid error if source msg missing
    }

    // 7) Call Telegram API (Node 18 has global fetch, no extra lib needed)
    const tgResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());

    // 8) Handle Telegram errors
    if (!tgResp.ok) {
      // Example: { ok:false, error_code:400, description:"Bad Request: chat not found" }
      return res.status(502).json({ ok: false, error: tgResp.description || 'Telegram send failed' });
    }

    // 9) Telegram returned the sent message details
    //    We store it so your DB reflects outgoing messages too.
    const m = tgResp.result;
    const providerMessageId = String(m.message_id);
    const when = new Date((m.date || Math.floor(Date.now() / 1000)) * 1000);

    // 10) Save our outgoing message in Mongo
    await Message.create({
      userId: thread.userId,              // same owner as the thread
      provider: 'telegram',
      providerMessageId,
      threadId: thread._id,
      direction: 'out',                   // <-- outgoing!
      senderName: 'Bot',
      senderId: 'bot',
      text,
      sentAt: when,
      raw: tgResp,                        // full Telegram response for debugging
    });

    // 11) Bump thread’s activity timestamp
    await Thread.updateOne({ _id: thread._id }, { $set: { lastMessageAt: new Date() } });

    // 12) Return success + the Telegram message we just sent
    return res.json({ ok: true, result: tgResp.result });
  } catch (err) {
    console.error('send error', err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
};
