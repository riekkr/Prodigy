require('dotenv').config();
const Discord = require('discord.js');
const Catloggr = require('cat-loggr');
const logger = new Catloggr();
const fs = require('fs');
const config = require('./config.json');
const Keyv = require('keyv');
const { version } = require('./package.json');
const express = require('express');
const genshin = require('genshin-db');

const server = express();
server.listen(config.port, () => {
    logger.info('Listening on port ' + config.port);
});

const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');
const Deezer = require('erela.js-deezer');
const Facebook = require('erela.js-facebook');

const nodes = [
    {
        id: 'Prodigy',
        host: config.lavalinkHost,
        port: config.lavalinkPort,
        password: config.lavalinkPassword
    }
];

const client = new Discord.Client();
const db = new Keyv(config.mongoURL, { namespace: 'default' });
db.on('error', (err) => {
    logger.error('Connection error: ' + err);
});
client.db = db;
client.logger = logger;
client.config = config;
client.version = version;
client.config.defaultFooter = client.config.defaultFooter.replace('{version}', 'v' + version);
client.commands = new Discord.Collection();
client.snipes = new Discord.Collection();
client.genshin = genshin;
// client.buttons = require('discord-buttons')(client);

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
logger.info(`${client.commands.size} commands and ${Object.keys(client._events).length} events loaded.`);

process.on('unhandledRejection', async (err) => {
    logger.error('Unhandled rejection:');
    console.log(err);
});

process.on('exit', async () => {
    logger.info('Shutting down gracefully...');
});

const apiFiles = fs.readdirSync('./api').filter(file => file.endsWith('.js'));
for (const file of apiFiles) {
    require(`./api/${file}`)(server, client);
}
client.login(config.token);
