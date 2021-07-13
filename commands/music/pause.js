module.exports = {
    name: 'pause', // Command name
    description: 'Pauses the music.', // Short description of what the command does
    aliases: ['pa'], // An array of alternate commands that trigger the command
    usage: '{p}pause', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('there is nothing playing in this server.');
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('you aren\'t in a voice channel.');
        if (channel.id !== player.voiceChannel) return message.reply('you aren\'t in the same voice channel as the bot.');
        if (!player.queue.current) return message.reply('there is nothing playing.');
        if (!player.textChannel) player.textChannel = message.channel.id;
        if (player.paused == true) {
            message.reply('the player is already paused. Resuming.');
            player.pause(false);
            return;
        } else {
            let vc = message.guild.channels.cache.find(c => c.id == player.voiceChannel);
            player.pause(true);
            return message.channel.send(`Paused **${player.queue.current.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** in **${vc.name}**.`);
        }
    }
};
