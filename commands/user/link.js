let axios = require("axios");
let djs = require("discord.js");
let moment = require("moment");
let config = require("../../config");
require("moment-duration-format");

module.exports = async function (client, message, args) {
  if (!client.db.get(message.author.id)) {
    let server = message.guild;
    let channel = await server.channels
      .create(message.author.tag, "text", [
        {
          type: "role",
          id: message.guild.id,
          deny: 0x400,
        },
        {
          type: "user",
          id: message.author.id,
          deny: 1024,
        },
      ])
      .catch(console.error);
    message.reply(`Please check <#${channel.id}> to link your account.`);
    channel.updateOverwrite(message.author, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
      READ_MESSAGE_HISTORY: true,
    });
    let msg = await channel.send(message.author, {
      embed: new djs.MessageEmbed()
        .setColor(config.embed.color)
        .setDescription("Please enter your console email address")
        .setFooter(
          "You can type 'cancel' to cancel the request \n**This will take a few seconds to find your account.**"
        ),
    });

    const collector = new djs.MessageCollector(
      channel,
      (m) => m.author.id === message.author.id,
      {
        time: 60000,
        max: 1,
      }
    );

    collector.on("collect", async (msg) => {
      if (msg.content === "cancel") {
        return msg
          .edit("Request to link your account canceled.", null)
          .then(channel.delete());
      }
      let response = await axios({
        url:
          config.pterodactyl.url +
          "/api/application/users?per_page=9999999999999",
        method: "GET",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
          Authorization: "Bearer " + config.pterodactyl.key,
          "Content-Type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
      });
      console.log(response.data.data)
      const consoleUser = response.data.data.find((usr) =>
        usr.attributes ? usr.attributes.email === msg.content : false
      );
      if (!consoleUser) {
        channel.send(
          "I can't find a user with that account! \nRemoving channel!"
        );
        setTimeout(() => {
          channel.delete();
        }, 5000);
      } else {
        const code = codegen(500);
        channel.send(
          "Please type the number below to confirm!. You have 2mins"
        );
        channel.send(`${code}`);

        const collector = new djs.MessageCollector(
          channel,
          (m) => m.author.id === message.author.id,
          {
            time: 120000,
            max: 2,
          }
        );
        collector.on("collect", (_) => {
          if (_.content === code) {
            const timestamp = `${moment().format("HH:mm:ss")}`;
            const datestamp = `${moment().format("DD-MM-YYYY")}`;
            client.db.set(`${message.author.id}`, {
              discordID: message.author.id,
              consoleID: consoleUser.attributes.id,
              email: consoleUser.attributes.email,
              username: consoleUser.attributes.username,
              linkTime: timestamp,
              linkDate: datestamp,
            });

            channel.send("Account linked!").then(
              setTimeout(() => {
                channel.delete();
              }, 5000)
            );
          } else {
            channel.send(
              "Code is incorrect. Linking cancelled! \n\nRemoving channel!"
            );
            setTimeout(() => {
              channel.delete();
            }, 2000);
          }
        });
      }
    });
  } else {
    let { db } = client;
    let embed = new djs.MessageEmbed()
      .setColor(`GREEN`)
      .addField(`__**Username**__`, db.get(message.author.id).username)
      .addField(
        `__**Linked Date (DD/MM/YYYY)**__`,
        db.get(message.author.id).linkDate
      )
      .addField(`__**Linked Time**__`, db.get(message.author.id).linkTime);
    message.channel.send("This account is linked!", embed);
  }
};

function codegen(length) {
  let result = "";
  let characters = "123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
