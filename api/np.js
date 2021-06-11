module.exports = async (app, client) => {
    app.get('/np', async (req, res) => {
        const params = req.query;
        if (!params.guildID) {
            res.status(400);
            res.json({ code: 400, message: 'Bad request - needs 1 argument' });
            return;
        }
        const player = client.manager.players.get(params.guildID);
        if (!player) {
            res.status(404);
            res.json({ code: 404, message: 'Player not found - nothing playing' });
            return;
        }
        res.status(200);
        res.json({ code: 200, message: 'Success', track: player.queue.current });
    });
};