const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'init', // Command name
    description: 'Initialises a new function.', // Short description of what the command does
    aliases: ['in'], // An array of alternate commands that trigger the command
    usage: '{p}init', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: ['MANAGE_CHANNELS'], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message) {
        message.delete();
        const embed = new MessageEmbed()
            .setAuthor('Nothing playing', client.config.avatarURL, client.config.website)
            .setColor(client.config.defaultColor)
            .setImage(client.config.image)
            .setFooter(client.config.defaultFooter)
            .setDescription('**Prodigy - Welcome!**\nTo play a track, type its name or URL in this channel.');
        const msg = await message.channel.send(embed);
        await msg.pin({ reason: 'Automated by Prodigy' });
        const obj = {
            channelID: message.channel.id,
            messageID: msg.id,
        };
        await client.db.set(`${message.guild.id}-pl`, obj);
        let arr = await client.db.get('pl');
        if (!arr) arr = [];
        arr.push(message.channel.id);
        await client.db.set('pl', arr);
        client.log(0, `Guild ${message.guild.name} (${message.guild.id}) requested initialisation.`);
    }
};