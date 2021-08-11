module.exports = {
    name: 'dj', // Command name
    description: 'Toggles DJ only mode', // Short description of what the command does
    aliases: ['djonly', 'djo'], // An array of alternate commands that trigger the command
    usage: '{p}dj [on/off]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix) {
        const data = await client.db.get(`${message.guild.id}-dj`);
        if (!data) {
            message.reply('Configuration not found for this server. Creating one now.');
            await client.db.set(`${message.guild.id}-dj`, { state: false, role: undefined });
            message.reply(`Configuration created for this server. Set a DJ role using \`${prefix}djrole\` and try the command again.`);
            return;
        } 
        let json = data;
        if (json.role === undefined) {
            message.reply(`There isn't a DJ role set for this server. Set one using \`${prefix}djrole\` and try again.`);
            return;
        } 
        const currentState = json.state;
        if (!args.length) {
            if (currentState === false) {
                json.state = true;
                message.reply('Enabled DJ only mode for this server.');
            } else if (currentState === true) {
                json.state = false;
                message.reply('Disabled DJ only mode for this server.');
            }
            await client.db.set(`${message.guild.id}-dj`, json);
        } else {
            if (args[0] === 'on' || args[0] === 'true') {
                if (json.state === true) return message.reply('DJ only mode is already enabled.');
                json.state = true;
                message.reply('Enabled DJ only mode for this server.');
            } else if (args[0] === 'off' || args[0] === 'false') {
                if (json.state === false) return message.reply('DJ only mode is already disabled.');
                json.state = false;
                message.reply('Disabled DJ only mode for this server.');
            } else {
                return message.channel.send('**Invalid usage:** Command `dj` requires exactly 1 boolean / on / off argument.');
            }
            await client.db.set(`${message.guild.id}-dj`, json);
        }
    }
};
