module.exports = {
    name: 'remove', // Command name
    description: 'Removes a track from the queue', // Short description of what the command does
    aliases: ['rm', 'rmv'], // An array of alternate commands that trigger the command
    usage: '{p}remove <trackIndex|startIndex> [endIndex]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('There is nothing playing in this server.');
        if (!player.queue.current) return message.reply('There is nothing playing.');
        if (isNaN(args[0])) return message.channel.send('**Invalid usage:** Command `remove` requires exactly 1 or 2 integer arguments.');
        if (!player.textChannel) player.textChannel = message.channel.id;
        if (args.length > 1) {
            const startPos = args[0] - 1;
            if (isNaN(args[1])) return message.channel.send('**Invalid usage:** Command `remove` requires exactly 1 or 2 integer arguments.');
            const endPos = args[1] - 1;
            if (args[0] < 1 || args[1] > player.queue.length) return message.channel.send(`**Invalid usage:** Argument \`startIndex\` needs to be more than 0 and argument \`endIndex\` needs to be below ${player.queue.length}.`);
            let q = [...player.queue];
            const numToRm = args[1] - startPos;
            const removedTracks = q.splice(startPos, numToRm);
            const msg = await message.reply(`**Remove these tracks from the queue?**\n${removedTracks.map(t => `\`${t.title}\``).join('\n')}`);
            await msg.react('❌');
            await msg.react('✅');
            const yesFilter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
            const noFilter = (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id;
            const yesCollector = msg.createReactionCollector({ filter: yesFilter, time: 5 * 60 * 1000 });
            const noCollector = msg.createReactionCollector({ filter: noFilter, time: 5 * 60 * 1000 });
            yesCollector.on('collect', async () => {
                await msg.reactions.removeAll();
                player.queue.remove(startPos, endPos + 1);
                await msg.edit(`Removed **${removedTracks.length}** tracks from the queue.`);
            });
            noCollector.on('collect', async () => {
                await msg.reactions.removeAll();
                await msg.edit('Cancelled command.');
            });
        } else {
            if (args[0] > player.queue.length) return message.channel.send(`**Invalid usage:** Command \`remove\` has to have an argument be above 1 and below ${player.queue.length}.`);
            const trackPosition = args[0] - 1;
            const trackRemoved = player.queue[trackPosition];
            const msg = await message.reply(`Remove **${trackRemoved.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** from the queue?`);
            await msg.react('❌');
            await msg.react('✅');
            const yesFilter = (reaction, user) => reaction.emoji.name === '✅' && user.id === message.author.id;
            const noFilter = (reaction, user) => reaction.emoji.name === '❌' && user.id === message.author.id;
            const yesCollector = msg.createReactionCollector({ filter: yesFilter, time: 5 * 60 * 1000 });
            const noCollector = msg.createReactionCollector({ filter: noFilter, time: 5 * 60 * 1000 });
            yesCollector.on('collect', async () => {
                await msg.reactions.removeAll();
                player.queue.remove(trackPosition);
                await msg.edit(`Removed **${trackRemoved.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** from the queue.`);
                client.update(message.guild.id);
            });
            noCollector.on('collect', async () => {
                await msg.reactions.removeAll();
                await msg.edit('Cancelled command.');
            });
        }
    }
};
