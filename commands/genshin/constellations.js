const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'constellations', // Command name
    description: 'Shows constellation details of a Genshin Impact character.', // Short description of what the command does
    aliases: ['con'], // An array of alternate commands that trigger the command
    usage: '{p}constellations [charName | inferred]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (!args.length && message.member.previousCharacterQuery === undefined) return message.channel.send('**Invalid usage:** Command `constellations` requires exactly 1 string argument.');
        let char = args.join(' ') || message.member.previousCharacterQuery;
        const cons = Object.values(client.genshin.constellation(char));
        cons.shift();
        const imgs = Object.values(cons.pop());
        if (!cons) return message.reply(`the character ${char} was not found in the database.`);
        const characterInfo = client.genshin.characters(char);
        let pages = [];
        let current = 0;
        for (let i = 0; i < cons.length; i++) {
            const embed = new MessageEmbed()
                .setAuthor(characterInfo.name, characterInfo.images.image)
                .setTitle(`${cons[i].name} - C${i + 1}`)
                .setDescription(cons[i].effect)
                .setFooter(`Page ${i + 1} of ${cons.length} | ${client.config.defaultFooter}`)
                .setThumbnail(imgs[i])
                .setColor(client.config.defaultColor);
            pages.push(embed);
        }
        const msg = await message.channel.send(pages[0]);
        await msg.react('🔺');
        await msg.react('🔻');
        const upFilter = (reaction, user) => reaction.emoji.name === '🔺' && user.id === message.author.id;
        const downFilter = (reaction, user) => reaction.emoji.name === '🔻' && user.id === message.author.id;
        const collector1 = msg.createReactionCollector(upFilter, { time: 5 * 60 * 1000 });
        const collector2 = msg.createReactionCollector(downFilter, { time: 5 * 60 * 1000 });
        collector1.on('collect', async (reaction, user) => { // Up
            await reaction.users.remove(user.id);
            if (current === 0) {
                await msg.edit({ embed: pages[pages.length - 1] });
                current = pages.length - 1;
            } else {
                await msg.edit({ embed: pages[current - 1] });
                current--;
            }
        });
        collector2.on('collect', async (reaction, user) => { // Down
            await reaction.users.remove(user.id);
            if (current === pages.length - 1) {
                await msg.edit({ embed: pages[0] });
                current = 0;
            } else {
                await msg.edit({ embed: pages[current + 1] });
                current++;
            }
        });
    }
};

