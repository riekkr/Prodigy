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

        let np = player.queue.current;

        const embed = new MessageEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL())
            .setTitle('Now playing')
            .setImage(np.displayThumbnail('maxresdefault') || np.displayThumbnail('hqdefault') || np.displayThumbnail('mqdefault') || np.thumbnail)
            .setColor(client.config.defaultColor)
            .setFooter(`${player.queue.size} tracks in queue | ${client.config.defaultFooter}`)
            .addFields([
                {
                    name: 'Track',
                    value: `[${np.title}](${np.uri})`
                },
                {
                    name: 'Channel',
                    value: np.author
                },
                {
                    name: 'Duration',
                    value: prettyms(np.duration, { colonNotation: true, secondsDecimalDigits: 0 })
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
    }
};