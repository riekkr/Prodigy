module.exports = {
    name: 'remove', // Command name
    description: 'Removes a track from the queue', // Short description of what the command does
    aliases: ['rm', 'rmv'], // An array of alternate commands that trigger the command
    usage: '{p}remove <trackIndex>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('there is nothing playing in this server.');
        if (!player.queue.current) return message.reply('there is nothing playing.');
        if (isNaN(args[0])) return message.channel.send('**Invalid usage:** Command `remove` requires exactly 1 integer argument.');
        if (!player.textChannel) player.textChannel = message.channel.id;
        if (args[0] > player.queue.length) return message.channel.send('**Invalid usage:** Command `remove` has to be above 1 and below ' + player.queue.length + '.');
        const trackPosition = args[0] - 1;
        const trackRemoved = player.queue[trackPosition];
        const msg = await message.reply(`remove **${trackRemoved.title}** from the queue?`);
        await msg.react('❌');
        await msg.react('✅');
        const yesFilter = (reaction, user) => reaction.emoji.name == '✅' && user.id === message.author.id;
        const noFilter = (reaction, user) => reaction.emoji.name == '❌' && user.id === message.author.id;
        const yesCollector = msg.createReactionCollector(yesFilter, { time: 5 * 60 * 1000 });
        const noCollector = msg.createReactionCollector(noFilter, { time: 5 * 60 * 1000 });
        yesCollector.on('collect', async () => {
            msg.reactions.removeAll();
            player.queue.remove(trackPosition);
            await msg.edit(`Removed **${trackRemoved.title}** from the queue.`);
            return;
        });
        noCollector.on('collect', async () => {
            msg.reactions.removeAll();
            await msg.edit('Cancelled command.');
            return;
        });
    }
};
