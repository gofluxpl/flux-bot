const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  MessageEmbed,
  MessageActionRow,
  MessageSelectMenu,
} = require("discord.js");
const axios = require("axios");
const fs = require("fs");

const lastCommandUsage = {};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("download")
    .setDescription("Check available versions for download!"),

  async execute(client, interaction) {
    const cooldown = 10000;
    const currentTime = Date.now();

    if (
      lastCommandUsage[interaction.user.id] &&
      currentTime - lastCommandUsage[interaction.user.id] < cooldown
    ) {
      const remainingTime = Math.ceil(
        (lastCommandUsage[interaction.user.id] + cooldown - currentTime) / 1000,
      );
      await interaction.reply({
        content: `You can use this command again in ${remainingTime} seconds.`,
        ephemeral: true,
      });
      return;
    }

    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("select")
        .setPlaceholder("Please select the appropriate category")
        .addOptions([
          {
            label: "Flux",
            description: "Click me",
            emoji: "1332297169004269621",
            value: "flux",
          },
          {
            label: "Discord Bot",
            description: "Click me",
            emoji: "1332295214366326835",
            value: "bot",
          },
          {
            label: "Website",
            description: "Click me",
            emoji: "1332298750978166814",
            value: "website",
          },
          {
            label: "Radio24",
            description: "Click me",
            emoji: "1333158014307405886",
            value: "radio24",
          },
        ]),
    );

    const filter = (i) =>
      i.customId === "select" && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
    });

    await interaction.deferReply();

    const packageData = JSON.parse(fs.readFileSync("./package.json", "utf8"));
    const packageVersion = packageData.version;

    const embed = new MessageEmbed()
      .setAuthor({
        name: `Download the latest version`,
        iconURL: client.user.displayAvatarURL({ dynamic: true, size: 1024 }),
      })
      .setDescription(
        "Select one item from the select menu to see available versions for download.",
      )
      .setColor("#3eaf7c")
      .setFooter({ text: "Flux © 2024 ・ Version: " + packageVersion });

    await interaction.followUp({
      embeds: [embed],
      components: [row],
    });

    collector.on("collect", async (i) => {
      if (i.customId === "select") {
        if (i.values[0] === "flux") {
          let text = "";
          let releasesText = "";

          const owner = "gofluxpl";
          const repo = "flux";
          const commits = await fetchCommits(owner, repo);

          const commitInfo = commits.map((commit) => {
            return {
              url: commit.html_url,
              message: commit.commit.message,
              sha: commit.sha.slice(0, 7),
            };
          });

          commitInfo.forEach((info) => {
            text += `[\`${info.sha}\`](${info.url}) ${info.message}\n`;
          });

          const releases = await fetchReleases(owner, repo);

          releases.forEach((release) => {
            releasesText += `[\`${release.name}\`](${release.zipball_url}) - ${release.tag_name}\n`;
          });

          i.update({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: `Download the latest version of Flux`,
                  iconURL: client.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                  }),
                })
                .addFields({
                  name: "Latest commits:",
                  value: text,
                })
                .setFooter({
                  text: "Flux © 2025 ・ Version: " + packageVersion,
                })
                .setColor("#3eaf7c"),
            ],
            allowedMentions: { repliedUser: false },
            components: [row],
          });
        }

        if (i.values[0] === "bot") {
          let text = "";
          let releasesText = "";

          const owner = "gofluxpl";
          const repo = "flux-bot";
          const commits = await fetchCommits(owner, repo);

          const commitInfo = commits.map((commit) => {
            return {
              url: commit.html_url,
              message: commit.commit.message,
              sha: commit.sha.slice(0, 7),
            };
          });

          commitInfo.forEach((info) => {
            text += `[\`${info.sha}\`](${info.url}) ${info.message}\n`;
          });

          const releases = await fetchReleases(owner, repo);

          releases.forEach((release) => {
            releasesText += `[\`${release.name}\`](${release.zipball_url}) - ${release.tag_name}\n`;
          });

          i.update({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: `Download the latest version of Flux Bot`,
                  iconURL: client.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                  }),
                })
                .addFields({
                  name: "Latest commits:",
                  value: text,
                })
                .setFooter({
                  text: "Flux © 2025 ・ Version: " + packageVersion,
                })
                .setColor("#3eaf7c"),
            ],
            allowedMentions: { repliedUser: false },
            components: [row],
          });
        }

        if (i.values[0] === "website") {
          let text = "";
          let releasesText = "";

          const owner = "gofluxpl";
          const repo = "website";
          const commits = await fetchCommits(owner, repo);

          const commitInfo = commits.map((commit) => {
            return {
              url: commit.html_url,
              message: commit.commit.message,
              sha: commit.sha.slice(0, 7),
            };
          });

          commitInfo.forEach((info) => {
            text += `[\`${info.sha}\`](${info.url}) ${info.message}\n`;
          });

          const releases = await fetchReleases(owner, repo);

          releases.forEach((release) => {
            releasesText += `[\`${release.name}\`](${release.zipball_url}) - ${release.tag_name}\n`;
          });

          i.update({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: `Download the latest version of Website`,
                  iconURL: client.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                  }),
                })
                .addFields({
                  name: "Latest commits:",
                  value: text,
                })
                .setFooter({
                  text: "Flux © 2025 ・ Version: " + packageVersion,
                })
                .setColor("#3eaf7c"),
            ],
            allowedMentions: { repliedUser: false },
            components: [row],
          });
        }

        if (i.values[0] === "radio24") {
          let text = "";
          let releasesText = "";

          const owner = "gofluxpl";
          const repo = "Radio24";
          const commits = await fetchCommits(owner, repo);

          const commitInfo = commits.map((commit) => {
            return {
              url: commit.html_url,
              message: commit.commit.message,
              sha: commit.sha.slice(0, 7),
            };
          });

          commitInfo.forEach((info) => {
            text += `[\`${info.sha}\`](${info.url}) ${info.message}\n`;
          });

          const releases = await fetchReleases(owner, repo);

          releases.forEach((release) => {
            releasesText += `[\`${release.name}\`](${release.zipball_url}) - ${release.tag_name}\n`;
          });

          i.update({
            embeds: [
              new MessageEmbed()
                .setAuthor({
                  name: `Download the latest version of Radio24`,
                  iconURL: client.user.displayAvatarURL({
                    dynamic: true,
                    size: 1024,
                  }),
                })
                .addFields({
                  name: "Latest commits:",
                  value: text,
                })
                .setFooter({
                  text: "Flux © 2025 ・ Version: " + packageVersion,
                })
                .setColor("#3eaf7c"),
            ],
            allowedMentions: { repliedUser: false },
            components: [row],
          });
        }
      }
    });

    lastCommandUsage[interaction.user.id] = currentTime;
  },
};

async function fetchCommits(owner, repo) {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/commits`,
    {
      params: {
        per_page: 10,
      },
    },
  );
  return response.data;
}

async function fetchReleases(owner, repo) {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/releases`,
    {
      params: {
        per_page: 10,
      },
    },
  );
  return response.data;
}
