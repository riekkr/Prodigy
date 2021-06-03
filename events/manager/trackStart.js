const { MessageEmbed } = require('discord.js');
const prettyms = require('pretty-ms');

module.exports = async (client, player, track) => {
    let channel = client.channels.cache.get(player.textChannel);
    const embed = new MessageEmbed()
        .setAuthor('Now playing')
        .setDescription(`**[${track.title}](${track.uri})** | \`${prettyms(track.duration, { colonNotation: true })}\``)
        .setFooter(`${player.queue.size} tracks in queue | ${client.config.defaultFooter}`)
        .setColor(client.config.defaultColor)
        .setThumbnail(track.thumbnail);
    channel.send(embed);
    client.logger.log(track);
};