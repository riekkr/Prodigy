const { MessageEmbed } = require('discord.js');
const { API } = require('nhentai-api');
const api = new API();

module.exports = {
    name: 'doujin', // Command name
    description: 'Queries doujin from nhentai.', // Short description of what the command does
    aliases: ['dou'], // An array of alternate commands that trigger the command
    usage: '{p}doujin <id>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (message.channel.nsfw === false) return message.reply('This command can only be used in NSFW marked channels.');
        let book = await api.getBook(args.join(' ')).catch(async () => await message.reply('Invalid doujin ID.'));
        const pages = [];
        for (let i = 0; i < book.pages.length; i++) {
            const embed = new MessageEmbed()
                .setAuthor(book.title.pretty)
                .setImage(api.getImageURL(book.pages[i]))
                .setFooter(`Page ${i + 1} of ${book.pages.length} | ${client.config.defaultFooter}`)
                .setColor(client.config.defaultColor);
            pages.push(embed);
        }
        let msg = await message.channel.send({ embeds: [pages[0]] });
        let currentPage = 0;
        await msg.react('🔺');
        await msg.react('🔻');
        await msg.react('🔹');
        const upFilter = (reaction, user) => reaction.emoji.name === '🔺' && user.id === message.author.id;
        const downFilter = (reaction, user) => reaction.emoji.name === '🔻' && user.id === message.author.id;
        const jumpFilter = (reaction, user) => reaction.emoji.name === '🔹' && user.id === message.author.id;
        const collector1 = msg.createReactionCollector({ filter: upFilter, time: 5 * 60 * 1000 });
        const collector2 = msg.createReactionCollector({ filter: downFilter, time: 5 * 60 * 1000 });
        const collector3 = msg.createReactionCollector({ filter: jumpFilter, time: 5 * 60 * 1000 });
        collector1.on('collect', async (reaction, user) => { // Up
            await reaction.users.remove(user.id);
            if (currentPage === 0) {
                await msg.edit({ embeds: [pages[pages.length - 1]] });
                currentPage = pages.length - 1;
            } else {
                await msg.edit({ embeds: [pages[currentPage - 1]] });
                currentPage--;
            }
        });
        collector2.on('collect', async (reaction, user) => { // Down
            await reaction.users.remove(user.id);
            if (currentPage === pages.length - 1) {
                await msg.edit({ embeds: [pages[0]] });
                currentPage = 0;
            } else {
                await msg.edit({ embeds: [pages[currentPage + 1]] });
                currentPage++;
            }
        });
        collector3.on('collect', async (reaction, user) => { // Jump
            await reaction.users.remove(user.id);
            const msg = await message.channel.send('Which page to jump to?');
            const filter = m => m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector(filter, { limit: 1, time: 15000 });
            collector.on('collect', ms => {
                if (Number(ms.content) < 1 || Number(ms.content) > book.pages.length) {
                    message.reply(`Requires a number from 1 to ${book.pages.length}.`).then(mx => mx.delete({ timeout: 10000 }));
                    ms.delete();
                    msg.delete();
                    return;
                }
                msg.edit({ embeds: [pages[Number(ms.content) - 1]] });
                currentPage = Number(ms.content) - 1;
                collector.stop();
                msg.delete();
                ms.delete();
            });
        });
    }
};
