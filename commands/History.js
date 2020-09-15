const sql = require('../Sql/SqlObject');
const fs = require('fs');
const RoleUtil = require('../Util/HasCorrectRole');
const EmbedUtil = require('../Util/FormatEmbed');

module.exports = {
  name: 'history',
  aliases: ['past', 'punishment', 'punishments'],
  descriptions: 'Gets previous Punishments of a user',
  async execute(message, args){
    var data = JSON.parse(fs.readFileSync('./config.json'));
    sqlObj = new sql();

    var hasCorrectRole = await RoleUtil.HasRole('AllowedAccessHistoryRoles', message, false);

    if(!hasCorrectRole) return;

    var id = undefined;
    if(!(typeof message.mentions.users.first() === 'undefined')) {
      id = message.mentions.users.first().id;
    }

    sqlObj.RetrievePunishments(id, function(value) {
      message.channel.send(EmbedUtil.BuildEmbed(value));
    });
  }
};