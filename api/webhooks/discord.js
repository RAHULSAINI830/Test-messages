const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When the bot successfully logs in, print a message to the console
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// NEW: This block runs every time a new message is created in any channel
client.on('messageCreate', async (msg) => {
  // We don't want the bot to reply to itself or other bots, so we add this check
  if (msg.author.bot) return;

  // For testing, let's log the message content and author to the Vercel logs
  console.log(`Received message from ${msg.author.username}: "${msg.content}"`);
});

// Use the token from Vercel's environment variables to log in
client.login(process.env.DISCORD_BOT_TOKEN);

// Export a handler for Vercel to keep the function running
module.exports = (req, res) => {
  res.status(200).send('Discord bot is running.');
};