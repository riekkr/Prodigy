module.exports = async (app, client) => {
    app.get('/', async (req, res) => {
        res.json({ code: 200, message: 'Prodigy is online.' });
        client.logger.log('GET request recieved');
    });
};