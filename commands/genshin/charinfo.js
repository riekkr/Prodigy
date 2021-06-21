const { MessageEmbed } = require('discord.js');
const db = require('genshin-db');

module.exports = {
    name: 'charinfo', // Command name
    description: 'Shows information about a Genshin Impact character.', // Short description of what the command does
    aliases: ['ci'], // An array of alternate commands that trigger the command
    usage: '{p}charinfo <CharacterName | CharacterID>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        const query = args[0];
        const c = db.characters(query);
        if (!c) return message.reply('Invalid character');
        const embed = new MessageEmbed()
            .setAuthor()
    }
};