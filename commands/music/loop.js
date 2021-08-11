module.exports = {
    name: 'loop', // Command name
    description: 'Loops the currently playing track or the whole queue.', // Short description of what the command does
    aliases: ['l'], // An array of alternate commands that trigger the command
    usage: '{p}loop [queue/song/track/q/s/t] [on/off/true/false/t/f]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('There is nothing playing in this server.');
        if (!player.queue.current) return message.reply('There is nothing playing.');
        if (!player.textChannel) player.textChannel = message.channel.id;

        const loopType = args[0];
        let bool = args[1] || 'toggle';
        let type;
        if (!args.length || loopType === 'song' || loopType === 'track' || loopType === 's' || loopType === 't') type = 'track';
        else if (loopType === 'queue' || loopType === 'q') type = 'queue';
        else return message.reply('Invalid arguments provided.');

        if (type === 'queue') {
            if (bool === 'toggle') {
                if (player.queueRepeat === false) {
                    bool = true;
                    player.setQueueRepeat(true);
                } else {
                    bool = false;
                    player.setQueueRepeat(false);
                }
            } else if (bool === 'on' || bool === 'true' || bool === 't') {
                bool = true;
                player.setQueueRepeat(true);
            } else if (bool === 'off' || bool === 'false' || bool === 'f') {
                bool = false;
                player.setQueueRepeat(false);
            } else {
                return message.reply('Invalid boolean argument. Accepts `on/off/true/false/t/f`.');
            }
        } else if (type === 'track') {
            if (bool === 'toggle') {
                if (player.trackRepeat === false) {
                    bool = true;
                    player.setTrackRepeat(true);
                } else {
                    bool = false;
                    player.setTrackRepeat(false);
                }
            } else if (bool === 'on' || bool === 'true' || bool === 't') {
                bool = true;
                player.setTrackRepeat(true);
            } else if (bool === 'off' || bool === 'false' || bool === 'f') {
                bool = false;
                player.setTrackRepeat(false);
            } else {
                return message.reply('Invalid boolean argument. Accepts `on/off/true/false/t/f`.');
            }
        }

        client.update(message.guild.id);

        if (type === 'queue') return message.react('🔁');
        else if (type === 'track') return message.react('🔂');
    }
};
