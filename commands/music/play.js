module.exports = {
    name: 'play',
    description: 'Plays the requested song in the current voice channel.',
    aliases: ['p'],
    usage: '{p}play <songTitle>',
    ownerOnly: false,
    requiredPermissions: ['MANAGE_MESSAGES'],
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
            selfMute: true
        });
        if (player.state !== 'CONNECTED') player.connect();

        switch (res.loadType) {
        case 'NO_MATCHES':
            if (!player.queue.current) player.destroy();
            message.reply('there weren\'t any results found for your query.');
            break;
        case 'TRACK_LOADED':
            player.queue.add(res.tracks[0]);
            message.channel.send(`Enqueued track **${res.tracks[0].title}**.`);
            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }
            break;
        case 'PLAYLIST_LOADED':
            player.queue.add(res.tracks);
            if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
            message.channel.send(`Enqueued playlist **${res.playlist.name}** with **${res.tracks.length}** songs.`);
            break;
        case 'SEARCH_RESULT':
            player.queue.add(res.tracks[0]);
            message.channel.send(`Enqueued track **${res.tracks[0].title}**.`);
            if (!player.playing && !player.paused && !player.queue.size) player.play();
            break;
        default:
            client.logger.info('Unknown switch.');
            break;
        }
    }
};