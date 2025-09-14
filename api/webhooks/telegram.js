const { connect } = require('../../lib/db');
const Thread = require('../../models/Thread');
const Message = require('../../models/Message');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const update = req.body || {};
    const msg = update.message || update.edited_message;
    if (!msg) return res.status(200).end();

    await connect();

    const demoUserId = process.env.DEMO_USER_ID;
    const provider = 'telegram';
    const providerThreadId = String(msg.chat.id);
    const providerMessageId = String(msg.message_id);

    // upsert thread
    let thread = await Thread.findOne({ userId: demoUserId, provider, providerThreadId });
    if (!thread) {
      const title =
        msg.chat.title ||
        msg.chat.username ||
        `${msg.chat.first_name || ''} ${msg.chat.last_name || ''}`.trim();
      thread = await Thread.create({
        userId: demoUserId,
        provider,
        providerThreadId,
        title,
        lastMessageAt: new Date((msg.date || Math.floor(Date.now()/1000)) * 1000),
      });
    }

    // save message (ignore duplicate error)
    try {
      await Message.create({
        userId: demoUserId,
        provider,
        providerMessageId,
        threadId: thread._id,
        direction: 'in',
        senderName:
          msg.from?.username ||
          `${msg.from?.first_name || ''} ${msg.from?.last_name || ''}`.trim(),
        senderId: String(msg.from?.id || ''),
        text: msg.text || msg.caption || '',
        sentAt: new Date((msg.date || Math.floor(Date.now()/1000)) * 1000),
        raw: update,
      });
    } catch (e) {
      if (e?.code !== 11000) console.error('Message save error', e);
    }

    await Thread.updateOne({ _id: thread._id }, { lastMessageAt: new Date() });
    res.status(200).end();
  } catch (err) {
    console.error('Webhook error', err);
    res.status(200).end(); // keep Telegram happy; avoids retries
  }
};
