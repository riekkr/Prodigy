module.exports = async (app, client) => {
    app.get('/play', async (req, res) => {
        res.json({ code: 405, message: 'Request type not supported' });
    });
    app.post('/play', async (req, res) => {
        const params = req.query;
        if (!params.guildID || !params.userID || !params.query) {
            res.status(400);
            res.json({ code: 400, message: 'Bad request - needs 3 arguments' });
            return;
        }
        const guild = client.guilds.cache.find(g => g.id == params.guildID);
        const user = guild.members.cache.find(m => m.id == params.userID);
        const player = client.manager.create({
            guild: guild.id,
            voiceChannel: user.voice.channel.id,
            selfDeafen: true,
            selfMute: true
        });
        const result = await client.manager.search(params.query, user.user);
        if (player.state !== 'CONNECTED') player.connect();
        switch (result.loadType) {
        case 'NO_MATCHES':
            if (!player.queue.current) player.destroy();
            res.status(404);
            res.json({ code: 404, message: 'No results found for search query' });
            break;
        case 'TRACK_LOADED':
            player.queue.add(result.tracks[0]);
            res.status(200);
            res.json({ code: 200, message: 'Success', track: result.tracks[0] });
            if (!player.playing && !player.paused && !player.queue.size) {
                player.play();
            }
            break;
        case 'PLAYLIST_LOADED':
            player.queue.add(result.tracks);
            if (!player.playing && !player.paused && player.queue.totalSize === result.tracks.length) player.play();
            res.status(200);
            res.json({ code: 200, message: 'Success', playlist: { name: result.playlist.name, length: result.tracks.length, tracks: result.tracks } });
            break;
        case 'SEARCH_RESULT':
            player.queue.add(result.tracks[0]);
            res.status(200);
            res.json({ code: 200, message: 'Success', track: result.tracks[0] });
            if (!player.playing && !player.paused && !player.queue.size) player.play();
            break;
        default:
            client.logger.info('Unknown switch.');
            client.logger.error(result.loadType);
            break;
        }
    });
};