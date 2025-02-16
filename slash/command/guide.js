const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guide")
    .setDescription("Provides a guide with query")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Choose a query")
        .setRequired(true)
        .addChoices(
          { name: "Home : Getting Started", value: "getting_started" },
          { name: "Home : Installation", value: "installation" },
          { name: "Home : Documentation", value: "documentation" },
        ),
    ),

  async execute(client, interaction) {
    const query = interaction.options.getString("query");

    const embed = new MessageEmbed()
      .setTitle("Guide Information")
      .setColor("#3eaf7c")
      .setDescription(`**Query**: ${query.replace("_", " ")}`);

    await interaction.reply({
      embeds: [embed],
    });
  },
};
