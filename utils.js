const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

// Data file path
const dataPath = path.join(__dirname, 'data', 'availability.json');

// Get all user availability data
function getAllAvailability() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading availability data:', error);
    return { users: [] };
  }
}

// Save all user availability data
function saveAllAvailability(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving availability data:', error);
    return false;
  }
}

// Set a user's availability
function setUserAvailability(userId, username, timezone, schedule) {
  const data = getAllAvailability();
  const userIndex = data.users.findIndex(user => user.id === userId);
  
  const userData = {
    id: userId,
    username,
    timezone,
    schedule,
    updatedAt: new Date().toISOString()
  };
  
  if (userIndex === -1) {
    // Add new user
    data.users.push(userData);
  } else {
    // Update existing user
    data.users[userIndex] = userData;
  }
  
  return saveAllAvailability(data);
}

// Get a user's availability
function getUserAvailability(userId) {
  const data = getAllAvailability();
  return data.users.find(user => user.id === userId);
}

// Check if a user is currently available
function isUserCurrentlyAvailable(userId) {
  const user = getUserAvailability(userId);
  if (!user) return false;
  
  const now = moment().tz(user.timezone);
  const currentDay = now.format('dddd').toLowerCase();
  const currentTime = now.format('HH:mm');
  
  // Check if user has schedule for today
  if (!user.schedule[currentDay]) return false;
  
  // Check each time range for today
  for (const range of user.schedule[currentDay]) {
    const [start, end] = range.split('-');
    if (currentTime >= start && currentTime <= end) {
      return true;
    }
  }
  
  return false;
}

// Get all currently available users
function getCurrentlyAvailableUsers() {
  const data = getAllAvailability();
  const availableUsers = [];
  
  for (const user of data.users) {
    const now = moment().tz(user.timezone);
    const currentDay = now.format('dddd').toLowerCase();
    const currentTime = now.format('HH:mm');
    
    // Check if user has schedule for today
    if (!user.schedule[currentDay]) continue;
    
    // Check each time range for today
    for (const range of user.schedule[currentDay]) {
      const [start, end] = range.split('-');
      if (currentTime >= start && currentTime <= end) {
        availableUsers.push({
          ...user,
          localTime: now.format('HH:mm')
        });
        break;
      }
    }
  }
  
  return availableUsers;
}

// Format schedule for display
function formatSchedule(schedule, timezone) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let formatted = '';
  
  for (const day of days) {
    const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
    formatted += `**${capitalizedDay}**: `;
    
    if (schedule[day] && schedule[day].length > 0) {
      formatted += schedule[day].join(', ');
    } else {
      formatted += 'Not available';
    }
    
    formatted += '\n';
  }
  
  formatted += `\n**Timezone**: ${timezone}`;
  return formatted;
}

// Get a user's local time
function getUserLocalTime(userId) {
  const user = getUserAvailability(userId);
  if (!user) return null;
  
  return moment().tz(user.timezone).format('YYYY-MM-DD HH:mm:ss');
}

// Convert time from one timezone to another
function convertTime(time, fromTimezone, toTimezone) {
  return moment.tz(time, 'YYYY-MM-DD HH:mm', fromTimezone)
    .tz(toTimezone)
    .format('YYYY-MM-DD HH:mm');
}

// Parse schedule string into schedule object
function parseScheduleString(scheduleString) {
  // Example: "monday:09:00-17:00,18:00-20:00;tuesday:09:00-17:00"
  const schedule = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
  };
  
  const days = scheduleString.split(';');
  
  for (const day of days) {
    if (!day) continue;
    
    const [dayName, times] = day.split(':');
    if (!times) continue;
    
    schedule[dayName.toLowerCase()] = times.split(',');
  }
  
  return schedule;
}

module.exports = {
  getAllAvailability,
  setUserAvailability,
  getUserAvailability,
  isUserCurrentlyAvailable,
  getCurrentlyAvailableUsers,
  formatSchedule,
  getUserLocalTime,
  convertTime,
  parseScheduleString
};