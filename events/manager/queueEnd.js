const { MessageEmbed } = require('discord.js');

module.exports = async (client, player) => {
    let channel = client.channels.cache.get(player.textChannel);
    if (player.n === true) {
        client.update(channel.guild.id, true);
        player.destroy();
        return;
    }
    if (channel.lastNowPlayingMessage) channel.lastNowPlayingMessage.delete();
    channel.lastNowPlayingMessage = false;
    const embed = new MessageEmbed()
        .setDescription('The queue has ended.')
        .setFooter(client.config.defaultFooter)
        .setColor(client.config.defaultColor);
    const msg = await channel.send({ embeds: [embed] });
    msg.delete({ timeout: 5000 });
    player.destroy();
};
