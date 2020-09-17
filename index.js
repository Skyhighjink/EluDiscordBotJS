const Discord = require('discord.js');
const fs = require('fs');
/* Sql shit */
const sql = require('./Sql/SqlObject');
const sqlObj = new sql();

/* Gets prefix from DB */
var prefix;
sqlObj.GetConfigOption('DiscordPrefix', function(value) { prefix = value });

// Adding client w/ objects
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

/* Getting all command files and registering them*/ 
const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
files.forEach(file => {
  const cmdFile = require(`./commands/${file}`);

  if(!client.commands.get(cmdFile.name)) client.commands.set(cmdFile.name, cmdFile);

  /* Pulls and registers aliases */
  if(cmdFile.aliases){
    cmdFile.aliases.forEach(alias => {
      if(client.aliases.get(alias)) return console.log(`Command ${alias} already registerd!`);
      client.aliases.set(alias, cmdFile.name);
    });
  }
});

client.on('ready', () => { 
  var internal = setInterval(function() {
    console.log(`test : seconds - ${new Date().getSeconds()} : ms - ${new Date().getMilliseconds()}`)}, 1000);
    
  console.log(`${client.user.tag} is ready`); 
});

/* Command Handler*/
client.on('message', message => {
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  const aliases = client.aliases;
  const commands = client.commands;

  let command;

  /* Checks if author is bot -> Grabs command from correct collection*/
  if(message.author.bot || !message.guild || !message.content.startsWith(prefix)) return;
  if(commands.has(cmd)) command = command.get(cmd);
  else if(aliases.has(cmd)) command = command.get(aliases.get(cmd));
  
  // Adds command to the start of the array
  args.unshift(cmd);
  if(command) command.execute(message, args);
});

// Logs into Discord Client.
sqlObj.GetConfigOption('DiscordToken', function(value) {
  client.login(value);
});