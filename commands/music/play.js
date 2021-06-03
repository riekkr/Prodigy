module.exports = {
    name: 'play',
    description: 'Plays the requested song in the current voice channel.',
    aliases: ['p'],
    usage: '{p}play <songTitle>',
    ownerOnly: false,
    requiredPermissions: [],

    async execute(client, message, args) {
        const res = await client.manager.search(args.join(' '), message.author);
        const player = client.manager.create({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id
        });
        player.connect();
        player.queue.add(res.tracks[0]);    
        message.channel.send(`Enqueued track **${res.tracks[0].title}**.`);
        if (!player.playing && !player.paused && !player.queue.size) {
            player.play();
        }
    }
};