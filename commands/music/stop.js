module.exports = {
    name: 'stop', // Command name
    description: 'Stops the music for the server', // Short description of what the command does
    aliases: ['st'], // An array of alternate commands that trigger the command
    usage: '{p}stop', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: true, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message) {
        const player = client.manager.get(message.guild.id);
        player.destroy();
        return message.reply('stopped the music.');
    }
};
