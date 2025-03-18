const { SlashCommandBuilder } = require('discord.js');
const moment = require('moment-timezone');
const utils = require('../utils');

// Mapping of common timezone abbreviations to IANA timezone identifiers
const TIMEZONE_MAPPING = {
  // Asia
  'IST': 'Asia/Kolkata',              // Indian Standard Time
  'NPT': 'Asia/Kathmandu',            // Nepal Time
  'HKT': 'Asia/Hong_Kong',            // Hong Kong Time
  'GMT+8': 'Asia/Hong_Kong',          // GMT+8 (same as Hong Kong)
  'JST': 'Asia/Tokyo',                // Japan Standard Time
  'KST': 'Asia/Seoul',                // Korea Standard Time
  'CST_ASIA': 'Asia/Shanghai',        // China Standard Time
  'SGT': 'Asia/Singapore',            // Singapore Time
  'PHT': 'Asia/Manila',               // Philippine Time
  'ICT': 'Asia/Bangkok',              // Indochina Time
  
  // Australia/Pacific
  'VIC': 'Australia/Melbourne',       // Victoria Time (Australia)
  'AEST': 'Australia/Sydney',         // Australian Eastern Standard Time
  'ACST': 'Australia/Adelaide',       // Australian Central Standard Time
  'AWST': 'Australia/Perth',          // Australian Western Standard Time
  'NZST': 'Pacific/Auckland',         // New Zealand Standard Time
  
  // North America
  'EST': 'America/New_York',          // Eastern Standard Time (US)
  'CST': 'America/Chicago',           // Central Standard Time (US)
  'MST': 'America/Denver',            // Mountain Standard Time
  'MDT': 'America/Denver',            // Mountain Daylight Time
  'PST': 'America/Los_Angeles',       // Pacific Standard Time
  'AKST': 'America/Anchorage',        // Alaska Standard Time
  'HST': 'Pacific/Honolulu',          // Hawaii Standard Time
  
  // Europe
  'GMT': 'Europe/London',             // Greenwich Mean Time
  'BST': 'Europe/London',             // British Summer Time
  'CET': 'Europe/Paris',              // Central European Time
  'CEST': 'Europe/Paris',             // Central European Summer Time
  'EET': 'Europe/Helsinki',           // Eastern European Time
  'EEST': 'Europe/Helsinki',          // Eastern European Summer Time
  'MSK': 'Europe/Moscow',             // Moscow Standard Time
  
  // Middle East/Africa
  'GST': 'Asia/Dubai',                // Gulf Standard Time
  'EAT': 'Africa/Nairobi',            // East Africa Time
  'SAST': 'Africa/Johannesburg',      // South Africa Standard Time
  
  // South/Central America
  'BRT': 'America/Sao_Paulo',         // Brasilia Time
  'ART': 'America/Argentina/Buenos_Aires', // Argentina Time
  'PET': 'America/Lima',              // Peru Time
  'COT': 'America/Bogota'             // Colombia Time
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('easy-schedule')
    .setDescription('Set your work schedule with a simpler format')
    .addStringOption(option => 
      option.setName('region')
        .setDescription('Select your timezone region')
        .setRequired(true)
        .addChoices(
          { name: 'Asia', value: 'asia' },
          { name: 'Australia/Pacific', value: 'australia' },
          { name: 'North America', value: 'north_america' },
          { name: 'Europe', value: 'europe' },
          { name: 'Middle East/Africa', value: 'middle_east_africa' },
          { name: 'South/Central America', value: 'south_america' }
        )
    )
    .addStringOption(option => 
      option.setName('timezone')
        .setDescription('Your timezone')
        .setRequired(true)
        .setAutocomplete(true)
    )
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
  
  async autocomplete(interaction) {
    const region = interaction.options.getString('region');
    const focusedValue = interaction.options.getFocused().toLowerCase();
    let choices = [];

    if (region === 'asia') {
      choices = [
        { name: 'IST - Indian Standard Time', value: 'IST' },
        { name: 'NPT - Nepal Time', value: 'NPT' },
        { name: 'HKT/GMT+8 - Hong Kong Time', value: 'HKT' },
        { name: 'JST - Japan Standard Time', value: 'JST' },
        { name: 'KST - Korea Standard Time', value: 'KST' },
        { name: 'CST (Asia) - China Standard Time', value: 'CST_ASIA' },
        { name: 'SGT - Singapore Time', value: 'SGT' },
        { name: 'PHT - Philippine Time', value: 'PHT' },
        { name: 'ICT - Indochina Time (Thailand)', value: 'ICT' }
      ];
    } else if (region === 'australia') {
      choices = [
        { name: 'AEST - Australian Eastern Standard Time', value: 'AEST' },
        { name: 'ACST - Australian Central Standard Time', value: 'ACST' },
        { name: 'AWST - Australian Western Standard Time', value: 'AWST' },
        { name: 'VIC - Victoria Time (Australia)', value: 'VIC' },
        { name: 'NZST - New Zealand Standard Time', value: 'NZST' }
      ];
    } else if (region === 'north_america') {
      choices = [
        { name: 'EST - Eastern Time (US)', value: 'EST' },
        { name: 'CST - Central Time (US)', value: 'CST' },
        { name: 'MST/MDT - Mountain Time', value: 'MST' },
        { name: 'PST - Pacific Time (US)', value: 'PST' },
        { name: 'AKST - Alaska Time', value: 'AKST' },
        { name: 'HST - Hawaii Time', value: 'HST' }
      ];
    } else if (region === 'europe') {
      choices = [
        { name: 'GMT/BST - UK Time', value: 'GMT' },
        { name: 'CET/CEST - Central European Time', value: 'CET' },
        { name: 'EET/EEST - Eastern European Time', value: 'EET' },
        { name: 'MSK - Moscow Time', value: 'MSK' }
      ];
    } else if (region === 'middle_east_africa') {
      choices = [
        { name: 'GST - Gulf Standard Time (UAE)', value: 'GST' },
        { name: 'EAT - East Africa Time', value: 'EAT' },
        { name: 'SAST - South Africa Standard Time', value: 'SAST' }
      ];
    } else if (region === 'south_america') {
      choices = [
        { name: 'BRT - Brasilia Time', value: 'BRT' },
        { name: 'ART - Argentina Time', value: 'ART' },
        { name: 'PET - Peru Time', value: 'PET' },
        { name: 'COT - Colombia Time', value: 'COT' }
      ];
    }

    // Filter choices based on user input
    const filtered = choices.filter(choice => 
      choice.name.toLowerCase().includes(focusedValue)
    );
    
    await interaction.respond(
      filtered.map(choice => ({ name: choice.name, value: choice.value }))
    );
  },
  
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