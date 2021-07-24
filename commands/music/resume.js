module.exports = {
    name: 'resume', // Command name
    description: 'Resumes the music if paused.', // Short description of what the command does
    aliases: ['res'], // An array of alternate commands that trigger the command
    usage: '{p}resume', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('there is nothing playing in this server.');
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('you aren\'t in a voice channel.');
        if (channel.id !== player.voiceChannel) return message.reply('you aren\'t in the same voice channel as the bot.');
        if (!player.queue.current) return message.reply('there is nothing playing.');
        if (player.paused === false) return message.reply('the player is not paused.');
        if (!player.textChannel) player.textChannel = message.channel.id;
        let vc = message.guild.channels.cache.find(c => c.id === player.voiceChannel);
        player.pause(false);
        client.update(message.guild.id);
        return message.channel.send(`Resumed **${player.queue.current.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** in **${vc.name}**.`);
    }
};