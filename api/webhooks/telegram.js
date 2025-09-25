// api/webhooks/telegram.js
const mongoose = require('mongoose'); // add this import

const { connect } = require('../../lib/db');
const Thread = require('../../models/Thread');
const Message = require('../../models/Message');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const update = req.body || {};
    const msg =
      update.message ||
      update.edited_message ||
      update.channel_post ||
      update.edited_channel_post;

    if (!msg) return res.status(200).json({ ok: true, ignored: true });

    // minimal log for Vercel
    console.log('TG msg:', {
      chatId: msg.chat?.id,
      from: msg.from?.id,
      text: msg.text || msg.caption || '',
    });

    await connect();

   const demoUserId = new mongoose.Types.ObjectId(process.env.DEMO_USER_ID);

    const provider = 'telegram';
    const providerThreadId = String(msg.chat.id);
    const providerMessageId = String(msg.message_id);

    // upsert thread atomically
    const title =
      msg.chat.title ||
      msg.chat.username ||
      `${msg.chat.first_name || ''} ${msg.chat.last_name || ''}`.trim();

    const when = new Date((msg.date || Math.floor(Date.now() / 1000)) * 1000);

    const thread = await Thread.findOneAndUpdate(
      { userId: demoUserId, provider, providerThreadId },
      {
        $setOnInsert: {
          userId: demoUserId,
          provider,
          providerThreadId,
          title,
          lastMessageAt: when,
        },
      },
      { new: true, upsert: true }
    );

    // idempotent message insert (no duplicate error needed)
    await Message.updateOne(
      { provider, providerMessageId }, // unique key
      {
        $setOnInsert: {
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
          sentAt: when,
          raw: update,
        },
      },
      { upsert: true }
    );

    // bump thread activity
    await Thread.updateOne({ _id: thread._id }, { $set: { lastMessageAt: new Date() } });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error', err);
    // still 200 so Telegram doesn’t keep retrying
    return res.status(200).json({ ok: true });
  }
};
