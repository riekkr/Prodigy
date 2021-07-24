module.exports = async (client, player, track, payload) => {
    if (!player.textChannel) return;
    let channel = client.channels.cache.get(player.textChannel);
    if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
    channel.lastNowPlayingMessage = undefined;
    channel.send(`Failed to play track **${track.title}**.`).then(msg => {
        if (player.n === true) {
            msg.delete({ timeout: 10000 });
        }
    });
    client.log(2, payload);
};