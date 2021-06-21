const { MessageEmbed } = require('discord.js');
const { util } = require('genshin-kit');

module.exports = {
    name: 'genshinuser', // Command name
    description: 'Shows stats of a Genshin Impact user by user ID.', // Short description of what the command does
    aliases: ['genusr', 'gu', 'genshin', 'genshinusr'], // An array of alternate commands that trigger the command
    usage: '{p}genshinuser <UID>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run
    
    /* eslint-disable no-unreachable */
    async execute(client, message, args) {
        return message.reply('this command is disabled.');
        if (!args.length) return message.channel.send('**Invalid usage:** Command `genshinuser` requires exactly 1 integer argument.');
        if (!util.isValidOsUid(args[0])) return message.channel.send('**Invalid usage:** Invalid UID provided.');
        const api = client.genshin; 
        const info = await api.getUserInfo(args[0]);
        const chars = await api.getAllCharacters(args[0]);
        console.log(chars);
        for (let i = 0; i < chars.length; i++) {
            console.log(chars[i]);
        }
    }
};
