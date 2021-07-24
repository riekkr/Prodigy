// noinspection JSClosureCompilerSyntax

require('dotenv').config();
const Discord = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');
const config = require('./config.json');
const Keyv = require('keyv');
const { version } = require('./package.json');
const express = require('express');
const genshin = require('genshin-db');
const prettyms = require('pretty-ms');
const fetch = require('node-fetch');

const server = express();
server.listen(config.port, () => log(1, `Listening on port ${config.port}`));

const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');
const Deezer = require('erela.js-deezer');
const Facebook = require('erela.js-facebook');

console.clear();

const nodes = [
    {
        id: 'Prodigy',
        host: config.lavalinkHost,
        port: config.lavalinkPort,
        password: config.lavalinkPassword,
        clientName: 'ProdigyV2'
    }
];

const client = new Discord.Client();
const db = new Keyv(config.mongoURL, { namespace: 'default' });
db.on('error', err => log(2, `Connection error: ${err}`));
client.debug = false;
if (process.argv.join(' ').includes('-d') || process.argv.join(' ').includes('--debug') || process.env.DEBUG === 'true') {
    console.log(chalk.bgBlack(chalk.red('*********************** WARNING! ***********************')));
    console.log(chalk.bgBlack(chalk.red('*           Prodigy is running in debug mode           *')));
    console.log(chalk.bgBlack(chalk.red('*    It is dangerous to run in debug mode normally.    *')));
    console.log(chalk.bgBlack(chalk.red('* Remove the --debug / -d flag to turn off debug mode. *')));
    console.log(chalk.bgBlack(chalk.red('*  You may encounter security and performance issues.  *')));
    console.log(chalk.bgBlack(chalk.red('********************************************************')));
    client.debug = true;
}
client.update = update;
client.db = db;
client.log = log;
client.config = config;
client.version = version;
client.config.defaultFooter = client.config.defaultFooter.replace('{version}', `v${version}`);
client.commands = new Discord.Collection();
client.snipes = new Discord.Collection();
client.genshin = genshin;
// client.buttons = require('discord-buttons')(client);

const manager = new Manager({
    nodes,
    plugins: [
        new Spotify({
            clientID: config.spotifyClientID,
            clientSecret: config.spotifyClientSecret
        }),
        new Deezer({ playlistLimit: 0, albumLimit: 0 }),
        new Facebook()
    ],
    shards: 1,
    send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    }
});

client.manager = manager;

const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const managerEvents = fs.readdirSync('./events/manager').filter(file => file.endsWith('.js'));

for (const file of events) {
    const event = require(`./events/${file}`);
    client.on(file.split('.')[0], event.bind(null, client));
}

for (const file of managerEvents) {
    const event = require(`./events/manager/${file}`);
    manager.on(file.split('.')[0], event.bind(null, client));
}

const music = fs.readdirSync('./commands/music').filter(file => file.endsWith('.js'));
const info = fs.readdirSync('./commands/info').filter(file => file.endsWith('.js'));
const owner = fs.readdirSync('./commands/owner').filter(file => file.endsWith('.js'));
const admin = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));
const osu = fs.readdirSync('./commands/osu').filter(file => file.endsWith('.js'));
const gen = fs.readdirSync('./commands/genshin').filter(file => file.endsWith('.js'));
const tools = fs.readdirSync('./commands/tools').filter(file => file.endsWith('.js'));
const nsfw = fs.readdirSync('./commands/nsfw').filter(file => file.endsWith('.js'));

for (const file of music) {
    const cmd = require(`./commands/music/${file}`);
    cmd.category = 'music';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of info) {
    const cmd = require(`./commands/info/${file}`);
    cmd.category = 'info';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of owner) {
    const cmd = require(`./commands/owner/${file}`);
    cmd.category = 'owner';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of admin) {
    const cmd = require(`./commands/admin/${file}`);
    cmd.category = 'admin';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of osu) {
    const cmd = require(`./commands/osu/${file}`);
    cmd.category = 'osu';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of gen) {
    const cmd = require(`./commands/genshin/${file}`);
    cmd.category = 'genshin';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of tools) {
    const cmd = require(`./commands/tools/${file}`);
    cmd.category = 'tools';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of nsfw) {
    const cmd = require(`./commands/nsfw/${file}`);
    cmd.category = 'nsfw';
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
log(1, `${client.commands.size} commands and ${Object.keys(client._events).length} events loaded.`);

process.on('unhandledRejection', async err => {
    log(2, 'Unhandled rejection:');
    log(2, err);
});

process.on('exit', async () => log(1, 'Shutting down gracefully...'));

const apiFiles = fs.readdirSync('./api').filter(file => file.endsWith('.js'));
for (const file of apiFiles) {
    require(`./api/${file}`)(server, client);
}

async function update (guild, def) {
    let objc;
    const obj = await db.get(`${guild}-pl`);
    const messageID = obj.messageID;
    const channelID = obj.channelID;
    const channel = client.channels.cache.get(channelID);
    let message = await channel.messages.fetch(messageID).catch(async () => {
        const msg = await channel.send(text, { embed });
        objc = {
            messageID: msg.id,
            channelID: msg.channel.id
        };
        await client.db.set(`${guild}-pl`, objc);
        message = msg;
        await msg.pin({reason: 'Automated by Prodigy'});
    });
    if (!message) message = await channel.messages.fetch(objc.messageID);
    if (def) {
        const embed = new Discord.MessageEmbed()
            .setAuthor('Nothing playing', client.config.avatarURL, client.config.website)
            .setColor(client.config.defaultColor)
            .setImage(client.config.image)
            .setFooter(client.config.defaultFooter)
            .setDescription('**Prodigy - Welcome!**\nTo play a track, type its name or URL in this channel.');
        message.edit('', { embed });
        return;
    }
    const player = await client.manager.get(guild);
    if (!player) return;
    const queue = player.queue || false;
    let dura = prettyms(queue.current.duration, { colonNotation: true, secondsDecimalDigits: 0 });
    if (!queue.current.thumbnail) await queue.current.resolve();
    if (queue.current.isStream === true) dura = 'LIVE';
    let thumb = queue.current.displayThumbnail('maxresdefault');
    let thB = true;
    if (queue.current.thumbnail === null) {
        thumb = client.config.image;
        thB = false;
    }
    if (thB === true) {
        const res = await fetch(queue.current.displayThumbnail('maxresdefault'));
        if (res.status === 404) thumb = queue.current.displayThumbnail('hqdefault');
    }
    const embed = new Discord.MessageEmbed()
        .setAuthor(queue.current.title, queue.current.requester.avatarURL(), queue.current.uri)
        .setColor(client.config.defaultColor)
        .setImage(thumb)
        .setFooter(`Track loop: ${player.trackRepeat ? 'On' : 'Off'} | Queue loop: ${player.queueRepeat ? 'On' : 'Off'} | ${player.paused ? 'Paused' : 'Not paused'}\nNo tracks in queue`)
        .setDescription(`**Requested by:** ${queue.current.requester.toString()}\n**Artist / Channel:** ${queue.current.author}\n**Duration:** ${dura}`);
    let text;
    if (queue.size > 0) {
        let totalDuration = prettyms(player.queue.duration, { colonNotation: true, secondsDecimalDigits: 0 });
        if (player.queue.find(s => s.isStream === true)) totalDuration = '∞';
        const shortQueue = player.queue.slice(0, 10);
        const shortArr = [];
        for (let i = 0; i < shortQueue.length; i++) {
            let trackDura = prettyms(shortQueue[i].duration, { colonNotation: true, secondsDecimalDigits: 0 });
            if (shortQueue[i].isStream === true) trackDura = 'LIVE';
            shortArr.push(`**\`${i+1}\`**: **${shortQueue[i].title.replace('*', '\\*').replace('_', '\\_').replace('`', '\\`').replace('>', '\\>').replace('~', '\\~')}** \`${trackDura}\` | Requested by **${shortQueue[i].requester.tag}**`);
        }
        if (queue.size > 10) shortArr.push('*Use `queue` to view the full queue.*');
        text = shortArr.join('\n');
        embed.setFooter(`Track loop: ${player.trackRepeat ? 'On' : 'Off'} | Queue loop: ${player.queueRepeat ? 'On' : 'Off'} | ${player.paused ? 'Paused' : 'Not paused'}\nTotal duration: ${totalDuration}`);
    } else {
        text = '';
    }
    channel.messages.fetch()
        .then(fetched => {
            const notPinned = fetched.filter(fetchedMsg => !fetchedMsg.pinned);

            channel.bulkDelete(notPinned, true);
        })
        .catch(err => log(2, err));
    message.edit(text, { embed });
}

function log (type, details) {
    const time = new Date();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let seconds = time.getSeconds();
    if (time.getMinutes().toString().length === 1) {
        minutes = `0${time.getMinutes()}`;
    }
    if (time.getHours().toString().length === 1) {
        hours = `0${time.getHours()}`;
    }
    if (time.getSeconds().toString().length === 1) {
        seconds = `0${time.getSeconds()}`;
    }
    const format = `${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()} ${hours}:${minutes}:${seconds}`;
    if (type === 'debug' || type === 'd' || type === 0) {
        if (client.debug === true) console.log(chalk.bold(chalk.bgBlack(chalk.green(`${format} [DEBUG] `))) + details);
    }
    if (type === 'info' || type === 'i' || type === 1) {
        console.log(chalk.bold(chalk.bgBlack(chalk.magenta(`${format} [INFO] `))) + details);
    }
    if (type === 'error' || type === 'err' || type === 'e' || type === 2) {
        console.log(chalk.bold(chalk.bgBlack(chalk.red(`${format} [ERROR] `))) + details);
    }
    if (type === 'warn' || type === 'w' || type === 3) {
        console.log(chalk.bold(chalk.bgBlack(chalk.yellow(`${format} [ERROR] `))) + details);
    }
}

client.login(config.token);
