// In api/webhooks/discord.js
const { connect } = require('../../lib/db');
const Thread = require('../../models/Thread');
const Message = require('../../models/Message');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let isDbConnected = false;

client.on('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;

  try {
    if (!isDbConnected) {
      await connect();
      isDbConnected = true;
    }

    const demoUserId = process.env.DEMO_USER_ID;
    const provider = 'discord';
    const providerThreadId = String(msg.channel.id);
    const providerMessageId = String(msg.id);

    let thread = await Thread.findOne({ userId: demoUserId, provider, providerThreadId });
    if (!thread) {
      const channel = await client.channels.fetch(msg.channel.id);
      thread = await Thread.create({
        userId: demoUserId,
        provider,
        providerThreadId,
        title: channel.name || 'Discord Chat',
        lastMessageAt: msg.createdAt,
      });
    }

    await Message.create({
      userId: demoUserId,
      provider,
      providerMessageId,
      threadId: thread._id,
      direction: 'in',
      senderName: msg.author.username,
      senderId: String(msg.author.id),
      text: msg.content,
      sentAt: msg.createdAt,
      raw: msg.toJSON(),
    });

    await Thread.updateOne({ _id: thread._id }, { $set: { lastMessageAt: new Date() } });
  } catch (err) {
    console.error('Error processing Discord message:', err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = (req, res) => {
  res.status(200).send('Discord bot is active.');
};