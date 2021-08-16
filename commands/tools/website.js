const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'website', // Command name
    description: 'Takes a screenshot of a specified webpage and sends it back to you.', // Short description of what the command does
    aliases: ['screenshot', 'ss', 'site', 'web'], // An array of alternate commands that trigger the command
    usage: '{p}website <url>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run
    sameVC: false, // Requires the user to be in the same voice channel as the bot to run the command (Not done)

    async execute(client, message, args) {
        return message.reply('This command is currently not ready for use.');
    }
};