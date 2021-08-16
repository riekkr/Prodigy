const fs = require('fs');
const { Util } = require('discord.js');

module.exports = {
    name: 'changelog', // Command name
    description: 'Shows the changelog for the bot.', // Short description of what the command does
    aliases: ['cl'], // An array of alternate commands that trigger the command
    usage: '{p}changelog', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run
    sameVC: false, // Requires the user to be in the same voice channel as the bot to run the command (Not done)

    async execute(client, message) {
        let changelog = fs.readFileSync('./changelog.txt', 'utf8');
        Util.splitMessage(changelog, { maxLength: 2048, char: '\n', prepend: '```diff\n', append: '```' });
        message.reply(`\`\`\`diff\n${changelog}\n\`\`\``);
    }
};