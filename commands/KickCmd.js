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
    const RoleUtil = require('../Util/HasCorrectRole');

    /* Variables used often */
    const target = message.mentions.members.first();
    const authorUsername = message.author.username;
    const currGuild = message.guild;

    // Gets command and formats it with capital first letter.
    var cmd = args[0].toLowerCase().charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();

    var canPunish = await RoleUtil.HasRole(`Allowed${cmd}Roles`, message, true);

    if(!canPunish) return;

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
    var kickMsg = `You have been ${msgCmd} from ${currGuild.name} by ${authorUsername} for '${args.slice(sliceAmount).join(' ')}'`;

    // Checks to see if a DM Channel has been made. If not, creates one.
    if(!target.user.dmChannel) await target.createDM();
    
    // Sends a member message, then punishes the member as requested by the user.
    await target.user.dmChannel.send(kickMsg);
    if(msgCmd == "banned") currGuild.members.ban(target, { reason: args.slice(sliceAmount).join(' ')});
    else currGuild.member(target).kick(target, { reason: args.slice(sliceAmount).join(' ')});

    // If silent wasn't an option the sender opted for, it sends a message in the discord channel the command was send inside of.
    if(!silent) await message.channel.send(`${target.user.username} has been ${msgCmd} by ${authorUsername} for ${args.slice(sliceAmount).join(' ')}`);

    // Logs the user's punishment in the
    let sqlObj = new sql();
    sqlObj.InsertPunishment(target.id, message.author.id, cmd, args.slice(sliceAmount).join(' '));
  }
};