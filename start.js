const { Client, Collection, MessageEmbed } = require("discord.js");
const client = new Client({ intents: 32767 });
const fs = require("fs");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

client.login(process.env.DISCORD_TOKEN);

process.on("uncaughtException", console.log);

client.collection_slash = new Collection();

fs.readdirSync(process.cwd() + "/slash").forEach((dirs) => {
  const fullPath = path.join(process.cwd(), "/slash", dirs);
  if (fs.statSync(fullPath).isDirectory()) {
    const files = fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith(".js") && !file.endsWith(".md"));
    for (const file of files) {
      const slash = require(path.join(fullPath, file));
      client.collection_slash.set(slash.data.name, slash);
    }
  }
});

fs.readdirSync(process.cwd() + "/events").forEach((dirs) => {
  const fullPath = path.join(process.cwd(), "/events", dirs);
  if (fs.statSync(fullPath).isDirectory()) {
    const files = fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith(".js") && !file.endsWith(".md"));
    for (const file of files) {
      const event = require(path.join(fullPath, file));
      client.on(event.name, (...args) => event.execute(client, ...args));
    }
  }
});

function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const time = dateTime.toLocaleTimeString([], { hour12: false });
  const date = dateTime.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${time} ${date}`;
}

const defaultOwner = process.env.defaultOwner;
const defaultRepo = process.env.defaultRepo;

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  try {
    const sendRepo = async (results) => {
      try {
        const [owner, repo] = results[0].split("/");
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || Object.keys(data).length === 0) {
          throw new Error("Repository not found.");
        }

        const thumbnailUrl = data.owner.avatar_url;

        const embed = new MessageEmbed()
          .setAuthor({
            name: owner,
            iconURL: thumbnailUrl,
            url: "https://github.com/" + owner,
          })
          .setTitle(owner + "/" + repo)
          .setURL(data.html_url)
          .setDescription(data.description || "No description provided.")
          .setFooter({
            text: `⭐ ${data.stargazers_count} • 👀 ${data.watchers_count} • 🍴 ${data.forks} • 🎈 ${data.open_issues}`,
          });

        return embed;
      } catch (e) {
        return;
      }
    };

    const sendIssue = async (repo, issueNumber) => {
      try {
        const apiUrl = `https://api.github.com/repos/${defaultOwner}/${repo}/issues/${issueNumber}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || Object.keys(data).length === 0) {
          throw new Error("Issue not found.");
        }

        const isPullRequest = "pull_request" in data;
        let color = data.state === "open" ? "#adff7d" : "#ff957d";

        if (isPullRequest && data.pull_request.merged_at !== null) {
          color = "#a477f7";
        } else if (isPullRequest && data.draft) {
          color = "#6d7085";
        }

        const embed = new MessageEmbed()
          .setTitle(
            `${isPullRequest ? "Pull Request" : "Issue"} #${data.number}`,
          )
          .setURL(data.html_url)
          .setDescription(
            "` 🔍 Status `: " +
              (data.state === "open" ? "**🔓 Open**" : "**🔒 Closed**") +
              "\n` 💥 Subject `: **" +
              data.title +
              "**\n` 🍀 Label `: **" +
              (data.labels[0]?.name || "No label") +
              "**\n\n` 📆 Created `: **" +
              formatDateTime(data.created_at) +
              "**\n` ⏰ Updated `: **" +
              formatDateTime(data.updated_at) +
              "**",
          )
          .setAuthor({
            name: data.user.login,
            iconURL: data.user.avatar_url,
            url: data.user.html_url,
          })
          .setFooter({
            text: `💬 ${data.comments}`,
          })
          .setColor(color);

        return embed;
      } catch (e) {
        return new MessageEmbed()
          .setDescription("Error: Could not fetch issue data.")
          .setColor("RED");
      }
    };

    const regRepo = /[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+/g;
    const resRepo = regRepo.exec(message.content);
    if (resRepo?.length) {
      return message.reply({ embeds: [await sendRepo(resRepo)] });
    }

    const regIssue = /(?<=#)([0-9]+)/g;
    const resIssue = regIssue.exec(message.content);
    if (resIssue?.length) {
      return message.reply({
        embeds: [await sendIssue(defaultRepo, resIssue)],
      });
    }
  } catch (error) {
    return;
  }
});

module.exports = client;
