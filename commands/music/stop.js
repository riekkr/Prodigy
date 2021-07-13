module.exports = {
    name: 'stop', // Command name
    description: 'Stops the music for the server', // Short description of what the command does
    aliases: ['st', 'disconnect', 'dc', 'dis'], // An array of alternate commands that trigger the command
    usage: '{p}stop', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('there is nothing playing in this server.');
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('you aren\'t in a voice channel.');
        if (channel.id !== player.voiceChannel) return message.reply('you aren\'t in the same voice channel as the bot.');
        if (!player.textChannel) player.textChannel = message.channel.id;
        player.destroy();
        if (message.channel.lastNowPlayingMessage) message.channel.lastNowPlayingMessage.delete();
        message.channel.lastNowPlayingMessage = false;
        return message.reply('stopped the music.');
    }
};
