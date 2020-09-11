const sql = require('../Sql/SqlObject');

module.exports = {
  name: 'kick',
  alias: ['ban'],
  description: 'Kicks someone from the Guild',
  async execute(message, args){   
    // Checks a few basic conditions 
    if(!message.mentions.users.first() || message.mentions.users.first().id == message.author.id || message.mentions.users.first().id == message.guild.owner.id) return;

    // Imports few libraries
    const Discord = require('discord.js');
    const fs = require('fs');
    // Gets data from the config file
    var data = JSON.parse(fs.readFileSync('./config.json'));

    // Gets command and formats it with capital first letter.
    var cmd = args[0].toLowerCase().charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();

    // Gets roles that are allowed to do specific command
    var roles = data[`Allowed${cmd}Roles`].split(';');
    if(data[`Allowed${cmd}RolesID`] && data['PreferIDOverRoleNames'].toLowerCase() == 'true') roles = data[`Allowed${cmd}RolesID`].split(';');

    // Grabs all roles with either correct ID/Name
    var allPunishGRole, allowedPunish;
    allPunishGRole = message.guild.roles.cache.filter(gRole => gRole instanceof Discord.Role).filter(role => { 
      if(data[`Allowed${cmd}RolesID`] && data['PreferIDOverRoleNames'].toLowerCase() == 'true') roles.include(role.id);
      else roles.includes(role.name);
    });

    // Goes through each member in each role and sees if they're a member of those roles.
    allPunishGRole.forEach(role => {
      role.members.mapValues(member => {
        if(member.user.id == message.author.id) allowedPunish = true;
      });
    });

    // If not allowed to punish, return
    if(!allowedPunish) return;

    // Checks role positions, if they have the same or higher rank that the author, just skips.
    await Promise.all([message.guild.members.fetch(message.mentions.users.first().id), message.guild.members.fetch(message.author.id)]).then((values) => {
      if(values[0].roles.highest.position >= values[1].roles.highest.position) return;
    });

    // Predefines 'standard' values to variables.
    var msgCmd, silent, sliceAmount = ("kick", false, 2);
    if(cmd.toLowerCase() == "kick") msgCmd = "kicked";
    else msgCmd = "banned";

    // Checks to see if silent/silence command is added to arguments by user.
    if(args[2].toLowerCase() == "silence" || args[2].toLowerCase() == "silent"){
      silent = true;
      sliceAmount = 3;
    }

    // Formats a kick message to send to user.
    var kickMsg = `You have been ${msgCmd} from ${message.guild.name} by ${message.author.username} for '${args.slice(sliceAmount).join(' ')}'`;

    // Checks to see if a DM Channel has been made. If not, creates one.
    if(!message.mentions.members.first().user.dmChannel) await message.mentions.members.first().createDM();
    
    // Sends a member message, then punishes the member as requested by the user.
    await message.mentions.members.first().user.dmChannel.send(kickMsg);
    if(msgCmd == "banned") message.guild.members.ban(message.mentions.members.first(), { reason: args.slice(sliceAmount).join(' ')});
    else message.guild.member(message.mentions.members.first()).kick(message.mentions.members.first(), { reason: args.slice(sliceAmount).join(' ')});

    // If silent wasn't an option the sender opted for, it sends a message in the discord channel the command was send inside of.
    if(!silent) await message.channel.send(`${message.mentions.members.first().user.username} has been ${msgCmd} by ${message.author.username} for ${args.slice(sliceAmount).join(' ')}`);

    // Logs the user's punishment in the DB.
    let sqlObj = new sql();
    sqlObj.InsertPunishment(message.mentions.members.first().id, message.author.id, cmd, args.slice(sliceAmount).join(' '));
  }
};