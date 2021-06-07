const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'shutdown',
    description: 'Shuts the bot down',
    aliases: ['shut'],
    usage: '{p}shutdown',
    ownerOnly: true,
    requiredPermissions: [],
    
    async execute (client, message) {
        client.logger.warn(`Shutdown requested by ${message.author.tag}`);
        client.db.set('shutdownRequestedBy', message.author.id);
        const embed = new MessageEmbed()
            .setAuthor('Shutting down...', client.user.avatarURL())
            .setColor(client.config.defaultColor)
            .setFooter(client.config.defaultFooter);
        await message.channel.send(embed);
        await process.exit();
    }
};