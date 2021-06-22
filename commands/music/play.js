module.exports = {
    name: 'play',
    description: 'Plays the requested song in the current voice channel.',
    aliases: ['p'],
    usage: '{p}play <songTitle>',
    ownerOnly: false,
    requiredPermissions: ['CONNECT'],
    sameVC: true, // Whether the user needs to be in the same channel as the bot to use the command
    dj: true,

    async execute(client, message, args) {
        if (!args.length) {
            return message.channel.send('**Invalid usage:** Command `play` requires exactly 1 string argument.');
        }
        const res = await client.manager.search(args.join(' '), message.author);
        const player = client.manager.create({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            selfDeafen: true,
            selfMute: false,
            volume: client.config.initialVolume
        });
        if (!player.textChannel) player.textChannel = message.channel.id;
        if (player.state !== 'CONNECTED') player.connect();

        switch (res.loadType) {
        case 'NO_MATCHES':
            if (!player.queue.current) player.destroy();
            message.reply('there weren\'t any results found for your query.');
            break;
        case 'TRACK_LOADED':
            player.queue.add(res.tracks[0]);
            message.channel.send(`Enqueued track **${res.tracks[0].title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}**.`);
            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }
            break;
        case 'PLAYLIST_LOADED':
            player.queue.add(res.tracks);
            if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
            message.channel.send(`Enqueued playlist **${res.playlist.name.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** with **${res.tracks.length}** songs.`);
            break;
        case 'SEARCH_RESULT':
            player.queue.add(res.tracks[0]);
            message.channel.send(`Enqueued track **${res.tracks[0].title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}**.`);
            if (!player.playing && !player.paused && !player.queue.size) player.play();
            break;
        case 'LOAD_FAILED':
            message.channel.send(`An unknown error occurred and loading failed for your query **${args.join(' ')}**.\n**Details:** \`${res.exception.severity} | ${res.exception.message}\``);
            client.logger.error(`LOAD_FAILED for query: "${args.join(' ')}"`);
            client.logger.error('Details:');
            client.logger.error(`Severity: ${res.exception.severity}`);
            client.logger.error(`Message: ${res.exception.message}`);
            break;
        default:
            client.logger.error('Unknown loadType: ' + res.loadType + '\n' + res);
            break;
        }
    }
};