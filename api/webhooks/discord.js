const { Client, GatewayIntentBits } = require('discord.js');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Add our event listeners
client.on('ready', () => {
  console.log(`SUCCESS: Bot is ready and logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (msg) => {
  if (msg.author.bot) return;
  console.log(`MESSAGE from ${msg.author.username}: ${msg.content}`);
});

// Log in to Discord with your client's token
const startBot = async () => {
  try {
    console.log("Attempting to log in the bot...");
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.error("Error logging in:", error);
  }
};

// Start the bot only if it's not already running
if (!client.isReady()) {
    startBot();
}

// This is the part Vercel will run when someone visits the webhook URL.
// It just confirms the bot's login status.
module.exports = (req, res) => {
  if (client.isReady()) {
    res.status(200).send(`Bot is logged in as ${client.user.tag}`);
  } else {
    res.status(500).send('Bot is not logged in or is starting.');
  }
};
