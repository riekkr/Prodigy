const Discord = require('discord.js');

module.exports = async (client, message) => {
    const config = client.config;
    if (!message.guild) {
        return client.log(0, `DM from ${message.author.tag}: ${message.content}`);
    }
    if (message.author.bot) return;
    let prefix;
    const pl = await client.db.get('pl');
    const guildPrefix = await client.db.get(message.guild.id);
    if (message.content.startsWith(config.globalPrefix)) {
        if (typeof guildPrefix == 'undefined') {
            prefix = config.globalPrefix;
        } else {
            return;
            // prefix = config.globalPrefix
        }
    } else if (message.content.startsWith(guildPrefix)) {
        prefix = guildPrefix;
    }
    if (!message.content.startsWith(prefix) && pl.includes(message.channel.id)) {
        if (config.blacklist.includes(message.author.id)) return message.reply('you are blacklisted from using commands.');
        const specArgs = message.content.split(/ +/);
        const commandName = specArgs.shift().toLowerCase();
        if (client.commands.filter(c => c.category === 'music').get(commandName) || client.commands.filter(c => c.category === 'music').find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) {
            const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            const player = client.manager.get(message.guild.id);
            command.execute(client, message, specArgs, prefix, player, true);
            return;
        }
        const command = client.commands.get('play');
        command.execute(client, message, message.content.split(/ +/), undefined, undefined, true);
        await message.delete();
        return;
    }
    if (!prefix) return;
    let args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) {
        if (config.unknownCommandMessage) {
            const unknownCommandEmbed = new Discord.MessageEmbed()
                .setAuthor('Unknown command')
                .setDescription(`Command \`${commandName}\` was not found.\nUse \`${prefix || guildPrefix || config.globalPrefix}help\` for a full list of commands.`)
                .setFooter(config.defaultFooter)
                .setColor('RED');
            message.channel.send(unknownCommandEmbed);
        } else {
            return;
        }
    }

    const locked = await client.db.get('locked');
    if (!locked) {
        await client.db.set('locked', { state: false, reason: 'none' });
    }
    if (locked.state === true && !config.owners.includes(message.author.id)) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('Error')
            .setDescription(`An error occurred while executing the command:\n\`All commands are currently disabled. (${locked.reason})\``)
            .setColor('RED')
            .setFooter(config.defaultFooter);
        message.channel.send(embed);
        return;
    }

    if (command.ownerOnly === true) {
        if (!config.owners.includes(message.author.id) && !config.secOwners.includes(message.author.id)) {
            const embed = new Discord.MessageEmbed()
                .setAuthor('Error')
                .setDescription('An error occurred while executing the command:\n`This command is restricted to the owners of the bot.`')
                .setColor('RED')
                .setFooter(config.defaultFooter);
            message.channel.send(embed);
            return;
        }
    }

    if (command.requiredPermissions.length > 0) {
        const arrLen = command.requiredPermissions.length;
        for (let i = 0; i < arrLen; i++) {
            if (!message.member.hasPermission(command.requiredPermissions[i]) && !client.config.owners.includes(message.author.id)) {
                const embed = new Discord.MessageEmbed()
                    .setAuthor('Error')
                    .setDescription(`An error occurred while executing the command:\n\`You do not have the ${command.requiredPermissions[i]} permission.\``)
                    .setColor('RED')
                    .setFooter(config.defaultFooter);
                message.channel.send(embed);
                return;
            }
        }
    }

    const dj = await client.db.get(`${message.guild.id}-dj`);
    if (!dj) {
        message.reply('creating initial configuration.');
        await client.db.set(`${message.guild.id}-dj`, { state: false, role: undefined });
        return;
    }
    const rle = message.guild.roles.cache.find(r => r.id === dj.role);

    if (dj.state === true && !message.member.roles.cache.has(dj.role) && !client.config.owners.includes(message.author.id)) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('Error')
            .setDescription(`An error occurred while executing the command:\n\`DJ only mode is on and you do not have the DJ role. (${rle.name} | ${rle.id})\``)
            .setColor('RED')
            .setFooter(config.defaultFooter);
        message.channel.send(embed);
        // console.log(dj.role);
        return;
    }
    if (config.blacklist.includes(message.author.id)) return message.reply('you are blacklisted from using commands.');

    try {
        const player = client.manager.get(message.guild.id);
        command.execute(client, message, args, prefix, player);
        client.log(0, `${message.author.tag} ran command ${command.name} in ${message.guild.name}`);
    } catch (err) {
        client.log(2, err);
        const errorEmbed = new Discord.MessageEmbed()
            .setAuthor('Error')
            .setDescription('**An unknown error has occurred.**\nA bug report has been sent to my owners.')
            .setColor('RED')
            .setFooter(config.defaultFooter);
        message.channel.send(errorEmbed);
        const reportEmbed = new Discord.MessageEmbed()
            .setAuthor('Error')
            .setDescription(`\`\`\`${err}\`\`\``)
            .addField('Command', command.name)
            .addField('User', message.author.toString())
            .addField('Server', message.guild.name);
        for (let i = 0; i < client.config.owners.length; i++) {
            const user = client.users.cache.find(u => u.id === client.config.owners[i]);
            user.send(reportEmbed);
        }
    }
};
