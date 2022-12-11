let djs = require("discord.js");
let humanizeDuration = require("humanize-duration");
let config = require("../config");

module.exports = function (client, message, args) {
  let date = new Date();
  let embed = new djs.MessageEmbed()
    .setColor(config.embed.color)
    .setFooter(config.embed.footer)
    .addField(
      ":white_check_mark: Uptime:",
      `**${humanizeDuration(client.uptime, { round: true })}**`,
      true
    )
    .addField(
      "Memory usage:",
      Math.trunc(process.memoryUsage().heapUsed / 1024 / 1000) + "mb",
      true
    )
    .addField("Bot ping to discord:", client.ws.ping + "ms", true);

  message.channel.send(embed);
};
