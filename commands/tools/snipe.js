const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'snipe', // Command name
    description: 'Shows the recently deleted message.', // Short description of what the command does
    aliases: ['sni'], // An array of alternate commands that trigger the command
    usage: '{p}snipe', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message) {
        const msg = client.snipes.get(message.channel.id);
        if (!msg) return message.reply('no recently deleted messages saved in cache.');
        const embed = new MessageEmbed()
            .setAuthor(msg.author.tag, msg.author.avatarURL())
            .setColor(client.config.defaultColor)
            .setFooter(client.config.defaultFooter)
            .setDescription(msg.content)
            .setImage(msg.image);
        return message.channel.send(embed);
    }
};