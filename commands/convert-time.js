const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('convert-time')
    .setDescription('Convert a time between timezones')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time to convert in format HH:MM (24h format)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('from_timezone')
        .setDescription('Source timezone (e.g., America/New_York, Europe/London)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('to_timezone')
        .setDescription('Target timezone (e.g., America/New_York, Europe/London)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Date in format YYYY-MM-DD (default: today)')
        .setRequired(false)),
  
  async execute(interaction) {
    const timeStr = interaction.options.getString('time');
    const dateStr = interaction.options.getString('date') || moment().format('YYYY-MM-DD');
    const fromTimezone = interaction.options.getString('from_timezone');
    const toTimezone = interaction.options.getString('to_timezone');
    
    // Validate timezones
    if (!moment.tz.zone(fromTimezone)) {
      return interaction.reply({ 
        content: `Invalid source timezone. See the list of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`, 
        flags: { ephemeral: true }
      });
    }
    
    if (!moment.tz.zone(toTimezone)) {
      return interaction.reply({ 
        content: `Invalid target timezone. See the list of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`, 
        flags: { ephemeral: true }
      });
    }
    
    try {
      // Validate time format
      if (!timeStr.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return interaction.reply({ 
          content: 'Invalid time format. Please use HH:MM in 24-hour format (e.g., 14:30 for 2:30 PM).', 
          flags: { ephemeral: true }
        });
      }
      
      // Validate date format
      if (!moment(dateStr, 'YYYY-MM-DD', true).isValid()) {
        return interaction.reply({ 
          content: 'Invalid date format. Please use YYYY-MM-DD (e.g., 2025-03-18).', 
          flags: { ephemeral: true }
        });
      }
      
      const dateTimeStr = `${dateStr} ${timeStr}`;
      const convertedTime = utils.convertTime(dateTimeStr, fromTimezone, toTimezone);
      
      await interaction.reply(`**Time Conversion**\n\n${dateTimeStr} in ${fromTimezone}\nis\n${convertedTime} in ${toTimezone}`);
      
    } catch (error) {
      console.error('Error converting time:', error);
      await interaction.reply({ 
        content: 'There was an error converting the time. Please check your input and try again.', 
        flags: { ephemeral: true }
      });
    }
  },
};