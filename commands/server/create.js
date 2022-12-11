let djs = require("discord.js");
let config = require("../../config");
let axios = require("axios");

module.exports = async function (client, message, args) {
  let helpEmbed = new djs.MessageEmbed()
    .setColor(config.embed.color)
    .setDescription(
      `List of servers: (use ${config.prefix}server create <type> <name>)\n\n*Please note that some nodes might be having trouble connecting to the bot which may lead into this process giving out an error.*\n`
    );

  let nests = [...new Set(client.db.get("eggs").map((data) => data.nest_name))];
  let eggs = nests.map((nest) => {
    let getEggs = client.db
      .get("eggs")
      .filter((x) => x.nest_name === nest)
      .map((n) => {
        return n.name;
      });

    return {
      nest: nest,
      eggs: getEggs,
    };
  });

  eggs.map((egg) => {
    helpEmbed.addField(`**__${egg.nest}__**:`, egg.eggs.join("\n"), true);
  });

  let serverName =
    message.content.split(" ").slice(4).join(" ") || "change me!";
  let console = client.db.get(message.author.id);
  if (!console) {
    message.channel.send(
      "Oh no, Seems like you do not have an account linked to your discord ID.\n" +
        "If you have not made an account yet please check out `" +
        config.prefix +
        "user new` to create an account \n"
    );
    return;
  }

  let data = client.createParams(serverName, console.consoleID);
  if (!args[1]) {
    await message.channel.send(helpEmbed);
    return;
  }
  if (args[1] == "list") {
    await message.channel.send(helpEmbed);
    return;
  }

  client
    .createServer(data[args[1].toLowerCase()])
    .then((response) => {
      let embed = new djs.MessageEmbed()
        .setColor(`GREEN`)
        .addField(`__**Status:**__`, response.statusText)
        .addField(`__**Created for user ID:**__`, console.consoleID)
        .addField(`__**Server name:**__`, serverName)
        .addField(`__**Type:**__`, args[1].toLowerCase());
      message.channel.send(embed);
    })
    .catch((error) => {
      const embed = new djs.MessageEmbed()
        .setColor("RED")
        .addField(`__**Failed to create a new server**__`, error.message);
      message.reply(embed);
    });
};
