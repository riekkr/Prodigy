const { exec } = require('child_process');

module.exports = {
    name: 'run', // Command name
    description: 'Runs a command in a child process', // Short description of what the command does
    aliases: ['exec', 'execute'], // An array of alternate commands that trigger the command
    usage: '{p}run <consoleCommand>', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: true, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (!args.length) return message.channel.send('**Invalid usage:** Command `run` requires exactly one code argument');
        const msg = await message.channel.send('Running command...');
        exec(args.join(' '), async (error, data, getter) => {
            if (error) {
                return msg.edit(`\`ERROR\`\n\`\`\`js\n${error.message}\n\`\`\``);
            }
            let result;
            if (getter) {
                result = getter;
            } else {
                result = data;
            }
            return msg.edit(`\`\`\`js\n${result}\n\`\`\``);
        });
    }
};
