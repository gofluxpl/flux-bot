const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check ping"),

  async execute(client, interaction) {
    const lat = Date.now() - interaction.createdTimestamp;
    const api = Math.round(client.ws.ping);

    const embed = new MessageEmbed()
      .setDescription(
        "` Latency `: **" + lat + "ms**\n` Discord API `: **" + api + "ms**",
      )
      .setColor("#3eaf7c");
    await interaction.reply({
      embeds: [embed],
    });
  },
};
