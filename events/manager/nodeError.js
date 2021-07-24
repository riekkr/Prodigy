module.exports = async (client, node, err) => {
    client.log(2, `Node "${node.id}" encountered an error: ${err.message}`);
};