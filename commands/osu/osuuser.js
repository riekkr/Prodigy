const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const baseUrl = 'https://osu.ppy.sh/api/get_user';
const recentPlays = 'https://osu.ppy.sh/api/get_user_recent';
const beatmap = 'https://osu.ppy.sh/api/get_beatmaps';

module.exports = {
    name: 'osuuser', // Command name
    description: 'Looks up an osu! user.', // Short description of what the command does
    aliases: ['osuusr'], // An array of alternate commands that trigger the command
    usage: '{p}osuuser <userID|userName> | [mode (osu!, taiko, ctb, mania)]', // How the command is invocated, "{p}" is replaced by the prefix in the server
    ownerOnly: false, // Restricts the command to the bot owner
    requiredPermissions: [], // An array of permissions the user needs to run the command
    dj: false, // Whether DJ only mode being on will prevent the command from being run

    async execute(client, message, args) {
        if (args.length < 1) return message.channel.send('**Invalid usage:** Command `osuuser` requires exactly 1 string argument and has one optional string / integer argument.');
        const parsedArgs = args.join(' ').split(' | ');
        const user = parsedArgs[0];
        const mode = parsedArgs[1] || 'osu!';
        let rawMode = 0;
        let displayMode;
        if (mode.toLowerCase() == 'osu!' || mode.toLowerCase() == 'osu' || mode == 0) {
            rawMode = 0;
            displayMode = 'osu!';
        } else if (mode.toLowerCase() == 'taiko' || mode == 1) {
            rawMode = 1;
            displayMode = 'osu!taiko';
        } else if (mode.toLowerCase() == 'ctb' || mode.toLowerCase() == 'catchthebeat' || mode == 'osu!catch' || mode == 'catch' || mode == 2) {
            rawMode = 2;
            displayMode = 'osu!catch';
        } else if (mode.toLowerCase() == 'mania' || mode.toLowerCase() == 'osu!mania' || mode.toLowerCase() == 'osumania' || mode == 3) {
            rawMode = 3;
            displayMode = 'osu!mania';
        } else {
            rawMode = 0;
            displayMode = 'osu!';
        }
        const fullURL = `${baseUrl}?k=${client.config.osuAPI}&u=${user}&m=${rawMode}`;
        const res = await fetch(fullURL);
        let json = await res.json();
        if (!json.length) {
            return message.reply(`user **${user}** was not found.`);
        }
        json = json[0];
        const recentURL = `${recentPlays}?k=${client.config.osuAPI}&u=${json.user_id}&m=${rawMode}&type=id`;
        const recent = await fetch(recentURL);
        let recentArr = await recent.json();
        let rawPlays = [];
        if (!recentArr.length) rawPlays.push('No recent plays');
        else {
            for (let i = 0; i < recentArr.length; i++) {
                let url = `${beatmap}?k=${client.config.osuAPI}&b=${recentArr[i].beatmap_id}`;
                let res = await fetch(url);
                res = await res.json();
                res = res[0];
                let raw = `**[${res.title}](https://osu.ppy.sh/beatmapsets/${res.beatmapset_id})** (mapped by [${res.creator}](https://osu.ppy.sh/users/${res.creator_id}))\n**Difficulty:** ${Number(res.difficultyrating).toFixed(3)}`;
                let rs = `${raw}\n**Score:** ${recentArr[i].score}\n**Max. Combo:** ${recentArr[i].maxcombo}\n**Misses:** ${recentArr[i].countmiss}\n**Mods Enabled:** ${recentArr[i].enabled_mods}\n**Rank:** ${recentArr[i].rank}\n**Date:** ${recentArr[i].date}`;
                rawPlays.push(rs);
                rawPlays.push('\n');
            }
        }
        const embed = new MessageEmbed()
            .setAuthor(json.username)
            .setTitle(displayMode)
            .addFields([
                {
                    name: 'User ID',
                    value: json.user_id,
                    inline: true
                },
                {
                    name: 'Username',
                    value: json.username,
                    inline: true
                },
                {
                    name: 'Join Date',
                    value: json.join_date,
                    inline: true
                },
                {
                    name: '300 Count',
                    value: json.count300,
                    inline: true
                },
                {
                    name: '100 Count',
                    value: json.count100,
                    inline: true
                },
                {
                    name: '50 Count',
                    value: json.count50,
                    inline: true
                },
                {
                    name: 'Play Count',
                    value: json.playcount,
                    inline: true
                },
                {
                    name: 'Ranked Score',
                    value: json.ranked_score,
                    inline: true
                },
                {
                    name: 'Total Score',
                    value: json.total_score,
                    inline: true
                },
                {
                    name: 'Performance Points (PP)',
                    value: json.pp_raw,
                    inline: true
                },
                {
                    name: 'Global PP Rank',
                    value: json.pp_rank,
                    inline: true
                },
                {
                    name: 'Country PP Rank',
                    value: json.pp_country_rank,
                    inline: true
                },
                {
                    name: 'Account Level',
                    value: Math.round(json.level),
                    inline: true
                },
                {
                    name: 'Accuracy',
                    value: Number(json.accuracy).toFixed(3) + '%',
                    inline: true
                },
                {
                    name: 'SS Rank Count',
                    value: json.count_rank_ss,
                    inline: true
                },
                {
                    name: 'SSH Rank Count',
                    value: json.count_rank_ssh,
                    inline: true
                },
                {
                    name: 'S Rank Count',
                    value: json.count_rank_s,
                    inline: true
                },
                {
                    name: 'SH Rank Count',
                    value: json.count_rank_sh,
                    inline: true
                },
                {
                    name: 'A Rank Count',
                    value: json.count_rank_a,
                    inline: true
                },
                {
                    name: 'Country',
                    value: json.country,
                    inline: true
                },
                {
                    name: 'Total Seconds Played',
                    value: json.total_seconds_played,
                    inline: true
                }
            ])
            .setColor(client.config.defaultColor)
            .setThumbnail(`https://s.ppy.sh/a/${json.user_id}`);
        const half = Math.ceil(rawPlays.length / 2);
        const firstHalf = rawPlays.slice(0, half);
        const secondHalf = rawPlays.slice(-half);
        const recentEmb1 = new MessageEmbed()
            .setTitle('Recent plays')
            .setColor(client.config.defaultColor)
            .setDescription(firstHalf.join('\n'));
        const recentEmb2 = new MessageEmbed()
            .setColor(client.config.defaultColor)
            .setFooter(client.config.defaultFooter)
            .setDescription(secondHalf.join('\n'));
        message.channel.send(embed);
        message.channel.send(recentEmb1);
        message.channel.send(recentEmb2);
        return;
    }
};
