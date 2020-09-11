const Discord = require('discord.js');
const fs = require('fs');
const sql = require('./Sql/SqlObject');
const sqlObj = new sql();
var prefix;
sqlObj.GetConfigOption('DiscordPrefix', function(value) { prefix = value });

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
files.forEach(file => {
  const pull = require(`./commands/${file}`);

  if(!client.commands.get(pull.name)) client.commands.set(pull.name, pull);

  if(pull.aliases){
    pull.aliases.forEach(alias => {
      if(client.aliases.get(alias)) return console.log(`Command ${alias} already registerd!`);
      client.aliases.set(alias, pull.name);
    });
  }
});

client.on('ready', () => {
  console.log(`${client} is ready`);
});

client.on('message', message => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  let command;

  if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;
  if(client.commands.has(cmd)) command = client.commands.get(cmd);
  else if(client.aliases.has(cmd)) command = client.commands.get(client.aliases.get(cmd));
  
  // Adds command to the start of the array
  args.unshift(cmd);
  if(command) command.execute(message, args);
});

sqlObj.GetConfigOption('DiscordToken', function(value) {
  client.login(value);
});