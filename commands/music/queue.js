const _ = require('lodash');
const prettyms = require('pretty-ms');

module.exports = {
    name: 'queue', // Command name
    description: 'Displays the music in queue for the server.', // Short description of what the command does
    aliases: ['q', 'lq'], // An array of alternate commands that trigger the command
    usage: '{p}queue', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('There is nothing playing in this server.');
        if (!player.queue.current) return message.reply('There is nothing playing.');
        let currentDuration = prettyms(player.queue.current.duration, { colonNotation: true, secondsDecimalDigits: 0 });
        if (player.queue.current.isStream === true) currentDuration = 'LIVE';
        if (player.queue.length < 1) {
            return message.channel.send(`**Now playing:** ${player.queue.current.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')} (<${player.queue.current.uri}>) \`${currentDuration}\`\n\n*No tracks in queue.*`);
        }
        if (!player.textChannel) player.textChannel = message.channel.id;
        const finalMessages = [];
        let chunked = _.chunk(player.queue, 10);
        let totalDuration = prettyms(player.queue.duration, { colonNotation: true, secondsDecimalDigits: 0 });
        if (player.queue.find(s => s.isStream === true)) totalDuration = '∞';
        for (let i = 0; i < chunked.length; i++) {
            let messageArr = [];
            messageArr.push(`**__Queue for ${message.guild.name}__**`);
            messageArr.push(`**Total duration:** \`${totalDuration}\``);
            messageArr.push(`**Now playing:** ${player.queue.current.title} (<${player.queue.current.uri}>) \`${currentDuration}\` | Requested by **${player.queue.current.requester.tag}**\n`);
            for (let e = 0; e < chunked[i].length; e++) {
                let track = chunked[i][e];
                let trackDura = prettyms(track.duration, { colonNotation: true, secondsDecimalDigits: 0 });
                if (track.isStream === true) trackDura = 'LIVE';
                messageArr.push(`**\`${e+10*i+1}\`**: **${track.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** \`${trackDura}\` | Requested by **${track.requester.tag}**`);
            }
            messageArr.push(`\n**${player.queue.length}** tracks in queue | Page **${i+1}** of **${chunked.length}**`);
            let text = messageArr.join('\n');
            finalMessages.push(text);
        }
        let m = await message.channel.send(finalMessages[0]);
        let currentPage = 0;
        await m.react('🔺');
        await m.react('🔻');
        await m.react('🔹');
        const upFilter = (reaction, user) => reaction.emoji.name === '🔺' && user.id === message.author.id;
        const downFilter = (reaction, user) => reaction.emoji.name === '🔻' && user.id === message.author.id;
        const jumpFilter = (reaction, user) => reaction.emoji.name === '🔹' && user.id === message.author.id;
        const collector1 = m.createReactionCollector({ filter: upFilter, time: 5 * 60 * 1000 });
        const collector2 = m.createReactionCollector({ filter: downFilter, time: 5 * 60 * 1000 });
        const collector3 = m.createReactionCollector({ filter: jumpFilter, time: 5 * 60 * 1000 });
        collector1.on('collect', async (reaction, user) => { // Up
            await reaction.users.remove(user.id);
            if (currentPage === 0) {
                await m.edit(finalMessages[finalMessages.length - 1]);
                currentPage = finalMessages.length - 1;
            } else {
                await m.edit(finalMessages[currentPage - 1]);
                currentPage--;
            }
        });
        collector2.on('collect', async (reaction, user) => { // Down
            await reaction.users.remove(user.id);
            if (currentPage === finalMessages.length - 1) {
                await m.edit(finalMessages[0]);
                currentPage = 0;
            } else {
                await m.edit(finalMessages[currentPage + 1]);
                currentPage++;
            }
        });
        collector3.on('collect', async (reaction, user) => { // Jump
            await reaction.users.remove(user.id);
            const msg = await message.channel.send('Which page to jump to?');
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector(filter, { limit: 1, time: 15000 });
            collector.on('collect', ms => {
                if (Number(ms.content) < 1 || Number(ms.content) > chunked.length) {
                    message.reply(`Requires a number from 1 to ${chunked.length}.`).then(mx => mx.delete({ timeout: 10000 }));
                    ms.delete();
                    msg.delete();
                    return;
                }
                m.edit(finalMessages[Number(ms.content) - 1]);
                currentPage = Number(ms.content) - 1;
                collector.stop();
                msg.delete();
                ms.delete();
            });
        });
    }
};
