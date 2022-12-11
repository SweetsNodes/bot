let axios = require("axios");
let config = require("../../config");

module.exports = async function (client, message, args) {
  if (!client.db.get(message.author.id)) return;
  let CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  let getPassword = () => {
    let password = "";
    while (password.length < 10) {
      password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
    }
    return password;
  };

  let password = await getPassword();
  axios({
    url:
      config.pterodactyl.url +
      "/api/application/users/" +
      client.db.get(message.author.id).consoleID,
    method: "GET",
    followRedirect: true,
    maxRedirects: 5,
    headers: {
      Authorization: "Bearer " + config.pterodactyl.key,
      "Content-Type": "application/json",
      Accept: "Application/vnd.pterodactyl.v1+json",
    },
  }).then((fetch) => {
    const data = {
      email: fetch.data.attributes.email,
      username: fetch.data.attributes.username,
      first_name: fetch.data.attributes.first_name,
      last_name: fetch.data.attributes.last_name,
      password: password,
    };

    axios({
      url:
        config.pterodactyl.url +
        "/api/application/users/" +
        client.db.get(message.author.id).consoleID,
      method: "PATCH",
      followRedirect: true,
      maxRedirects: 5,
      headers: {
        Authorization: "Bearer " + config.pterodactyl.key,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
      },
      data: data,
    })
      .then((user) => {
        message.channel.send(
          "The console account that is linked with the discord account has now been reset. Please check dms for the password."
        );
        client.users.cache
          .get(message.author.id)
          .send(`New password: ||**${data.password}**||`);
      })
      .catch((err) => {
        message.channel.send(err);
      });
  });
};
