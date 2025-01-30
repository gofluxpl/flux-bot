const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("docs")
    .setDescription("Provides a docs with query and optional version options")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Choose a query")
        .setRequired(true)
        .addChoices(
          { name: "Home : Getting Started", value: "getting_started" },
          { name: "Home : Installation", value: "installation" },
          { name: "Home : Documentation", value: "documentation" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("version")
        .setDescription("Select a version")
        .setRequired(false)
        .addChoices(
          { name: "Flux 1.0.0", value: "1.0.0" }
        )
    ),

  async execute(client, interaction) {
    const query = interaction.options.getString("query");
    const version = interaction.options.getString("version");

    const embed = new MessageEmbed()
      .setTitle("Guide Information")
      .setColor("#3eaf7c")
      .setDescription(
        `**Query**: ${query.replace("_", " ")}\n` +
          (version ? `**Version**: ${version}` : "**Version**: Not specified")
      );

    await interaction.reply({
      embeds: [embed],
    });
  },
};
