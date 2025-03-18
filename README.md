# Discord Availability Bot

A Discord bot that helps teams track member availability across different timezones.

## Features

- Set your working hours for each day of the week
- Check which team members are currently available
- View anyone's availability schedule
- Convert times between different timezones
- View your own schedule

## Setup Instructions

### Prerequisites

- Node.js (v16.9.0 or higher)
- npm (comes with Node.js)
- A Discord account and a server where you have admin permissions

### Step 1: Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab and click "Add Bot"
4. Under the "TOKEN" section, click "Reset Token" and copy your bot token
5. Under "Privileged Gateway Intents", enable:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT

### Step 2: Invite the Bot to Your Server

1. Go to the "OAuth2" tab, then "URL Generator"
2. Select the following scopes:
   - `bot`
   - `applications.commands`
3. Select these bot permissions:
   - `Read Messages/View Channels`
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### Step 3: Configure the Bot

1. Clone this repository to your local machine
2. Install dependencies:
   ```
   npm install
   ```
3. Edit the `.env` file:
   - Set `BOT_TOKEN` to your bot token
   - Set `CLIENT_ID` to your application ID (found in General Information tab)
   - Set `GUILD_ID` to your server ID (enable Developer Mode in Discord settings, then right-click your server and "Copy ID")

### Step 4: Deploy Commands

Run the following command to register slash commands with Discord:

```
node deploy-commands.js
```

### Step 5: Start the Bot

```
node index.js
```

## Usage

### Setting Your Availability (Detailed Version)

```
/set-availability timezone:<your timezone> schedule:<your schedule>
```

Example:
```
/set-availability timezone:America/New_York schedule:monday:09:00-17:00;tuesday:09:00-17:00;wednesday:09:00-17:00;thursday:09:00-17:00;friday:09:00-17:00
```

You can add multiple time ranges for each day by separating them with commas:

```
/set-availability timezone:Europe/London schedule:monday:09:00-12:00,13:00-17:00;tuesday:10:00-18:00
```

### Setting Your Availability (Simple Version)

```
/easy-schedule region:<select region> timezone:<select timezone> weekdays:<yes/no> weekend:<yes/no> start_time:<HH:MM> end_time:<HH:MM>
```

Example:
```
/easy-schedule region:North America timezone:EST weekdays:yes weekend:no start_time:09:00 end_time:17:00
```

This sets a 9-5 schedule on weekdays (Monday-Friday) in Eastern Time (US).

The command now uses a two-step selection process:
1. First select your region
2. Then select your timezone from that region

Available timezone codes: 

**Asia**
- IST (Indian Standard Time)
- NPT (Nepal Time)
- HKT/GMT+8 (Hong Kong Time)
- JST (Japan Standard Time)
- KST (Korea Standard Time)
- CST_ASIA (China Standard Time)
- SGT (Singapore Time)
- PHT (Philippine Time)
- ICT (Indochina Time - Thailand)

**Australia/Pacific**
- VIC (Victoria Time - Australia)
- AEST (Australian Eastern Standard Time)
- ACST (Australian Central Standard Time)
- AWST (Australian Western Standard Time)
- NZST (New Zealand Standard Time)

**North America**
- EST (Eastern Time - US)
- CST (Central Time - US)
- MST/MDT (Mountain Time)
- PST (Pacific Time - US)
- AKST (Alaska Time)
- HST (Hawaii Time)

**Europe**
- GMT/BST (UK Time)
- CET/CEST (Central European Time)
- EET/EEST (Eastern European Time)
- MSK (Moscow Time)

**Middle East/Africa**
- GST (Gulf Standard Time - UAE)
- EAT (East Africa Time)
- SAST (South Africa Standard Time)

**South/Central America**
- BRT (Brasilia Time)
- ART (Argentina Time)
- PET (Peru Time)
- COT (Colombia Time)

### Checking Who's Available

```
/who-is-available
```

This shows all team members who are currently in their working hours.

### Viewing Someone's Schedule

```
/view-schedule user:@username
```

This shows the full weekly schedule for a specific team member.

### Converting Time Between Timezones

```
/convert-time time:14:30 from_timezone:America/New_York to_timezone:Europe/London
```

You can also specify a date (optional):

```
/convert-time time:14:30 date:2025-04-01 from_timezone:America/New_York to_timezone:Europe/London
```

### Viewing Your Own Schedule

```
/my-schedule
```

This shows your current availability schedule.

## Timezones

When setting your timezone, use the IANA timezone database format. Common examples:

- `America/New_York` - Eastern Time (US & Canada)
- `America/Chicago` - Central Time (US & Canada)
- `America/Denver` - Mountain Time (US & Canada)
- `America/Los_Angeles` - Pacific Time (US & Canada)
- `Europe/London` - UK
- `Europe/Paris` - Central European Time
- `Asia/Tokyo` - Japan
- `Australia/Sydney` - Australia Eastern Time

For a full list of timezone identifiers, see [this Wikipedia page](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Troubleshooting

- If the bot doesn't respond, check if it's online in your server.
- If commands aren't working, try redeploying them with `node deploy-commands.js`.
- Check the console for error messages when running the bot.

## License

MIT
