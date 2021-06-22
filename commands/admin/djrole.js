const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'djrole', // Command name
    description: 'Sets the DJ role for the server.', // Short description of what the command does
    aliases: ['djr'], // An array of alternate commands that trigger the command
    usage: '{p}djrole [newRole]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: ['MANAGE_ROLES'], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    // eslint-disable-next-line no-unused-vars
    async execute(client, message, args, prefix, player) {
        let currentState = await client.db.get(`${message.guild.id}-dj`);
        const role = currentState.role;
        if (!args.length) {
            const currentRole = message.guild.roles.cache.get(role).toString() || 'not set';
            const embed = new MessageEmbed()
                .setAuthor('DJ Role', message.guild.iconURL())
                .setDescription('The DJ role for this server is ' + currentRole)
                .setFooter(client.config.defaultFooter)
                .setColor(client.config.defaultColor);
            return message.channel.send(embed);
        }
        let newRole = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.id === args[0]) || message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());
        if (!newRole) return message.reply('you provided an invalid role.');
        currentState.role = `${newRole.id}`;
        await client.db.set(`${message.guild.id}-dj`, currentState);
        const embed = new MessageEmbed()
            .setAuthor('DJ Role', message.guild.iconURL())
            .setDescription('The DJ role was set to ' + newRole.toString())
            .setFooter(client.config.defaultFooter)
            .setColor(client.config.defaultColor);
        return message.channel.send(embed);
    }
};
