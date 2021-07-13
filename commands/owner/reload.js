module.exports = {
    name: 'reload', // Command name
    description: 'Reloads the specified command.', // Short description of what the command does
    aliases: ['rl'], // An array of alternate commands that trigger the command
    usage: '{p}reload <commandName>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: true, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (!args.length) return message.channel.send('**Invalid usage:** Command `reload` requires exactly 1 string argument.');
        else if (!client.commands.has(args[0]) && !client.commands.find(c => c.aliases.includes(args[0]))) return message.reply('that\'s not a valid command.');
        else {
            const command = client.commands.get(args[0]) || client.commands.find(c => c.aliases.includes(args[0]));
            delete require.cache[require.resolve(`../${command.category}/${command.name}.js`)];
            client.commands.delete(command.name);
            const props = require(`../${command.category}/${command.name}.js`);
            props.category = command.category;
            client.commands.set(command.name, props);
            message.reply(`reloaded **${command.name}**.`);
            return;
        }
    }
};