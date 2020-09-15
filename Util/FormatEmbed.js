const Discord = require('discord.js');

function BuildEmbed(message){
  var embedObj;
  embedObj = new Discord.MessageEmbed();
  embedObj.addFields({ name: "History 1", value: GetField(message[0]), inline: true }, 
                     { name: "History 2", value: GetField(message[1]), inline: true },
                     { name: "History 3", value: GetField(message[2]), inline: true },
                     { name: "History 4", value: GetField(message[3]), inline: true },
                     { name: "History 5", value: GetField(message[4]), inline: true });

  return embedObj;
}

function GetField(message){
  if(message){
    return `Punished: '${message[0]}'\nPunisher: '${message[1]}'\nAction: '${message[2]}'\nMessage/Reason: '${message[3]}'\nDate of Punishment: '${message[4].toISOString().replace(/T/, ' ').replace(/\..+/, '')}'\n\n`
  }
  else{
    return 'EMPTY';
  }
}

module.exports.BuildEmbed = BuildEmbed;