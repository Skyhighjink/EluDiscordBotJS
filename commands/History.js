const sql = require('../Sql/SqlObject');
const fs = require('fs');
const RoleUtil = require('../Util/HasCorrectRole');

module.exports = {
  name: 'history',
  aliases: ['past', 'punishment', 'punishments'],
  descriptions: 'Gets previous Punishments of a user',
  execute(message, args){
    var data = JSON.parse(fs.readFileSync('./config.json'));
    sqlObj = new sql();

    var hasCorrectRole = await RoleUtil.HasRole('AllowedAccessHistoryRoles', message, false);

    if(!hasCorrectRole) return;

    var punishments = sqlObj.RetrievePunishments(message.mentions.users.first().id, function(value) {
      return value;
    });

    
  }
};