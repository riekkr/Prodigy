const got = require('got');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'shorten', // Command name
    description: 'Shortens a URL.', // Short description of what the command does
    aliases: ['sh', 'short'], // An array of alternate commands that trigger the command
    usage: '{p}shorten <longURL> [shortURL]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (!args.length) return message.channel.send('**Invalid usage:** Command `shorten` requires one or more string arguments.');
        let longURL = args[0];
        let shortened = args[1].replace('https://prdg.tk/', '').replace('http://prdg.tk/', '') || undefined;
        const options = {
            method: 'POST',
            url: 'https://api.short.io/links',
            headers: {
                authorization: client.config.short
            },
            json: {
                originalURL: longURL,
                domain: 'prdg.tk',
                path: shortened
            },
            responseType: 'json'
        };
        got(options).catch(err => {
            if (err.message.includes('400')) {
                return message.reply('short URL already exists. Try again with a different shortened name.');
            }
        }).then(res => {
            res = res.body; 
            const embed = new MessageEmbed()
                .setAuthor('Link shortened')
                .setDescription(`Successfully shortened your URL.\n**${res.shortURL || `https://prdg.tk/${shortened}`}**`)
                .setColor(client.config.defaultColor)
                .setFooter(client.config.defaultFooter);
            return message.channel.send(embed);
        });
    }
};