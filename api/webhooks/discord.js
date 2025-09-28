// DEBUGGING: Log that the file is running
console.log('Discord webhook file is executing.');

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// DEBUGGING: More detailed ready event
client.on('ready', () => {
  console.log(`SUCCESS: Logged in as ${client.user.tag}! Bot is online and ready.`);
});

client.on('messageCreate', async (msg) => {
  // DEBUGGING: Log that a message event was received
  console.log(`EVENT: Received a messageCreate event from user ID ${msg.author.id}`);

  if (msg.author.bot) {
    console.log('INFO: Message was from a bot. Ignoring.');
    return;
  }

  console.log(`SUCCESS: Processing message from ${msg.author.username}: "${msg.content}"`);
});

// DEBUGGING: Log before attempting to log in
console.log('INFO: Attempting to log in with bot token...');

client.login(process.env.DISCORD_BOT_TOKEN)
  .catch(err => {
    // DEBUGGING: Catch and log any errors during login
    console.error('ERROR: Failed to log in.', err);
  });

module.exports = (req, res) => {
  res.status(200).send('Discord bot is running.');
};