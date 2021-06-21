module.exports = {
    name: 'talents', // Command name
    description: 'Shows talent details of a Genshin Impact character.', // Short description of what the command does
    aliases: ['tal'], // An array of alternate commands that trigger the command
    usage: '{p}talents [charName | inferred]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (!args.length && message.member.previousCharacterQuery == undefined) return message.channel.send('**Invalid usage:** Command `talents` requires exactly 1 string argument.');
        let char = args.join(' ') || message.member.previousCharacterQuery;
        const talents = client.genshin.talents(char);
        let pages = [];
        let csp;
        let current = 0;
        if (talents.combatsp) {
            csp = `**__${talents.combatsp.name}__**\n\n${talents.combatsp.info}\n\n**${talents.name}** | Special`;
        } else {
            csp = `No special\n\n**${talents.name}** | Special`;
        }
        const c1 = `**__${talents.combat1.name}__**\n\n${talents.combat1.info}\n\n**${talents.name}** | Combat 1 | Page **1** of **8**`;
        pages.push(c1);
        const c2 = `**__${talents.combat2.name}__**\n\n${talents.combat2.info}\n\n**${talents.name}** | Combat 2 | Page **2** of **8**`;
        pages.push(c2);
        const c3 = `**__${talents.combat3.name}__**\n\n${talents.combat3.info}\n\n**${talents.name}** | Combat 3 | Page **3** of **8**`;
        pages.push(c3);
        const p1 = `**__${talents.passive1.name}__**\n\n${talents.passive1.info}\n\n**${talents.name}** | Passive 1 | Page **4** of **8**`;
        pages.push(p1);
        const p2 = `**__${talents.passive2.name}__**\n\n${talents.passive2.info}\n\n**${talents.name}** | Passive 2 | Page **5** of **8**`;
        pages.push(p2);
        const p3 = `**__${talents.passive3.name}__**\n\n${talents.passive3.info}\n\n**${talents.name}** | Passive 3 | Page **6** of **8**`;
        pages.push(p3);
        const cs = `${csp} | Page **7** of **8**`;
        pages.push(cs);
        let c = Object.values(talents.costs);
        const costs = [];
        costs.push('**__Talent Level Up Costs__**\n');
        costs.push('**Level 1:** None');
        for (let i = 0; i < c.length; i++) {
            costs.push(`**Level ${i + 2}:** ${c[i].map(c => `${c.count} ${c.name}`).join(', ')}`);
        }
        costs.push(`\n**${talents.name}** | Costs | Page **8** of **8**`);
        pages.push(costs.join('\n'));
        const msg = await message.channel.send(pages[0]);
        await msg.react('🔺');
        await msg.react('🔻');
        const upFilter = (reaction, user) => reaction.emoji.name == '🔺' && user.id === message.author.id;
        const downFilter = (reaction, user) => reaction.emoji.name == '🔻' && user.id === message.author.id;
        const collector1 = msg.createReactionCollector(upFilter, { time: 5 * 60 * 1000 });
        const collector2 = msg.createReactionCollector(downFilter, { time: 5 * 60 * 1000 });
        collector1.on('collect', async (reaction, user) => { // Up
            reaction.users.remove(user.id);
            if (current == 0) {
                await msg.edit(pages[pages.length - 1]);
                current = pages.length - 1;
            } else {
                await msg.edit(pages[current - 1]);
                current--;
            }
        });
        collector2.on('collect', async (reaction, user) => { // Down
            reaction.users.remove(user.id);
            if (current == pages.length - 1) {
                await msg.edit(pages[0]);
                current = 0;
            } else {
                await msg.edit(pages[current + 1]);
                current++;
            }
        });
    }
};

