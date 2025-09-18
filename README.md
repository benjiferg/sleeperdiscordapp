# Snowdash - Sleeper Fantasy Football Discord Bot

A Discord bot that integrates with the Sleeper API to provide fantasy football league information directly in your Discord server.

## Features

- `/roster` - Display league rosters with team names, owners, records, and points
- `/matchup` - Show current week matchups with scores and team names

## Setup

### Prerequisites

- Node.js (v16 or higher)
- A Discord application and bot token
- A Sleeper fantasy football league

### Installation

1. Clone this repository or download the files
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in your Discord bot credentials in the `.env` file:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord application client ID
   - `GUILD_ID`: Your Discord server ID (for slash commands)

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token to your `.env` file
5. Go to the "General Information" section and copy the Application ID to your `.env` file as CLIENT_ID
6. Get your Discord server ID (right-click server name → Copy Server ID) and add it as GUILD_ID
7. Invite the bot to your server with the following permissions:
   - Send Messages
   - Use Slash Commands

### Running the Bot

```bash
node index.js
```

The bot will automatically register the slash commands and start listening for interactions.

## Configuration

The bot is currently configured to use the Sleeper username "benjiferg". To change this, modify the `SLEEPER_USERNAME` constant in `bot.js`.

The bot uses the 2024 NFL season by default. Update `CURRENT_SEASON` in `bot.js` if needed.

## Commands

- `/roster` - Shows all team rosters in your league with owner names, team names, records, and total points
- `/matchup` - Displays the current week's matchups with live scores

## Notes

- The bot uses the first league found for the configured Sleeper username
- Week calculation is automatic based on the current date and 2024 NFL season start
- Team names are pulled from Sleeper metadata, falling back to owner display names