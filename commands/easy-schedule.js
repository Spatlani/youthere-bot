const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

// Mapping of common timezone abbreviations to IANA timezone identifiers
const TIMEZONE_MAPPING = {
  'IST': 'Asia/Kolkata',              // Indian Standard Time
  'VIC': 'Australia/Melbourne',       // Victoria Time (Australia)
  'MST': 'America/Denver',            // Mountain Standard Time
  'MDT': 'America/Denver',            // Mountain Daylight Time
  'EST': 'America/New_York',          // Eastern Standard Time (US)
  'NPT': 'Asia/Kathmandu',            // Nepal Time
  'CET': 'Europe/Paris',              // Central European Time
  'HKT': 'Asia/Hong_Kong',            // Hong Kong Time
  'GMT+8': 'Asia/Hong_Kong',          // GMT+8 (same as Hong Kong)
  'CST': 'America/Chicago'            // Central Standard Time (US)
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('easy-schedule')
    .setDescription('Set your work schedule with a simpler format')
    .addStringOption(option =>
      option.setName('timezone')
        .setDescription('Your timezone abbreviation (e.g., EST, CET, HKT)')
        .setRequired(true)
        .addChoices(
          { name: 'IST - Indian Standard Time', value: 'IST' },
          { name: 'VIC - Victoria Time (Australia)', value: 'VIC' },
          { name: 'MST/MDT - Mountain Time', value: 'MST' },
          { name: 'EST - Eastern Time (US)', value: 'EST' },
          { name: 'NPT - Nepal Time', value: 'NPT' },
          { name: 'CET - Central European Time', value: 'CET' },
          { name: 'HKT/GMT+8 - Hong Kong Time', value: 'HKT' },
          { name: 'CST - Central Time (US)', value: 'CST' }
        ))
    .addStringOption(option =>
      option.setName('weekdays')
        .setDescription('Are you available on weekdays? (Monday-Friday)')
        .setRequired(true)
        .addChoices(
          { name: 'Yes', value: 'yes' },
          { name: 'No', value: 'no' }
        ))
    .addStringOption(option =>
      option.setName('weekend')
        .setDescription('Are you available on weekends? (Saturday-Sunday)')
        .setRequired(true)
        .addChoices(
          { name: 'Yes', value: 'yes' },
          { name: 'No', value: 'no' }
        ))
    .addStringOption(option =>
      option.setName('start_time')
        .setDescription('Your daily start time (e.g., 9:00, 13:00)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('end_time')
        .setDescription('Your daily end time (e.g., 17:00, 22:00)')
        .setRequired(true)),
  
  async execute(interaction) {
    const timezoneCode = interaction.options.getString('timezone');
    const weekdays = interaction.options.getString('weekdays') === 'yes';
    const weekend = interaction.options.getString('weekend') === 'yes';
    const startTime = interaction.options.getString('start_time');
    const endTime = interaction.options.getString('end_time');
    
    // Get the IANA timezone from the mapping
    const timezone = TIMEZONE_MAPPING[timezoneCode];
    
    if (!timezone) {
      return interaction.reply({ 
        content: `Invalid timezone code. Please use one of the provided options.`, 
        flags: { ephemeral: true }
      });
    }
    
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return interaction.reply({ 
        content: 'Invalid time format. Please use HH:MM in 24-hour format (e.g., 09:00, 17:30).', 
        flags: { ephemeral: true }
      });
    }
    
    try {
      // Create schedule object
      const timeRange = `${startTime}-${endTime}`;
      const schedule = {
        monday: weekdays ? [timeRange] : [],
        tuesday: weekdays ? [timeRange] : [],
        wednesday: weekdays ? [timeRange] : [],
        thursday: weekdays ? [timeRange] : [],
        friday: weekdays ? [timeRange] : [],
        saturday: weekend ? [timeRange] : [],
        sunday: weekend ? [timeRange] : []
      };
      
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
        content: '❌ There was an error processing your schedule. Please try again.', 
        flags: { ephemeral: true }
      });
    }
  },
};