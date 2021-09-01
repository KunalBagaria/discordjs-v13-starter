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
	intents: [Intents.FLAGS.GUILDS]
});

// Loading commands from the commands folder
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Loading the token from .env file
const dotenv = require('dotenv');
const envFILE = dotenv.config();
const TOKEN = process.env['TOKEN'];


// Edit your TEST_GUILD_ID here in the env file for development
const TEST_GUILD_ID = envFILE.parsed['TEST_GUILD_ID'];


// Creating a collection for commands in client
client.commands = new Collection();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	// Registering the commands in the client
	const CLIENT_ID = client.user.id;
	const rest = new REST({
		version: '9'
	}).setToken(TOKEN);
	(async () => {
		try {
			if (!TEST_GUILD_ID) {
				await rest.put(
					Routes.applicationCommands(CLIENT_ID), {
						body: commands
					},
				);
				console.log('Successfully registered application commands globally');
			} else {
				await rest.put(
					Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
						body: commands
					},
				);
				console.log('Successfully registered application commands for development guild');
			}
		} catch (error) {
			if (error) console.error(error);
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
		if (error) console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// Login to Discord with your client's token
client.login(TOKEN);