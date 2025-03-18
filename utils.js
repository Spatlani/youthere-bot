const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
let UserAvailability;

// Try to import the MongoDB model, but don't fail if it's not available
try {
  UserAvailability = require('./models/UserAvailability');
} catch (error) {
  console.log('MongoDB model not available, using file-based storage');
}

// Data file path for fallback file-based storage
const dataPath = path.join(__dirname, 'data', 'availability.json');

// Helper function to determine if we're using MongoDB
const isUsingMongoDB = () => {
  return !!UserAvailability;
};

// Get all user availability data (file-based fallback)
function getAllAvailabilityFromFile() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading availability data from file:', error);
    return { users: [] };
  }
}

// Save all user availability data (file-based fallback)
function saveAllAvailabilityToFile(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving availability data to file:', error);
    return false;
  }
}

// Set a user's availability
async function setUserAvailability(userId, username, timezone, schedule) {
  // Try to use MongoDB if available
  if (isUsingMongoDB()) {
    try {
      await UserAvailability.findOneAndUpdate(
        { userId },
        { 
          userId, 
          username, 
          timezone, 
          schedule,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      return true;
    } catch (error) {
      console.error('Error saving availability data to MongoDB:', error);
      // Fall back to file-based storage if MongoDB fails
      console.log('Falling back to file storage...');
    }
  }
  
  // File-based storage fallback
  const data = getAllAvailabilityFromFile();
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
  
  return saveAllAvailabilityToFile(data);
}

// Get a user's availability
async function getUserAvailability(userId) {
  // Try to use MongoDB if available
  if (isUsingMongoDB()) {
    try {
      const user = await UserAvailability.findOne({ userId });
      if (user) {
        // Convert MongoDB document to plain object and format to match file-based storage
        const userObj = user.toObject();
        return {
          id: userObj.userId,
          username: userObj.username,
          timezone: userObj.timezone,
          schedule: userObj.schedule,
          updatedAt: userObj.updatedAt.toISOString()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user availability from MongoDB:', error);
      // Fall back to file-based storage if MongoDB fails
      console.log('Falling back to file storage...');
    }
  }
  
  // File-based storage fallback
  const data = getAllAvailabilityFromFile();
  return data.users.find(user => user.id === userId);
}

// Check if a user is currently available
async function isUserCurrentlyAvailable(userId) {
  const user = await getUserAvailability(userId);
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
async function getCurrentlyAvailableUsers() {
  // Try to use MongoDB if available
  if (isUsingMongoDB()) {
    try {
      const allUsers = await UserAvailability.find({});
      const availableUsers = [];
      
      for (const user of allUsers) {
        const now = moment().tz(user.timezone);
        const currentDay = now.format('dddd').toLowerCase();
        const currentTime = now.format('HH:mm');
        
        // Check if user has schedule for today
        if (!user.schedule[currentDay] || user.schedule[currentDay].length === 0) continue;
        
        // Check each time range for today
        for (const range of user.schedule[currentDay]) {
          const [start, end] = range.split('-');
          if (currentTime >= start && currentTime <= end) {
            // Convert MongoDB document to plain object and format
            const userObj = user.toObject();
            availableUsers.push({
              id: userObj.userId,
              username: userObj.username,
              timezone: userObj.timezone,
              schedule: userObj.schedule,
              updatedAt: userObj.updatedAt,
              localTime: now.format('HH:mm')
            });
            break;
          }
        }
      }
      
      return availableUsers;
    } catch (error) {
      console.error('Error getting available users from MongoDB:', error);
      // Fall back to file-based storage if MongoDB fails
      console.log('Falling back to file storage...');
    }
  }
  
  // File-based storage fallback
  const data = getAllAvailabilityFromFile();
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
async function getUserLocalTime(userId) {
  const user = await getUserAvailability(userId);
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
  getAllAvailability: getAllAvailabilityFromFile,
  setUserAvailability,
  getUserAvailability,
  isUserCurrentlyAvailable,
  getCurrentlyAvailableUsers,
  formatSchedule,
  getUserLocalTime,
  convertTime,
  parseScheduleString
};