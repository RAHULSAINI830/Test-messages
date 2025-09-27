// In lib/providers/discord.js
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.login(process.env.DISCORD_BOT_TOKEN);

const sendMessage = async (thread, text) => {
  try {
    const channel = await client.channels.fetch(thread.providerThreadId);
    if (channel) {
      const message = await channel.send(text);
      return message.toJSON();
    }
    throw new Error('Discord channel not found');
  } catch (error) {
    console.error('Discord send message error:', error);
    throw new Error('Failed to send message to Discord');
  }
};

module.exports = { sendMessage };