const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('view-schedule')
    .setDescription('View a team member\'s availability schedule')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose schedule you want to view')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const userData = utils.getUserAvailability(targetUser.id);
    
    if (!userData) {
      return interaction.reply(`${targetUser.username} hasn't set their availability schedule yet.`);
    }
    
    const userLocalTime = moment().tz(userData.timezone).format('YYYY-MM-DD HH:mm:ss');
    const isAvailable = utils.isUserCurrentlyAvailable(targetUser.id);
    
    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Availability`)
      .setColor(isAvailable ? 0x00FF00 : 0xFF0000)
      .setDescription(`Current status: ${isAvailable ? '✅ Available' : '❌ Not available'}`)
      .addFields({
        name: 'Local Time',
        value: `${userLocalTime} (${userData.timezone})`,
        inline: false
      });
    
    // Add weekly schedule
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
      let scheduleText = 'Not available';
      
      if (userData.schedule[day] && userData.schedule[day].length > 0) {
        scheduleText = userData.schedule[day].join(', ');
      }
      
      embed.addFields({
        name: capitalizedDay,
        value: scheduleText,
        inline: true
      });
    }
    
    embed.setFooter({ text: `Last updated: ${new Date(userData.updatedAt).toLocaleString()}` });
    
    await interaction.reply({ embeds: [embed] });
  },
};