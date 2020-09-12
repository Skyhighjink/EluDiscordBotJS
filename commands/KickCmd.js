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
    var kickMsg = `You have been ${msgCmd} from ${message.guild.name} by ${message.author.username} for '${args.slice(sliceAmount).join(' ')}'`;

    // Checks to see if a DM Channel has been made. If not, creates one.
    if(!message.mentions.members.first().user.dmChannel) await message.mentions.members.first().createDM();
    
    // Sends a member message, then punishes the member as requested by the user.
    await message.mentions.members.first().user.dmChannel.send(kickMsg);
    if(msgCmd == "banned") message.guild.members.ban(message.mentions.members.first(), { reason: args.slice(sliceAmount).join(' ')});
    else message.guild.member(message.mentions.members.first()).kick(message.mentions.members.first(), { reason: args.slice(sliceAmount).join(' ')});

    // If silent wasn't an option the sender opted for, it sends a message in the discord channel the command was send inside of.
    if(!silent) await message.channel.send(`${message.mentions.members.first().user.username} has been ${msgCmd} by ${message.author.username} for ${args.slice(sliceAmount).join(' ')}`);

    // Logs the user's punishment in the
    let sqlObj = new sql();
    sqlObj.InsertPunishment(message.mentions.members.first().id, message.author.id, cmd, args.slice(sliceAmount).join(' '));
  }
};