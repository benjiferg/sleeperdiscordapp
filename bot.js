const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const LEAGUE_ID = '1257115106991423488';

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'roster') {
        await handleRosterCommand(interaction);
    } else if (commandName === 'matchup') {
        await handleMatchupCommand(interaction);
    }
});

async function handleRosterCommand(interaction) {
    await interaction.deferReply();

    try {
        const [rosters, users] = await Promise.all([
            getLeagueRosters(LEAGUE_ID),
            getLeagueUsers(LEAGUE_ID)
        ]);

        const userMap = users.reduce((map, user) => {
            map[user.user_id] = user.display_name || user.username;
            return map;
        }, {});

        // Sort rosters by wins (descending), then by points (descending) for tiebreakers
        rosters.sort((a, b) => {
            if (a.settings.wins !== b.settings.wins) {
                return b.settings.wins - a.settings.wins; // Higher wins first
            }
            return b.settings.fpts - a.settings.fpts; // Higher points for tiebreaker
        });

        let response = `**League Standings**\n\n`;

        rosters.forEach((roster, index) => {
            const ownerName = userMap[roster.owner_id] || 'Unknown';
            const teamName = roster.metadata?.team_name || ownerName;
            response += `${index + 1}. **${teamName}** (${ownerName})\n`;
            response += `Record: ${roster.settings.wins}-${roster.settings.losses}`;
            if (roster.settings.ties > 0) response += `-${roster.settings.ties}`;
            response += `\nPoints For: ${roster.settings.fpts}\n\n`;
        });

        await interaction.editReply(response);
    } catch (error) {
        console.error(error);
        await interaction.editReply('Error fetching roster data.');
    }
}

async function handleMatchupCommand(interaction) {
    await interaction.deferReply();

    try {
        const week = await getCurrentWeek();
        
        const [matchups, users, rosters] = await Promise.all([
            getLeagueMatchups(LEAGUE_ID, week),
            getLeagueUsers(LEAGUE_ID),
            getLeagueRosters(LEAGUE_ID)
        ]);

        const userMap = users.reduce((map, user) => {
            map[user.user_id] = user.display_name || user.username;
            return map;
        }, {});

        const rosterMap = rosters.reduce((map, roster) => {
            map[roster.roster_id] = {
                owner: userMap[roster.owner_id] || 'Unknown',
                teamName: roster.metadata?.team_name || userMap[roster.owner_id] || 'Unknown'
            };
            return map;
        }, {});

        let response = `**Week ${week} Matchups**\n\n`;

        const matchupGroups = {};
        matchups.forEach(matchup => {
            if (!matchupGroups[matchup.matchup_id]) {
                matchupGroups[matchup.matchup_id] = [];
            }
            matchupGroups[matchup.matchup_id].push(matchup);
        });

        Object.values(matchupGroups).forEach(group => {
            if (group.length === 2) {
                const team1 = rosterMap[group[0].roster_id];
                const team2 = rosterMap[group[1].roster_id];
                response += `**${team1.teamName}** ${group[0].points || 0} - ${group[1].points || 0} **${team2.teamName}**\n`;
                response += `${team1.owner} vs ${team2.owner}\n\n`;
            }
        });

        await interaction.editReply(response);
    } catch (error) {
        console.error(error);
        await interaction.editReply('Error fetching matchup data.');
    }
}


async function getLeagueRosters(leagueId) {
    const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    return response.data;
}

async function getLeagueUsers(leagueId) {
    const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    return response.data;
}

async function getLeagueMatchups(leagueId, week) {
    const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`);
    return response.data;
}

async function getCurrentWeek() {
    try {
        const response = await axios.get('https://api.sleeper.app/v1/state/nfl');
        return response.data.week;
    } catch (error) {
        console.error('Error fetching NFL state:', error);
        return 3; // fallback to week 3
    }
}

const commands = [
    new SlashCommandBuilder()
        .setName('roster')
        .setDescription('Display league standings sorted by record and points'),
    new SlashCommandBuilder()
        .setName('matchup')
        .setDescription('Display current week matchups')
];

async function deployCommands(token, clientId, guildId) {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
}

module.exports = { client, deployCommands };