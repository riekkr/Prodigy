module.exports = async (client) => {
    client.logger.info(`Logged in as ${client.user.tag} and serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users`);
    await client.manager.init(client.user.id);
    await client.user.setStatus(client.config.status);
    await client.user.setActivity(client.config.activity, {
        type: 'PLAYING' 
    });
};