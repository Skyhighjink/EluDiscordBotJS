const sql = require('../Sql/SqlObject');

module.exports = {
  name: 'kick',
  alias: ['ban'],
  description: 'Kicks someone from the Guild',
  async execute(message, args){   
    if(!message.mentions.users.first() || message.mentions.users.first().id == message.author.id) return;

    const Discord = require('discord.js');
    const fs = require('fs');
    var data = JSON.parse(fs.readFileSync('./config.json'));

    var cmd = args[0].toLowerCase().charAt(0).toUpperCase() + args[0].slice(1);
    console.log(cmd);
    var roles = data[`Allowed${cmd}Roles`].split(';');
    if(data[`Allowed${cmd}RolesID`] && data['PreferIDOverRoleNames'].toLowerCase() == 'true') roles = data[`Allowed${cmd}RolesID`].split(';');

    var allPunishGRole, allowedPunish;
    allPunishGRole = message.guild.roles.cache.filter(gRole => gRole instanceof Discord.Role).filter(role => roles.includes(role.name));

    allPunishGRole.forEach(role => {
      role.members.mapValues(member => {
        if(member.user.id == message.author.id) allowedPunish = true;
      });
    });

    if(!allowedPunish) return;

    // Checks role positions, if they have the same or higher rank that the author, just skips.
    await Promise.all([message.guild.members.fetch(message.mentions.users.first().id), message.guild.members.fetch(message.author.id)]).then((values) => {
      if(values[0].roles.highest.position >= values[1].roles.highest.position) return;
    });

    var msgCmd, silent, sliceAmount = ("kick", false, 2);
    if(cmd.toLowerCase() == "kick") msgCmd = "kicked";
    else msgCmd = "banned";

    var silent, sliceAmount = (false, 2);

    if(args[2].toLowerCase() == "silence" || args[2].toLowerCase() == "silent"){
      silent = true;
      sliceAmount = 3;
    }

    var kickMsg = `You have been ${msgCmd} from ${message.guild.name} by ${message.author.username} for '${args.slice(sliceAmount).join(' ')}'`;

    if(!message.mentions.members.first().user.dmChannel) await message.mentions.members.first().createDM();
    
    await message.mentions.members.first().user.dmChannel.send(kickMsg);
    if(msgCmd == "banned") message.guild.members.ban(message.mentions.members.first(), { reason: args.slice(sliceAmount).join(' ')});
    else message.guild.member(message.mentions.members.first()).kick(message.mentions.members.first(), { reason: args.slice(sliceAmount).join(' ')});

    if(!silent) await message.channel.send(`${message.mentions.members.first().user.username} has been ${msgCmd} by ${message.author.username} for ${args.slice(sliceAmount).join(' ')}`);

    let sqlObj = new sql();
    sqlObj.InsertPunishment(message.mentions.members.first().id, message.author.id, cmd, args.slice(sliceAmount).join(' '));
  }
};