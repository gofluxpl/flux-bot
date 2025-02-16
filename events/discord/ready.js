const commands = [];
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");
const ping = require("ping");
const dns = require("dns").promises;
require("dotenv").config();

const DOMAINS = [
  "https://goflux.pl",
  "https://account.goflux.pl",
  "https://support.goflux.pl",
  "https://pkg.goflux.pl",
  "https://docs.goflux.pl",
  "https://api.goflux.pl",
  "https://kairo.goflux.pl",
  "https://devs.goflux.pl",
  "https://guide.goflux.pl",
];

const STATUS_EMOTES = {
  online: "<a:online:1340674480422256731>",
  offline: "<a:offline:1340674546650320959>",
};

module.exports = {
  name: "ready",

  execute: async (client) => {
    console.log("* Bot " + client.user.username + " is ready!");

    const packageData = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const packageVersion = packageData.version;

    const checkDomainStatus = async (domain) => {
      try {
        const cleanDomain = domain.replace(/^https?:\/\//, "");
        const addresses = await dns.lookup(cleanDomain, { family: 4 });

        const pingResult = await ping.promise.probe(addresses.address);
        const pingTime = pingResult.time !== "unknown" ? pingResult.time : 0;

        return {
          domain,
          ping: `${pingTime}ms`,
          status: STATUS_EMOTES.online,
        };
      } catch (error) {
        return {
          domain,
          ping: "0ms",
          status: STATUS_EMOTES.offline,
        };
      }
    };

    const updateMessage = async (channel, message) => {
      const results = await Promise.all(DOMAINS.map(checkDomainStatus));

      const embed = new MessageEmbed()
        .setTitle("🌐 Status・Flux Software")
        .setColor("#3eaf7c")
        .setDescription(
          results
            .map((r) => `${r.status} **${r.domain.replace("https://", "")}**・\`${r.ping}\``)
            .join("\n"),
        )
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    };

    setTimeout(() => {
      client.user.setPresence({
        activities: [
          {
            name: "v" + packageVersion,
          },
        ],
      });
    }, 5000);

    const channel = await client.channels.fetch("1340685061674242079");
    if (!channel) return console.error("❌ Nie znaleziono kanału!");

    const initEmbed = new MessageEmbed()
      .setTitle("🔄 Initialization...")
      .setColor("#3eaf7c")
      .setDescription("Downloading domain statuses, please wait...")
      .setTimestamp();
    const message = await channel.send({ embeds: [initEmbed] });

    await updateMessage(channel, message);

    setInterval(() => updateMessage(channel, message), 5 * 60 * 1000);

    const baseDir = path.join(process.cwd(), "/slash");

    fs.readdirSync(baseDir).forEach((dirs) => {
      const dirPath = path.join(baseDir, dirs);

      if (fs.lstatSync(dirPath).isDirectory()) {
        const files = fs
          .readdirSync(dirPath)
          .filter((file) => file.endsWith(".js") && !file.endsWith(".md"));

        for (const file of files) {
          const slash = require(path.join(dirPath, file));
          commands.push(slash.data.toJSON());
        }
      }
    });

    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN,
    );

    (async () => {
      try {
        await rest
          .put(Routes.applicationCommands(process.env.CLIENT_ID), {
            body: commands,
          })
          .catch((err) => console.log(err));

        console.log("* Slash commands registered!");
      } catch (error) {
        console.error(error);
      }
    })();
  },
};
