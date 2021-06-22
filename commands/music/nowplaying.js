const { MessageEmbed } = require('discord.js');
const prettyms = require('pretty-ms');

module.exports = {
    name: 'nowplaying', // Command name
    description: 'Shows information about the currently playing track.', // Short description of what the command does
    aliases: ['np', 'now-playing', 'now', 'playing'], // An array of alternate commands that trigger the command
    usage: '{p}nowplaying', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts   the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        if (!player) return message.reply('there is nothing playing in this server.');
        if (!player.queue.current) return message.reply('there is nothing playing.');
        if (!player.textChannel) player.textChannel = message.channel.id;

        let np = player.queue.current;
        let bar = createProgressBar(player.position, player.queue.current.duration, 25);
        if (np.isStream == true) bar = '';
        let songDuration = prettyms(np.duration, { colonNotation: true, secondsDecimalDigits: 0 });
        if (np.isStream == true) songDuration = '∞';
        let currentPosition = prettyms(player.position, { colonNotation: true, secondsDecimalDigits: 0 });
        if (np.isStream == true) currentPosition = 'LIVE';

        const embed = new MessageEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setTitle('Now playing')
            .setDescription(`${bar} ${currentPosition} / ${songDuration}`)
            .setImage(np.displayThumbnail('maxresdefault') || np.displayThumbnail('hqdefault') || np.displayThumbnail('mqdefault') || np.thumbnail)
            .setColor(client.config.defaultColor)
            .setFooter(`${player.queue.size} tracks in queue | ${client.config.defaultFooter}`)
            .addFields([
                {
                    name: 'Track',
                    value: `[${np.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}](${np.uri})`
                },
                {
                    name: 'Channel',
                    value: np.author.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')
                },
                {
                    name: 'Duration',
                    value: songDuration
                },
                {
                    name: 'Requested by',
                    value: `**${np.requester.tag}** (${np.requester.toString()})`
                },
                {
                    name: 'Live',
                    value: np.isStream ? 'Yes' : 'No',
                    inline: true
                },
                {
                    name: 'Seekable',
                    value: np.isSeekable ? 'Yes' : 'No',
                    inline: true
                }
            ]);
        return message.channel.send(embed);

        function createProgressBar (current, end, size) {
            if (isNaN(current) || isNaN(end)) return 'Arguments current and end have to be integers.';
            const percentage = current / end;
            const progress = Math.round((size * percentage));
            const emptyProgress = size - progress;

            const progressText = '▇'.repeat(progress);
            const emptyProgressText = '—'.repeat(emptyProgress);
            
            const bar = `\`[${progressText}${emptyProgressText}]\``;
            return bar;
        }
    }
};