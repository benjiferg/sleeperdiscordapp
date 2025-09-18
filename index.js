require('dotenv').config();
const { client, deployCommands } = require('./bot');
const express = require('express');

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

// Add a simple HTTP server to prevent Railway from stopping the container
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ status: 'Bot is running!', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});

client.login(token);