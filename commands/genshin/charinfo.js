const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'charinfo', // Command name
    description: 'Shows information about a Genshin Impact character.', // Short description of what the command does
    aliases: ['ci'], // An array of alternate commands that trigger the command
    usage: '{p}charinfo <CharacterName | CharacterID>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix) {
        const db = client.genshin;
        const query = args.join(' ');
        const c = db.characters(query);
        let color;
        if (!c) return message.reply('the character ' + query + ' was not found in the database.');
        if (c.element == 'Anemo') color = '#339999';
        else if (c.element == 'Pyro') color = '#b32134';
        else if (c.element == 'Electro') color = '#7725db';
        else if (c.element == 'Cryo') color = '#add8e6';
        else if (c.element == 'Hydro') color = '#1c4966';
        else if (c.element == 'Dendro') color = '#249225';
        else if (c.element == 'Geo') color = '#ffcc00';
        else color = client.config.defaultColor;
        const embed = new MessageEmbed()
            .setColor(color)
            .setFooter(client.config.defaultFooter)
            .setAuthor(c.name, c.images.image)
            .setThumbnail(client.genshin.elements(c.element).url)
            .setTitle('Character Information')
            .setURL(c.url.fandom)
            .setImage(c.images.cover1)
            .addFields([
                {
                    name: 'Title',
                    value: c.title || 'None'
                },
                {
                    name: 'Description',
                    value: c.description || 'None'
                },
                {
                    name: 'Rarity',
                    value: `${c.rarity}✰`,
                    inline: true
                },
                {
                    name: 'Element',
                    value: c.element,
                    inline: true
                },
                {
                    name: 'Weapon Type',
                    value: c.weapontype,
                    inline: true
                },
                {
                    name: 'Substat',
                    value: c.substat,
                    inline: true
                },
                {
                    name: 'Gender / Body',
                    value: `${c.gender} / ${c.body[0].toLowerCase().toUpperCase() + c.body.toLowerCase().substring(1)}`,
                    inline: true
                },
                {
                    name: 'Region',
                    value: c.region || 'None',
                    inline: true
                },
                {
                    name: 'Birthday',
                    value: c.birthday || 'Unknown',
                    inline: true
                },
                {
                    name: 'Constellation',
                    value: c.constellation,
                    inline: true
                },
                {
                    name: 'Constellations',
                    value: `Run \`${prefix}constellations\` for information.`
                },
                {
                    name: 'Talents',
                    value: `Run \`${prefix}talents\` for information.`
                }
            ]);
        message.channel.send(embed);
        message.member.previousCharacterQuery = c.name;
    }
};