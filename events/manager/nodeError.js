module.exports = async (client, node, err) => {
    client.logger.error(`Node "${node.id}" encountered an error: ${err.message}`);
};