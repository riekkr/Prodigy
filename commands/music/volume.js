module.exports = {
    name: 'volume', // Command name
    description: 'Sets the volume of the player.', // Short description of what the command does
    aliases: ['vol', 'loud', 'soft'], // An array of alternate commands that trigger the command
    usage: '{p}volume [newVolume]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('There is nothing playing in this server.');
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('You aren\'t in a voice channel.');
        if (channel.id !== player.voiceChannel) return message.reply('You aren\'t in the same voice channel as the bot.');
        if (!player.queue.current) return message.reply('There is nothing playing.');
        if (!player.textChannel) player.textChannel = message.channel.id;
        if (args.length < 1) return message.channel.send(`**Current volume:** \`${player.volume}%\`.`);
        const newVolume = args[0].replace('%', '');
        if (newVolume > 200 || newVolume < 1) return message.channel.send('**Invalid usage:** Volume can only be from **1%** to **200%**.');
        player.setVolume(newVolume);
        return message.react('✅');
    }
};
