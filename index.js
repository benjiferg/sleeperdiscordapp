require('dotenv').config();
const { client, deployCommands } = require('./bot');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
    console.error('Missing DISCORD_TOKEN in environment variables');
    process.exit(1);
}

// Commented out until bot has applications.commands scope
if (clientId && guildId) {
    deployCommands(token, clientId, guildId);
 }

client.login(token);