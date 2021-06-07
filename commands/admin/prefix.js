const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'prefix',
    description: 'Changes the prefix for the current server.',
    aliases: ['pre'],
    usage: '{p}prefix [new prefix]',
    ownerOnly: false,
    requiredPermissions: ['MANAGE_MESSAGES'],

    async execute(client, message, args, prefix) {
        if (!args.length) {
            const embed = new MessageEmbed()
                .setAuthor('Prefix', message.guild.iconURL())
                .setDescription(`The current prefix for this server is \`${prefix}\`.`)
                .setColor(client.config.defaultColor)
                .setFooter(client.config.defaultFooter);
            return message.channel.send(embed);
        } else {
            client.db.set(message.guild.id, args.join(' '));
            const embed = new MessageEmbed()
                .setAuthor('Prefix', message.guild.iconURL())
                .setDescription(`Prefix changed from \`${prefix}\` to \`${args.join(' ')}\`.`)
                .setColor(client.config.defaultColor)
                .setFooter(client.config.defaultFooter);
            return message.channel.send(embed);
        }
    }
};