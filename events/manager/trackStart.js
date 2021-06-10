const { MessageEmbed } = require('discord.js');
const prettyms = require('pretty-ms');

module.exports = async (client, player, track) => {
    let channel = client.channels.cache.get(player.textChannel);
    if (player.queue.length < 1) {
        const embed = new MessageEmbed()
            .setAuthor('Now playing')
            .setDescription(`**[${track.title}](${track.uri})** \`${prettyms(track.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\`\nRequested by: **${track.requester.tag}** (${track.requester.toString()})`)
            .setFooter(`No tracks in queue | ${client.config.defaultFooter}`)
            .setColor(client.config.defaultColor)
            .setThumbnail(track.displayThumbnail('maxresdefault') || track.displayThumbnail('hqdefault') || track.displayThumbnail('mqdefault') || track.thumbnail);
        let msg = await channel.send(embed);
        if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
        channel.lastNowPlayingMessage = msg;
        return;
    }
    if (!player.queue[0].uri) await player.queue[0].resolve();

    const embed = new MessageEmbed()
        .setAuthor('Now playing')
        .setDescription(`**[${track.title}](${track.uri})** \`${prettyms(track.duration, { colonNotation: true, secondsDecimalDigits: 0 })}\`\nRequested by: **${track.requester.tag}** (${track.requester.toString()})\n\n**Next in queue**\n[${player.queue[0].title}](${player.queue[0].uri}) \`${prettyms(player.queue[0].duration, { colonNotation: true, secondsDecimalDigits: 0 })}\`\nRequested by: **${player.queue[0].requester.tag}** (${player.queue[0].requester.toString()})`)
        .setFooter(`${player.queue.size} track(s) in queue | ${client.config.defaultFooter}`)
        .setColor(client.config.defaultColor)
        .setThumbnail(track.displayThumbnail('maxresdefault') || track.displayThumbnail('hqdefault') || track.displayThumbnail('mqdefault') || track.thumbnail);
    let msg = await channel.send(embed);
    if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
    channel.lastNowPlayingMessage = msg;
};  