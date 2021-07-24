require('dotenv').config();
const Discord = require('discord.js');
const chalk = require('chalk');
const fs = require('fs');
const config = require('./config.json');
const Keyv = require('keyv');
const { version } = require('./package.json');
const express = require('express');
const genshin = require('genshin-db');

const server = express();
server.listen(config.port, () => {
    log(1, 'Listening on port ' + config.port);
});

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
db.on('error', (err) => {
    log(2, 'Connection error: ' + err);
});
client.debug = false;
if (process.argv.join(' ').includes('-d') || process.argv.join(' ').includes('--debug')) {
    console.log(chalk.bgBlack(chalk.red('*********************** WARNING! ***********************')));
    console.log(chalk.bgBlack(chalk.red('*           Prodigy is running in debug mode           *')));
    console.log(chalk.bgBlack(chalk.red('*    It is dangerous to run in debug mode normally.    *')));
    console.log(chalk.bgBlack(chalk.red('* Remove the --debug / -d flag to turn off debug mode. *')));
    console.log(chalk.bgBlack(chalk.red('*  You may encounter security and performance issues.  *')));
    console.log(chalk.bgBlack(chalk.red('********************************************************')));
    client.debug = true;
}
client.pl = {};
client.db = db;
client.log = log;
client.config = config;
client.version = version;
client.config.defaultFooter = client.config.defaultFooter.replace('{version}', 'v' + version);
client.commands = new Discord.Collection();
client.snipes = new Discord.Collection();
client.genshin = genshin;
// client.buttons = require('discord-buttons')(client);
const embed = new Discord.MessageEmbed()
    .setAuthor('Nothing playing', config.avatarURL, config.website)
    .setColor(client.config.defaultColor)
    .setImage(client.config.image)
    .setFooter(client.config.defaultFooter)
    .setDescription('Prodigy - Welcome!\nTo play a track, type its name or URL in this channel.');
client.pl.embed = embed;

const manager = new Manager({
    nodes: nodes,
    plugins: [
        new Spotify({
            clientID: config.spotifyClientID,
            clientSecret: config.spotifyClientSecret
        }),
        new Deezer(),
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

process.on('unhandledRejection', async (err) => {
    log(2, 'Unhandled rejection:');
    console.log(err);
});

process.on('exit', async () => {
    log(1, 'Shutting down gracefully...');
});

const apiFiles = fs.readdirSync('./api').filter(file => file.endsWith('.js'));
for (const file of apiFiles) {
    require(`./api/${file}`)(server, client);
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
