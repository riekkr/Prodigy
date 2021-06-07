const { MessageEmbed } = require('discord.js');
const prettyms = require('pretty-ms');

module.exports = async (client, player, track) => {
    let channel = client.channels.cache.get(player.textChannel);
    const embed = new MessageEmbed()
        .setAuthor('Now playing')
        .setDescription(`**[${track.title}](${track.uri})** | \`${prettyms(track.duration, { colonNotation: true })}\`\nRequested by: **${track.requester.tag}** (${track.requester.toString()})`)
        .setFooter(`${player.queue.size} tracks in queue | ${client.config.defaultFooter}`)
        .setColor(client.config.defaultColor)
        .setThumbnail(track.displayThumbnail('maxresdefault') || track.displayThumbnail('hqdefault') || track.displayThumbnail('mqdefault') || track.thumbnail);
    let msg = await channel.send(embed);
    if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
    channel.lastNowPlayingMessage = msg;
};  