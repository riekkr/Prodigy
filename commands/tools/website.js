const { MessageEmbed } = require('discord.js');
const puppeteer = require('puppeteer');

module.exports = {
    name: 'website', // Command name
    description: 'Takes a screenshot of a specified webpage and sends it back to you.', // Short description of what the command does
    aliases: ['screenshot', 'ss', 'site', 'web'], // An array of alternate commands that trigger the command
    usage: '{p}website <url>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run
    sameVC: false, // Requires the user to be in the same voice channel as the bot to run the command (Not done)

    async execute(client, message, args) {
        const msg = await message.reply('Waiting for available browser...');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await msg.edit(`Launched browser and navigating to <${args[0]}>...`);
        await page.goto(args[0]);
        await msg.edit('Waiting for page to load...');
        await page.waitForNavigation({
            waitUntil: 'networkidle0',
        });
        await msg.edit('Taking a screenshot...');
        await page.screenshot({ path: `../../screenshots/${message.id}.png` });
        const title = page.title();
        await msg.edit('Closing browser...');
        await browser.close();
        const embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.avatarURL())
            .setTitle(title)
            .setURL(args[0])
            .setColor(client.config.defaultColor);
        await msg.edit({ embeds: [embed], files: [{ attachment: `../../screenshots/${message.id}.png`, name: 'screenshot.png' }] });
    }
};