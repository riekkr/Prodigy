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
        if (!player) return message.reply('there is nothing playing in this server.');
        if (!player.queue.current) return message.reply('there is nothing playing.');
        if (player.queue.length < 1) {
            return message.channel.send(`**Now playing:** ${player.queue.current.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')} (<${player.queue.current.uri}>) \`${prettyms(player.queue.current.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\`\n\n*No tracks in queue.*`);
        }
        if (!player.textChannel) player.textChannel = message.channel.id;
        const finalMessages = [];
        let chunked = _.chunk(player.queue, 10);
        let totalDuration = player.queue.duration;
        for (let i = 0; i < chunked.length; i++) {
            let text;
            let messageArr = [];
            messageArr.push(`**__Queue for ${message.guild.name}__**`);
            messageArr.push(`**Total duration:** \`${prettyms(totalDuration, { colonNotation: true, secondsDecimalDigits: 0 })}\``);
            messageArr.push(`**Now playing:** ${player.queue.current.title} (<${player.queue.current.uri}>) \`${prettyms(player.queue.current.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\` | Requested by **${player.queue.current.requester.tag}**\n`);
            for (let e = 0; e < chunked[i].length; e++) {
                let track = chunked[i][e];
                messageArr.push(`**\`${e+(10*i)+1}\`**: **${track.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** \`${prettyms(track.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\` | Requested by **${track.requester.tag}**`);
            }
            messageArr.push(`\n**${player.queue.length}** tracks in queue | Page **${i+1}** of **${chunked.length}**`);
            text = messageArr.join('\n');
            finalMessages.push(text);
        }
        let m = await message.channel.send(finalMessages[0]);
        let currentPage = 1;
        await m.react('🔺');
        await m.react('🔻');
        await m.react('🔹');
        const upFilter = (reaction, user) => reaction.emoji.name == '🔺' && user.id === message.author.id;
        const downFilter = (reaction, user) => reaction.emoji.name == '🔻' && user.id === message.author.id;
        const jumpFilter = (reaction, user) => reaction.emoji.name == '🔹' && user.id === message.author.id;
        const collector1 = m.createReactionCollector(upFilter, { time: 5 * 60 * 1000 });
        const collector2 = m.createReactionCollector(downFilter, { time: 5 * 60 * 1000 });
        const collector3 = m.createReactionCollector(jumpFilter, { time: 5 * 60 * 1000 });
        collector1.on('collect', async (reaction, user) => { // Up
            reaction.users.remove(user.id);
            await m.edit(finalMessages[currentPage-1]);
            currentPage--;
        });
        collector2.on('collect', async (reaction, user) => { // Down
            reaction.users.remove(user.id);
            await m.edit(finalMessages[currentPage]);
            currentPage++;
        });
        collector3.on('collect', async (reaction, user) => { // Jump
            reaction.users.remove(user.id);
            const msg = await message.channel.send('Which page to jump to?');
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector(filter, { limit: 1, time: 15000 });
            collector.on('collect', ms => {
                if (Number(ms.content) < 1 || Number(ms.content) > chunked.length) {
                    message.reply('requires a number from 1 to ' + chunked.length + '.').then(mx => mx.delete({ timeout: 10000 }));
                    ms.delete();
                    msg.delete();
                    return;
                }
                m.edit(finalMessages[Number(ms.content) - 1]);
                currentPage = Number(ms.content);
                collector.stop();
                msg.delete();
                ms.delete();
            });
        });
    }
};