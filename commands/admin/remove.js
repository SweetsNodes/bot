let config = require("../../config");
let axios = require("axios");

module.exports = async function (client, message) {
  if (!message.member.hasPermission("ADMINISTRATOR")) return;
  axios({
    url:
      config.pterodactyl.url +
      "/api/application/servers?per_page=9999999999999",
    method: "GET",
    followRedirect: true,
    maxRedirects: 5,
    headers: {
      Authorization: "Bearer " + config.pterodactyl.key,
      "Content-Type": "application/json",
      Accept: "Application/vnd.pterodactyl.v1+json",
    },
  })
    .then((resources) => {
      resources.data.data.map((res) => {
        if (res.object !== "server") return;
        if (res.attributes.name.toLowerCase().includes("[active]")) return;
        axios({
          url:
            config.pterodactyl.url +
            "/api/application/servers/" +
            res.attributes.id +
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
            message.channel.send(
              `Deleted \`${res.attributes.name} (${res.attributes.identifier})\`!`
            );
          })
          .catch((err) => {
            message.channel.send("Error with the node. Please try again later");
          });
      });
    })
    .catch((err) => {
      console.log("Error fetching servers list");
      console.log(err);
    });
};
