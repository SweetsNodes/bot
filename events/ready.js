let { presence } = require("../config");

module.exports = function (client) {
  client.logger.info(`Logged in as ${client.user.tag}.`);

  client.user.setPresence(presence);
  client.users.cache.map((user) => {
    client.db.set(`user.${user.id}`, true);
  });
};
