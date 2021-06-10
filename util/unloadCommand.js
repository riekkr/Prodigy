module.exports = async (client, commandName) => {
    let command;
    if (client.commands.has(commandName)) {
        command = client.commands.get(commandName);
    } else if (client.commands.find(cmd => cmd.aliases.includes(commandName))) {
        command = client.commands.find(cmd => cmd.aliases.includes(commandName));
    }
    if (!command) {
        return 'Command does not exist.';
    }
    delete require.cache[require.resolve(`../commands/${command.category}/${command.name}.js`)];
    return true;
};