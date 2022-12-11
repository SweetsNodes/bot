let djs = require("discord.js");
let axios = require("axios");
let config = require("../../config");

module.exports = async function (client, message, args) {
  message.channel.send("Loading servers...");
  let arr = [];
  let userID = args[1] || message.author.id;

  if (client.db.get(userID) == null)
    return message.reply("Can't find account!");

  axios({
    url:
      config.pterodactyl.url +
      "/api/application/users/" +
      client.db.get(userID).consoleID +
      "?include=servers",
    method: "GET",
    followRedirect: true,
    maxRedirects: 5,
    headers: {
      Authorization: "Bearer " + config.pterodactyl.key,
      "Content-Type": "application/json",
      Accept: "Application/vnd.pterodactyl.v1+json",
    },
  })
    .then((response) => {
      const preoutput = response.data.attributes.relationships.servers.data;
      arr.push(...preoutput);
      setTimeout(async () => {
        setTimeout(() => {
          var clean =
            arr.length > 0
              ? arr.map(
                  (e) =>
                    "Server Name: `" +
                    e.attributes.name +
                    "`, Server ID: `" +
                    e.attributes.identifier +
                    "`\n"
                )
              : "You dont have any server.";
          const embed = new djs.MessageEmbed().addField(
            "__**Your Servers:**__",
            clean
          );
          message.channel.send(embed).catch((e) => {
            const embed = new djs.MessageEmbed()
              .setDescription(
                "Your server list is too long so here is a abstracted version!"
              )
              .addField(
                "__**Your Servers:**__",
                arr.map((e) => "`" + e.attributes.identifier + "`")
              );
            message.channel.send(embed);
          });
        }, 500);
      }, 5000);
    })
    .catch((err) => {});
};
