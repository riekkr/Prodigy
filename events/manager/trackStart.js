const { MessageEmbed } = require('discord.js');
const prettyms = require('pretty-ms');

module.exports = async (client, player, track) => {
    if (!player.textChannel) return;
    let channel = client.channels.cache.get(player.textChannel);
    if (player.n === true) {
        client.update(channel.guild.id);
        return;
    }
    if (player.queue.length < 1) {
        let duration = prettyms(track.duration, { colonNotation: true, secondsDecimalDigits: 0 });
        if (track.isStream === true) duration = 'LIVE';
        const embed = new MessageEmbed()
            .setAuthor('Now playing', track.requester.avatarURL())
            .setDescription(`**[${track.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}](${track.uri})** \`${duration}\`\nRequested by: **${track.requester.tag}** (${track.requester.toString()})`)
            .setFooter(`No tracks in queue | ${client.config.defaultFooter}`, channel.guild.iconURL())
            .setColor(client.config.defaultColor)
            .setThumbnail(track.displayThumbnail('maxresdefault') || track.displayThumbnail('hqdefault') || track.displayThumbnail('mqdefault') || track.thumbnail);
        let msg = await channel.send({ embeds: [embed] });
        if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
        channel.lastNowPlayingMessage = msg;
        return;
    }
    if (!player.queue[0].uri) await player.queue[0].resolve();

    let duration = prettyms(track.duration, { colonNotation: true, secondsDecimalDigits: 0 });
    if (track.isStream === true) duration = 'LIVE';
    let nextDuration = prettyms(player.queue[0].duration, { colonNotation: true, secondsDecimalDigits: 0 });
    if (player.queue[0].isStream === true) nextDuration = 'LIVE';

    const embed = new MessageEmbed()
        .setAuthor('Now playing', track.requester.avatarURL())
        .setDescription(`**[${track.title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}](${track.uri})** \`${duration}\`\nRequested by: **${track.requester.tag}** (${track.requester.toString()})\n\n**Next in queue**\n[${player.queue[0].title}](${player.queue[0].uri}) \`${nextDuration}\`\nRequested by: **${player.queue[0].requester.tag}** (${player.queue[0].requester.toString()})`)
        .setFooter(`${player.queue.size} track(s) in queue | ${client.config.defaultFooter}`, channel.guild.iconURL())
        .setColor(client.config.defaultColor)
        .setThumbnail(track.displayThumbnail('maxresdefault') || track.displayThumbnail('hqdefault') || track.displayThumbnail('mqdefault') || track.thumbnail);
    let msg = await channel.send({ embeds: [embed] });
    if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
    channel.lastNowPlayingMessage = msg;
};  