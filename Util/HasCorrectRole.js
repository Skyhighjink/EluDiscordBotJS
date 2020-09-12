const fs = require('fs');
const Discord = require('discord.js');

async function HasRole(configOption, message, needToCompare){
  var data = JSON.parse(fs.readFileSync('./config.json'));

  var roles = data[configOption].split(';');
  var usesID = false;
  if(data[`${configOption}ID`] && data['PreferIDOverRoleNames'].toLowerCase() == 'true') roles, usedID = (data[`${configOption}ID`].split(';'), true);

  var allPunishGRole, allowedPunish;
  allPunishGRole = message.guild.roles.cache.filter(gRole => gRole instanceof Discord.Role).filter(function(role) {
    if(usesID) return roles.includes(role.id);  //roles.include(role.id); 
    else return roles.includes(role.name); //roles.include(role.name);
  });
  
  allPunishGRole.forEach(role => {
    role.members.mapValues(member => {
      if(member.user.id == message.author.id) allowedPunish = true;
    });
  });

  if(!allowedPunish) return false;

  if(needToCompare){
    await Promise.all([message.guild.members.fetch(message.mentions.users.first().id), message.guild.members.fetch(message.author.id)]).then((values) => {
      if(values[0].roles.highest.position >= values[1].roles.highest.position) return false;
    });
  }

  return true;
}

module.exports.HasRole = HasRole;