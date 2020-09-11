require('dotenv').config();

var express = require('express');
var mssql = require('mssql');
var app = express();

class Sql {
  constructor(){
    this.User = process.env.USER;
    this.Password = process.env.PASSWORD;
    this.Server = process.env.SERVER;
    this.Database = process.env.DATABASE;
    this.App = app;
    this.Express = express;
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

      let req = new mssql.Request();
      let query = `SELECT [ConfigValue] FROM [Configuration] WHERE [ConfigName] = '${configName}'`;
      req.query(query, function(err, data) {
        if(err) console.log(err)
          mssql.close();
          return callback(data.recordset[0].ConfigValue);
      });
    });
    
    mssql.on('error', err => {
      console.log(err);
    });
  }

  InsertPunishment(targetDiscordId, senderDiscordId, punishment, reason){
    mssql.connect(this.config, function(err){
      if(err) console.log(err);

      var req = new mssql.Request();
      var query = `INSERT INTO [Punishment]([PunishedDiscordID], [PunisherDiscordID], [Action], [Reason], [Duration], [PunishmentDate]) VALUES (`
      query += `'${targetDiscordId}', '${senderDiscordId}', '${punishment.toUpperCase()}', '${reason}', NULL, GetDate())`;
      req.query(query, function(err, data){
        if(err) console.log(err)
          mssql.close();
      });
    });
  }

  RetrievePunishments(targetId, callback){
    
  }
}

module.exports = Sql;