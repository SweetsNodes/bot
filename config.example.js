module.exports = {
  token: "" /* Bot token */,
  prefix: "s/" /* Bot prefix */,
  welcome: "123456789" /* Welcome channel id */,
  autorole: "123456789" /* Member role id */,
  pterodactyl: {
    /* Pterodactyl config */
    url: "https://panel.sweetsnodes.online" /* Pterodactyl panel */,
    key: "abcdefg123456789" /* Pterodactyl admin key */,
    client: "123456789abcdefg" /* Pterodactyl client key */,
  },
  presence: {
    status: "idle",
    activity: {
      name: "SweetsNodes - v2.1.1",
      type: "WATCHING",
    },
  },
  server: {
    limit: {
      enabled: true,
      eggs: ["purpur", "paper", "spigot", "lavalink", "nukkit", "geyser"],
      resources: {
        cpu: 75 /* Percent */,
        memory: 2048 /* MegaBytes */,
        disk: 10240 /* MegaBytes */,
        swap: -1 /* -1 | 0 */,
        io: 5 /* 1 - 10 */,
      },
    },
    default_resources: {
      cpu: 0 /* Percent */,
      memory: 0 /* MegaBytes */,
      disk: 0 /* MegaBytes */,
      swap: -1 /* -1 | 0 */,
      io: 10 /* 1 - 10 */,
    },
  },
  embed: {
    color: "#00a6cf",
    footer: "SweetsNodes - v2.1.1",
  },
};
