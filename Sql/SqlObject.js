require('dotenv').config();

var express = require('express');
var mssql = require('mssql');
var app = express();

class Sql {
  constructor(){
    this.User = process.env.USER; // DB Username
    this.Password = process.env.PASSWORD; // DB Password
    this.Server = process.env.SERVER; // DB Server
    this.Database = process.env.DATABASE; // DB Table
    this.App = app; 
    this.Express = express;
    // DB connection config
    this.config = {
      server: this.Server,
      database: this.Database,
      user: this.User,
      password: this.Password,
      options: {
        encrypt: true,
        enableArithAbort: true
      }};
  }

  GetConfigOption(configName, callback){
    mssql.connect(this.config, function(err) {
      if (err) console.log(err);

      // Building request query
      let req = new mssql.Request();
      let query = `SELECT [ConfigValue] FROM [Configuration] WHERE [ConfigName] = '${configName}'`;
      req.query(query, function(err, data) {
        if(err) console.log(err)
          // Closes connection
          mssql.close();
          // Returns callback of first record
          return callback(data.recordset[0].ConfigValue);
      });
    });
    
    // Logs errors
    mssql.on('error', err => {
      console.log(err);
    });
  }

  InsertPunishment(targetDiscordId, senderDiscordId, punishment, reason){
    mssql.connect(this.config, function(err){
      if(err) console.log(err);

      // Building request query
      var req = new mssql.Request();
      var query = `INSERT INTO [Punishment]([PunishedDiscordID], [PunisherDiscordID], [Action], [Reason], [Duration], [PunishmentDate]) VALUES (`
      query += `'${targetDiscordId}', '${senderDiscordId}', '${punishment.toUpperCase()}', '${reason}', NULL, GetDate())`;
      // Sends query
      req.query(query, function(err, data){
        if(err) console.log(err)
          mssql.close();
      });
    });
  }

  async RetrievePunishments(targetId, callback){
    mssql.connect(this.config, function(err){
      if(err) console.log(err);
      // Builds query
      var query = "SELECT TOP(5) * FROM [Punishment] ";
      if(targetId) query += `WHERE [PunishedDiscordID] = '${targetId}'`;
      query += " ORDER BY [PunishmentDate] DESC";
      
      // Sends query
      var req = new mssql.Request();
      req.query(query, function(err, data){
        if(err) console.log(err) 
          mssql.close();
        
        var toReturn = [];

        for(var x = 0; x < data.recordset.length; x++){
          toReturn.push([data.recordset[x].PunishedDiscordID, data.recordset[x].PunisherDiscordID, data.recordset[x].Action, data.recordset[x].Reason, data.recordset[x].PunishmentDate]);
        }

        return callback(toReturn);
      });
    });
  }
}

module.exports = Sql;