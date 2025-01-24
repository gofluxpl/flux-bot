const commands = [];
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = {
  name: "ready",

  execute: async (client) => {
    console.log("* Bot " + client.user.username + " is ready!");

    const packageData = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const packageVersion = packageData.version;

    setTimeout(() => {
      client.user.setPresence({
        activities: [
          {
            name: "v" + packageVersion,
          },
        ],
      });
    }, 5000);

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
