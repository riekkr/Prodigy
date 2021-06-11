const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'help', // Command name
    description: 'Shows a list of commands', // Short description of what the command does
    aliases: ['h', 'hlp', 'commands'], // An array of alternate commands that trigger the command
    usage: '{p}help [command]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix) {
        if (args.length > 0) {
            const name = args[0];
            let command;
            if (client.commands.has(name)) {
                command = client.commands.get(name);
            } else if (client.commands.find(c => c.aliases.includes(name))) {
                command = client.commands.find(c => c.aliases.includes(name));
            }
            if (!command) return message.reply('that\'s not a valid command.');
            let av;
            if (command.dj == true && command.ownerOnly == true) {
                av = 'Owner only and requires DJ role when DJ mode is on';
            } else if (command.dj == true && !command.ownerOnly) {
                av = 'Requires DJ role when DJ mode is on';
            } else if (!command.dj && command.ownerOnly == true) {
                av = 'Owner only';
            }
            const inf = new MessageEmbed()
                .setColor(client.config.defaultColor)
                .setFooter(client.config.defaultFooter)
                .setAuthor('Prodigy | Help')
                .setTitle('Command Information')
                .setDescription(`Detailed information about the \`${command.name}\` command`)
                .addFields([
                    {
                        name: 'Name',
                        value: `\`${command.name}\``
                    },
                    {
                        name: 'Description',
                        value: command.description
                    },
                    {
                        name: 'Aliases',
                        value: '`' + command.aliases.join('`, `') + '`'
                    },
                    {
                        name: 'Example usage',
                        value: `\`${command.usage.replace('{p}', prefix)}\``
                    },
                    {
                        name: 'Availability',
                        value: av
                    },
                    {
                        name: 'Required permissions',
                        value: `\`${command.requiredPermissions.forEach(permission => permission.replace('_', ' ').join('`, `')) || 'None'}\``
                    }
                ]);
            message.channel.send(inf);
        } else {
            const embed = new MessageEmbed()
                .setColor(client.config.defaultColor)
                .setFooter(client.config.defaultFooter, client.user.avatarURL())
                .setAuthor('Prodigy | Help', )
                .setTitle('Commands')
                .setDescription(`Prodigy is a Discord bot mainly written for music, created by tkkr#7552.\nFor more information, use \`${prefix}info\`.\nFor more information about a command, use \`${prefix}help\``)
                .addFields([
                    {
                        name: 'Admin',
                        value: '`' + client.commands.filter(cmd => cmd.category == 'admin').map(c => c.name).join('`, `') + '`'
                    },
                    {
                        name: 'Informative',
                        value:  '`' + client.commands.filter(cmd => cmd.category == 'info').map(c => c.name).join('`, `') + '`'
                    },
                    {
                        name: 'Music',
                        value: '`' + client.commands.filter(cmd => cmd.category == 'music').map(c => c.name).join('`, `') + '`'
                    },
                    {
                        name: 'Owner',
                        value: '`' + client.commands.filter(cmd => cmd.category == 'owner').map(c => c.name).join('`, `') + '`'
                    }
                ]);
            return message.channel.send(embed);
        }
    }
};