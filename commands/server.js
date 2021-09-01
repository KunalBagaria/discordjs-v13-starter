const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Display info about this server.'),
	async execute(interaction) {
		interaction.reply({ embeds: [
			new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`Server Name: ${interaction.guild.name}`)
				.setDescription(`Total members: ${interaction.guild.memberCount}`)
		] });
	},
};