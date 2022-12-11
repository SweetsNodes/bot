let Discord = require("discord.js");
let fs = require("fs");
let axios = require("axios");
let logger = require("@sweetsnodes/logger").default;
let config = require("./config");
let { Database } = require("@sweetsnodes/database");

module.exports = class Bot extends Discord.Client {
  constructor() {
    super();

    this.nests = [];
    this.eggs = [];
    this.servers = [];
    this.createList = {};
    this.logger = logger;
    this.db = new Database("database.json");
    this.createParams = (name, id) => {
      let toReturn = {};
      for (let [egg, filled] of Object.entries(this.createList)) {
        toReturn[egg] = filled(name, id);
      }
      return toReturn;
    };
    this.createServer = (data) => {
      return axios({
        url: config.pterodactyl.url + "/api/application/servers",
        method: "POST",
        followRedirect: true,
        maxRedirects: 5,
        headers: {
          Authorization: "Bearer " + config.pterodactyl.key,
          "Content-Type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
        data: data,
      });
    };
  }

  start() {
    logger.info("Logging in...");
    this.login(config.token);
    this.load();
  }

  load() {
    this.events();
    this.LoadEggs();
    this.anticrash();

    setInterval(() => {
      this.servers = [];

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
          this.servers.push(...resources.data.data);
        })
        .catch((err) => {
          logger.error("Error fetching users list");
        });

      setTimeout(() => {
        this.db.set("servers", this.servers);
      }, 1500);
    }, 60000);
  }

  events() {
    fs.readdir("./events/", (err, files) => {
      files = files.filter((f) => f.endsWith(".js"));
      files.map((f) => {
        const event = require(`./events/${f}`);
        this.on(f.split(".")[0], event.bind(null, this));
        delete require.cache[require.resolve(`./events/${f}`)];
      });
    });
  }

  anticrash() {
    process.on("unhandledRejection", (reason, p) => {
      logger.error("Unhandled Rejection/Catch");
      logger.error(reason, p);
    });
    process.on("uncaughtException", (err, origin) => {
      logger.error("Uncaught Exception/Catch");
      logger.error(err, origin);
    });
    process.on("uncaughtExceptionMonitor", (err, origin) => {
      logger.error("Uncaught Exception/Catch (MONITOR)");
      logger.error(err, origin);
    });
    process.on("multipleResolves", (type, promise, reason) => {
      logger.error("Multiple Resolves");
      logger.error(type, promise, reason);
    });
  }

  async LoadEggs() {
    let createList = {};
    let pterodactyl = config.pterodactyl;
    let data1 = await axios({
      url: `${pterodactyl.url}/api/application/nests`,
      headers: {
        Authorization: `Bearer ${pterodactyl.key}`,
      },
    });
    for (let i = 0; i < data1.data.data.length; i++) {
      this.nests.push({
        id: data1.data.data[i].attributes.id,
        name: data1.data.data[i].attributes.name,
      });
    }
    for (let i = 0; i < this.nests.length; i++) {
      let data2 = await axios({
        url: `${pterodactyl.url}/api/application/nests/${this.nests[i].id}/eggs?include=variables`,
        headers: {
          Authorization: `Bearer ${pterodactyl.key}`,
        },
      });
      for (let ii = 0; ii < data2.data.data.length; ii++) {
        let envs = {};
        for (
          let iii = 0;
          iii <
          data2.data.data[ii].attributes.relationships.variables.data.length;
          iii++
        ) {
          let thong =
            data2.data.data[ii].attributes.relationships.variables.data[iii]
              .attributes.env_variable;
          let thongv =
            data2.data.data[ii].attributes.relationships.variables.data[iii]
              .attributes.default_value;
          envs[thong] = thongv;
        }

        if (!data2.data.data[ii].attributes.name.startsWith("!")) {
          this.eggs.push({
            id: data2.data.data[ii].attributes.id,
            nest_name: this.nests[i].name,
            nest: data2.data.data[ii].attributes.nest,
            environment: envs,
            name: data2.data.data[ii].attributes.name,
            docker_image: data2.data.data[ii].attributes.docker_image,
            startup: data2.data.data[ii].attributes.startup,
          });
        }
      }
    }

    this.db.set("eggs", this.eggs);
    this.eggs.map((data) => {
      if (config.server.limit.enabled) {
        if (config.server.limit.eggs.includes(data.name.toLowerCase())) {
          this.createList[data.name.toLowerCase()] = (name, id) => ({
            name: name,
            user: id,
            nest: data.nest,
            egg: data.id,
            docker_image: data.docker_image,
            startup: data.startup,
            environment: data.environment,
            start_on_completion: false,
            limits: config.server.limit.resources,
            deploy: {
              locations: [],
              dedicated_ip: false,
              port_range: [],
            },
            feature_limits: {
              databases: 2,
              allocations: 1,
              backups: 10,
            },
          });
        } else {
          this.createList[data.name.toLowerCase()] = (name, id) => ({
            name: name,
            user: id,
            nest: data.nest,
            egg: data.id,
            docker_image: data.docker_image,
            startup: data.startup,
            environment: data.environment,
            start_on_completion: false,
            limits: config.server.default_resources,
            deploy: {
              locations: [],
              dedicated_ip: false,
              port_range: [],
            },
            feature_limits: {
              databases: 2,
              allocations: 1,
              backups: 10,
            },
          });
        }
      } else {
        this.createList[data.name.toLowerCase()] = (name, id) => ({
          name: name,
          user: id,
          nest: data.nest,
          egg: data.id,
          docker_image: data.docker_image,
          startup: data.startup,
          environment: data.environment,
          start_on_completion: false,
          limits: config.server.default_resources,
          deploy: {
            locations: [],
            dedicated_ip: false,
            port_range: [],
          },
          feature_limits: {
            databases: 2,
            allocations: 1,
            backups: 10,
          },
        });
      }
    });
  }
};
