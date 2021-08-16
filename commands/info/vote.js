module.exports = {
    name: 'vote', // Command name
    description: 'Sends you a link to vote for Prodigy.', // Short description of what the command does
    aliases: ['vt'], // An array of alternate commands that trigger the command
    usage: '{p}vote', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run
    sameVC: false, // Requires the user to be in the same voice channel as the bot to run the command (Not done)

    async execute(client, message) {
        message.reply(
            '**Thank you for supporting Prodigy!**\n' +
            'You can vote for Prodigy by clicking on this link:\n' +
            '**https://prdg.tk/vote**\n' +
            'or if you don\'t trust short URLs:\n' +
            '**https://top.gg/bot/823090420338524161/vote**'
        );
    }
};