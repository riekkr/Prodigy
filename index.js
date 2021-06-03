require('dotenv').config();
const Discord = require('discord.js');
// const express = require('express');
const { Manager } = require('erela.js');
const Spotify = require('erela.js-spotify');
const Catloggr = require('cat-loggr');
const logger = new Catloggr();
const fs = require('fs');
const config = require('./config.json');
const Keyv = require('keyv');

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
client.commands = new Discord.Collection();

const manager = new Manager({
    nodes: nodes,
    plugins: [
        new Spotify({
            clientID: config.spotifyClientID,
            clientSecret: config.spotifyClientSecret
        })
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

for (const file of music) {
    const cmd = require(`./commands/music/${file}`);
    client.commands.set(cmd.name.toLowerCase(), cmd);
}
for (const file of info) {
    const cmd = require(`./commands/info/${file}`);
    client.commands.set(cmd.name.toLowerCase(), cmd);
}

client.login(config.token);