const { MessageEmbed } = require('discord.js');
const queryURL = 'https://api.ksoft.si/lyrics/search';
const _ = require('lodash');
const fetch = require('node-fetch');

module.exports = {
    name: 'lyrics', // Command name
    description: 'Shows lyrics for the currently playing song or a query.', // Short description of what the command does
    aliases: ['ly'], // An array of alternate commands that trigger the command
    usage: '{p}lyrics [query] [-i (searches inside lyrics)]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        let query;
        let textonly = false;
        if (!args.length) {
            if (!player) return message.reply('There is nothing playing in this server. Please provide a query.');
            if (!player.queue.current) return message.reply('There is nothing playing. Please provide a query.');
            query = player.queue.current.title;
        } else {
            if (args.includes('-i')) {
                let index = args.findIndex(q => q.includes('-i'));
                args.splice(index, 1);
                textonly = true;
            } 
            query = args.join(' ');
        }
        let res = await fetch(`${queryURL}?q=${encodeURI(query)}&text_only=${textonly}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${client.config.ksoft}` }
        });
        res = await res.json();
        res = res.data;
        const lyrics = res[0];
        const raw = lyrics.lyrics.split('\n');
        const arrays = _.chunk(raw, 30);
        let pages = [];
        for (const item of arrays) {
            pages.push(item.join('\n'));
        }
        let final = [];
        let currentPage = 0;
        for (let i = 0; i < pages.length; i++) {
            const embed = new MessageEmbed()
                .setAuthor(lyrics.artist)
                .setTitle(lyrics.name)
                .setURL(lyrics.url)
                .setThumbnail(lyrics.album_art)
                .setColor(client.config.defaultColor)
                .setFooter(`Page ${i + 1} of ${pages.length} | ${client.config.defaultFooter}`)
                .setDescription(pages[i]);
            final.push(embed);
        }
        let msg = await message.channel.send({ embeds: [final[0]] });
        await msg.react('🔺');
        await msg.react('🔻');
        const upFilter = (reaction, user) => reaction.emoji.name === '🔺' && user.id === message.author.id;
        const downFilter = (reaction, user) => reaction.emoji.name === '🔻' && user.id === message.author.id;
        const collector1 = msg.createReactionCollector({ filter: upFilter, time: 10 * 60 * 1000 });
        const collector2 = msg.createReactionCollector({ filter: downFilter, time: 10 * 60 * 1000 });
        collector1.on('collect', async (reaction, user) => { // Up
            await reaction.users.remove(user.id);
            if (currentPage === 0) {
                await msg.edit({ embed: final[final.length - 1] });
                currentPage = final.length - 1;
            } else {
                await msg.edit({ embed: final[currentPage - 1] });
                currentPage--;
            }
        });
        collector2.on('collect', async (reaction, user) => { // Down
            await reaction.users.remove(user.id);
            if (currentPage === final.length - 1) {
                await msg.edit({ embed: final[currentPage + 1] });
                currentPage = 0;
            } else {
                await msg.edit({ embed: final[currentPage + 1] });
                currentPage++;
            }
        });
    }
};