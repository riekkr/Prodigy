module.exports = {
    name: 'bassboost', // Command name
    description: 'Applies the bass boost filter.', // Short description of what the command does
    aliases: ['bb', 'bass'], // An array of alternate commands that trigger the command
    usage: '{p}bassboost [level|none/low/medium/high]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
        const levels = {
            none: 0.0,
            low: 0.10,
            medium: 0.15,
            high: 0.25
        };
        if (!player) return message.reply('there is nothing playing.');
        const { channel } = message.member.voice;
        if (!channel) return message.reply('you aren\'t in a voice channel.');
        if (channel.id !== player.voiceChannel) return message.reply('you aren\'t in the same voice channel as the bot.');

        let level = 'none';
        if (args.length && args[0].toLowerCase() in levels) level = args[0].toLowerCase();
        const bands = new Array(3)
            .fill(null)
            .map((_, i) =>
                ({ band: i, gain: levels[level] })
            );
        player.setEQ(...bands);
        return message.reply(`set bass boost level to ${level}.`);
    }
};