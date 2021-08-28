const fs = require('fs');
const {
	REST
} = require('@discordjs/rest');
const {
	Routes
} = require('discord-api-types/v9');
// Require the necessary discord.js classes
const {
	Client,
	Intents,
	Collection
} = require('discord.js');

// Create a new client instance
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]
});

// Loading commands from the commands folder
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Loading the token from .env file
const dotenv = require('dotenv');
const envFILE = dotenv.config();
const token = process.env.TOKEN || envFILE.TOKEN;

// Edit your clientId and guildId here in this file
const { clientId, guildId } = require('./config.json');

client.commands = new Collection();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	const rest = new REST({
		version: '9'
	}).setToken(token);
	(async () => {
		try {
			if (!envFILE.TOKEN) {
				await rest.put(
					Routes.applicationCommands(clientId), {
						body: commands
					},
				);
			} else {
				await rest.put(
					Routes.applicationGuildCommands(clientId, guildId), {
						body: commands
					},
				);
			}
			console.log('Successfully registered application commands.');
		} catch (error) {
			console.error(error);
		}
	})();
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// Login to Discord with your client's token
client.login(token);
