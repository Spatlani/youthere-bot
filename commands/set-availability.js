const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('set-availability')
    .setDescription('Set your work availability schedule')
    .addStringOption(option =>
      option.setName('timezone')
        .setDescription('Your timezone (e.g., America/New_York, Europe/London)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('schedule')
        .setDescription('Your schedule in format: day:start-end,start-end;day:start-end (use 24h format)')
        .setRequired(true)),
  
  async execute(interaction) {
    const timezone = interaction.options.getString('timezone');
    const scheduleString = interaction.options.getString('schedule');
    
    // Validate timezone
    if (!moment.tz.zone(timezone)) {
      return interaction.reply({ 
        content: `Invalid timezone. See the list of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`, 
        flags: { ephemeral: true }
      });
    }
    
    try {
      // Parse schedule
      const schedule = utils.parseScheduleString(scheduleString);
      
      // Save user availability
      const success = utils.setUserAvailability(
        interaction.user.id,
        interaction.user.username,
        timezone,
        schedule
      );
      
      if (success) {
        const formattedSchedule = utils.formatSchedule(schedule, timezone);
        await interaction.reply({ 
          content: `✅ Your availability has been set!\n\n${formattedSchedule}`, 
          flags: { ephemeral: true }
        });
      } else {
        await interaction.reply({ 
          content: '❌ Failed to save your availability. Please try again.', 
          flags: { ephemeral: true }
        });
      }
    } catch (error) {
      console.error('Error setting availability:', error);
      await interaction.reply({ 
        content: '❌ There was an error processing your schedule. Make sure it follows the format: day:start-end,start-end;day:start-end', 
        flags: { ephemeral: true }
      });
    }
  },
};