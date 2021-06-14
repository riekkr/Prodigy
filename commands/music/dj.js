/* eslint-disable no-unreachable */
module.exports = {
    name: 'dj', // Command name
    description: 'Toggles DJ only mode', // Short description of what the command does
    aliases: ['djonly', 'djo'], // An array of alternate commands that trigger the command
    usage: '{p}dj [on/off]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix) {
        return message.reply('this command is currently disabled.');
        const rawState = await client.db.get(`${message.guild.id}-djonly`);
        const role = await client.db.get(`${message.guild.id}-djrole`);
        let currentState;
        let newState;
        if (rawState == 'off') currentState = false;
        else if (rawState == 'on') currentState = true;
        else currentState = undefined;
        if (!args.length) {
            if (currentState == true) {
                newState = false;
                message.reply('disabled DJ mode.');
            } else if (currentState == false) {
                newState = true;
                message.reply('enabled DJ mode.');
            } else if (!role) {
                newState = undefined;
                message.reply(`a DJ role has not been set. Set one using \`${prefix}djrole\`.`);
            }
        } else if (args[0].toLowerCase() != 'off' && args[0].toLowerCase() != 'on') {
            return message.channel.send('**Invalid usage:** Command `dj` needs either an `on` or `off` argument.');
        } else {
            if (args[0].toLowerCase() == 'on') {
                if (currentState == true) {
                    return message.reply('DJ mode is already enabled.');
                } else {
                    newState = true;
                    message.reply('enabled DJ mode.');
                }
            }
            if (args[0].toLowerCase() == 'off') {
                if (currentState == false) {
                    return message.reply('DJ mode is already disabled.');
                } else {
                    newState = false;
                    message.reply('disabled DJ mode.');
                }
            }
        }
        let newRaw;
        if (newState == true) newRaw = 'on';
        else if (newState == false || newState == undefined) newRaw = 'off';
        else newRaw = 'undefined';
        client.db.set(`${message.guild.id}-djonly`, newRaw);
    }
};
