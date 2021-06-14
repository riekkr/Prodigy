module.exports = {
    name: 'dj', // Command name
    description: 'Toggles DJ only mode', // Short description of what the command does
    aliases: ['djonly', 'djo'], // An array of alternate commands that trigger the command
    usage: '{p}dj [on/off]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args, prefix, player) {
    }
};
