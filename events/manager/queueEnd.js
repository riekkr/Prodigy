const { MessageEmbed } = require('discord.js');

module.exports = async (client, player) => {
    let channel = client.channels.cache.get(player.textChannel);
    const embed = new MessageEmbed()
        .setDescription('The queue has ended.')
        .setFooter(client.config.defaultFooter)
        .setColor(client.config.defaultColor);
    channel.send(embed);
    player.destroy();
};