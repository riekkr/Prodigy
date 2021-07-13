module.exports = async (app) => {
    app.get('/', async (req, res) => {
        res.status(200);
        res.json({ code: 200, message: 'Prodigy is online.' });
    });
};