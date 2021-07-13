module.exports = async (client, player, track, payload) => {
    if (!player.textChannel) return;
    let channel = client.channels.cache.get(player.textChannel);
    if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
    channel.lastNowPlayingMessage = undefined;
    channel.send(`Failed to play track **${track.title}**.`);
    console.log(track);
    console.log(payload);
};