module.exports = {
    name: 'spiralabyss', // Command name
    description: '', // Short description of what the command does
    aliases: [], // An array of alternate commands that trigger the command
    usage: '', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    /* eslint-disable no-unreachable */
    async execute(client, message, args, prefix, player) {
        return message.reply('this command is disabled.');
    }
};
