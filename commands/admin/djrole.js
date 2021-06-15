module.exports = {
    name: 'djrole', // Command name
    description: 'Sets the DJ role for the server.', // Short description of what the command does
    aliases: ['djr'], // An array of alternate commands that trigger the command
    usage: '{p}djrole [newRole]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: ['MANAGE_ROLES'], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    // eslint-disable-next-line no-unused-vars
    async execute(client, message, args, prefix, player) {
        return message.reply('this command is currently disabled.');
    }
};
