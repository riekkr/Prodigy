module.exports = {
    name: 'skip', // Command name
    description: 'Skips the currently playing track', // Short description of what the command does
    aliases: ['sk', 's'], // An array of alternate commands that trigger the command
    usage: '{p}skip', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true,

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('There is nothing playing in this server.');
        const channel = message.member.voice.channel;
        if (!channel) return message.reply('You aren\'t in a voice channel.');
        if (channel.id !== player.voiceChannel) return message.reply('You aren\'t in the same voice channel as the bot.');

        if (!player.queue.current) return message.reply('There is nothing playing.');
        if (!player.textChannel) player.textChannel = message.channel.id;

        player.stop();

        return message.react('✅');
    }
};
