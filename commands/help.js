let config = require("../config");
let djs = require("discord.js");
let commands = [
  "help",
  "ping",
  "server create",
  "server delete",
  "server list",
  "user new",
  "user link",
  "user password",
];

module.exports = function (client, message, args) {
  let embed = new djs.MessageEmbed()
    .setColor(config.embed.color)
    .setDescription(`\`${commands.join(",\n")}\``)
    .setFooter(config.embed.footer);

  message.channel.send(embed);
};
