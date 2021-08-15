const util = require('util');
const discord = require('discord.js');
const tags = require('common-tags');

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');
function escapeRegex (str) {
    return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}

module.exports = {
    name: 'eval',
    description: 'Evaluates provided code.',
    aliases: ['ev', 'run', 'evaluate', 'try'],
    usage: '{p}eval <code (blocks accepted)>',
    ownerOnly: true,
    requiredPermissions: [],
    lastResult: null,
    
    // eslint-disable-next-line no-unused-vars
    async execute(client, message, args, prefix) {
        args.script = args.join(' ');
        Object.defineProperty(this, '_sensitivePattern', { value: null, configurable: true });
        /* eslint-disable no-unused-vars */
        const player = client.manager.get(message.guild.id);
        const guild = message.guild;
        const msg = message;
        const ctx = client;
        const lastResult = this.lastResult;
        const doReply = val => {
            if (val instanceof Error) {
                message.reply(`Callback error: \`${val}\``);
            } else {
                const result = makeResultMessages(val, process.hrtime(this.hrStart));
                if (Array.isArray(result)) {
                    for (const item of result) message.reply(item);
                } else {
                    message.reply(result);
                }
            }
        };
        /* eslint-enable no-unused-vars */
        // This doesn't work right now
        if (args.script.startsWith('```') && args.script.endsWith('```')) {
            args.script = args.script.replace('```js', '').replace('```', '');
        }

        if (args.script.includes('client') || args.script.includes('ctx')) {
            if (!client.config.owners.includes(message.author.id)) {
                let scr = args.script;
                if (scr.includes('.setAvatar')) return message.reply('You aren\'t allowed to use the `.setAvatar()` function.');
                if (scr.includes('.setUsername')) return message.reply('You aren\'t allowed to use the `.setUsername()` function.');
                if (scr.includes('.setNickname')) return message.reply('You aren\'t allowed to use the `.setNickname()` function.');
                if (scr.includes('.setStatus')) return message.reply('You aren\'t allowed to use the `.setStatus()` function.');
                if (scr.includes('.setPresence')) return message.reply('You aren\'t allowed to use the `.setPresence()` function.');
                if (scr.includes('.setActivity')) return message.reply('You aren\'t allowed to use the `.setActivity()` function.');
                if (scr.includes('.destroy')) return message.reply('You aren\'t allowed to use the `.destroy()` function.');
                if (scr.includes('.login')) return message.reply('You aren\'t allowed to use the `.login()` function.');
            }
        }

        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(args.script);
            hrDiff = process.hrtime(hrStart);
        } catch (err) {
            return message.reply(`Error while evaluating: \`${err}\``);
        }

        this.hrStart = process.hrtime();
        const result = makeResultMessages(this.lastResult, hrDiff, args.script);
        if (Array.isArray(result)) {
            return result.map(item => message.reply(item));
        } else {
            return message.reply(result);
        }

        function makeResultMessages (result, hrDiff, input = null) {
            const inspected = util.inspect(result, { depth: 0 })
                .replace(nlPattern, '\n')
                .replace(sensitivePattern(), '--snip--');
            const split = inspected.split('\n');
            const last = inspected.length - 1;
            const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
            const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ? split[split.length - 1] : inspected[last];
            const prepend = `\`\`\`javascript\n${prependPart}\n`;
            const append = `\n${appendPart}\n\`\`\``;
            if (input) {
                return discord.Util.splitMessage(tags.stripIndents`
				    *Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				    \`\`\`javascript
				    ${inspected}
				    \`\`\`
			`, { maxLength: 1900, prepend, append });
            } else {
                return discord.Util.splitMessage(tags.stripIndents`
				    *Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				    \`\`\`javascript
				    ${inspected}
				    \`\`\`
			    `, { maxLength: 1900, prepend, append });
            }
        }
        function sensitivePattern() {
            if(!this._sensitivePattern) {
                let pattern = '';
                if(client.token) pattern += escapeRegex(client.token);
                Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi'), configurable: false });
            }
            return this._sensitivePattern;
        }
    }
};