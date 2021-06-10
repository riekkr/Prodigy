module.exports = {
    name: 'reload', // Command name
    description: 'Reloads the specified command.', // Short description of what the command does
    aliases: ['rl', 'rld'], // An array of alternate commands that trigger the command
    usage: '{p}reload <commandName>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: true, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        let cmd;
        if (!client.commands.find(cmd => cmd.aliases.includes(args.join(' '))) && !client.commands.has(args.join(' '))) {
            return message.reply('that\'s not a valid command.');
        } else {
            cmd = client.commands.find(cmd => cmd.aliases.includes(args.join(' '))) || client.commands.get(args.join(' '));
            client.util.unloadCommand(client, args.join(' '));
            client.util.loadCommand(client, args.join(' '), cmd.category);
            return message.reply('reloaded command ' + `\`${cmd.name}\`` + '.');
        }
    }
};
