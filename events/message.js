let config = require("../config");

module.exports = async function (client, message) {
  let prefix = config.prefix;
  if (message.author.bot) return;
  if (message.channel.type === "dm") return;
  if (message.content.indexOf(prefix) !== 0) return;
  let args = message.content.slice(prefix.length).trim().split(/ +/g);
  let commandargs = message.content.split(" ").slice(1).join(" ");
  let command = args.shift().toLowerCase();
  if (command === "server" || command === "user" || command === "admin") {
    let commandFile = require(`../commands/${command}/${args[0]}.js`);
    await commandFile(client, message, args);
  } else {
    let commandFile = require(`../commands/${command}.js`);
    await commandFile(client, message, args);
  }
};
