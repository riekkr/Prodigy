module.exports = async (client, commandName, commandCategory) => {
    try {
        const props = require(`../commands/${commandCategory}/${commandName}`);
        client.logger.info('Loading command ' + props.name);
        client.commands.set(props.name.toLowerCase(), props);
        return true;
    } catch (err) {
        return 'Unable to load command.' + err;
    }
};