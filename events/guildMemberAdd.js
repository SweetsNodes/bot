let config = require("../config");

module.exports = function (client, member) {
  let channel = client.channels.cache.get(config.welcome);
  if (!channel) throw new Error("Channel doesn't exist!");

  client.logger.info(`Member join: ${member.user.tag}`);

  if (!client.db.has(`user.${member.user.id}`)) {
    client.db.set(`user.${member.user.id}`, true);
    return channel.send(`<@${member.user.id}>, ยินดีต้อนรับ!`);
  } else {
    client.db.set(`user.${member.user.id}`, true);
    return channel.send(`<@${member.user.id}>, ยินดีต้อนรับกลับมา!`);
  }
};
