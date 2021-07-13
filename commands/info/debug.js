module.exports = {
    name: 'debug',
    description: 'Debug command',
    aliases: ['d'],
    usage: '{p}debug',
    ownerOnly: true,
    requiredPermissions: [],

    async execute(client, message, args, prefix) {
        message.channel.send('**Debug:** Command execution successful.' + '\n' + `**Message:** ${message.content}\n**Client:** ${client.user.toString()}\n**Arguments:** ${args.join(' ')}\n**Prefix:** ${prefix}\n**Version:** ${client.version}`);
    }
};