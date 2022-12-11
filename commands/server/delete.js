let djs = require("discord.js");
let config = require("../../config");
let axios = require("axios");

module.exports = async function (client, message, args) {
  if (!args[1])
    return message.channel.send(
      "Command format: `" + config.prefix + "server delete <serveridhere>`"
    );
  if (args[1].match(/[0-9a-z]+/i) == null)
    return message.channel.send("lol only use english characters.");
  args[1] = args[1].match(/[0-9a-z]+/i)[0];
  message.channel
    .send(
      "Checking server `" +
        args[1] +
        "`\nPlease allow me 2 seconds to fetch this."
    )
    .then((msg) => {
      axios({
        url:
          config.pterodactyl.url +
          "/api/application/users/" +
          client.db.get(message.author.id).consoleID +
          "?include=servers",
        method: "GET",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
          Authorization: "Bearer " + config.pterodactyl.key,
          "Content-Type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
      }).then((response) => {
        const preoutput = response.data.attributes.relationships.servers.data;
        const output = preoutput.find((srv) =>
          srv.attributes ? srv.attributes.identifier == args[1] : false
        );
        setTimeout(async () => {
          setTimeout(async () => {
            if (!output) {
              msg.edit("Can't find that server :(");
            } else {
              if (
                output.attributes.user ===
                client.db.get(message.author.id).consoleID
              ) {
                msg.edit(
                  "Are you sure you want to delete `" +
                    output.attributes.name.split("@").join("@​") +
                    "`?\nPlease type `confirm` to delete this server. You have 1min until this will expire \n\n**You can not restore the server once it has been deleted and/or its files**"
                );
                const collector = await message.channel.createMessageCollector(
                  (m) => m.author.id === message.author.id,
                  {
                    time: 60000,
                    max: 2,
                  }
                );
                collector.on("collect", (message) => {
                  if (message.content === "confirm") {
                    message.delete();
                    msg.edit("Working...");
                    axios({
                      url:
                        config.pterodactyl.url +
                        "/api/application/servers/" +
                        output.attributes.id +
                        "/force",
                      method: "DELETE",
                      followRedirect: true,
                      maxRedirects: 5,
                      headers: {
                        Authorization: "Bearer " + config.pterodactyl.key,
                        "Content-Type": "application/json",
                        Accept: "Application/vnd.pterodactyl.v1+json",
                      },
                    })
                      .then((response) => {
                        msg.edit("Server deleted!");
                        collector.stop();
                      })
                      .catch((err) => {
                        msg.edit("Error with the node. Please try again later");
                        collector.stop();
                      });
                  } else {
                    message.delete();
                    msg.edit("Request cancelled!");
                    collector.stop();
                  }
                });
              } else {
                message.channel.send(
                  "You do not own that server. You cant delete it."
                );
              }
            }
          }, 500);
        }, 1000);
      });
    });
};
