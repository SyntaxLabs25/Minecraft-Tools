const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const TOKEN = ''; // ← Put your token here
const DATA_FOLDER = path.join(__dirname, 'data');
const USERS_FOLDER = path.join(DATA_FOLDER, 'users');
const ORES_FILE = path.join(DATA_FOLDER, 'ores.json');
const CROPS_FILE = path.join(DATA_FOLDER, 'crops.json');
const MINING_STATS_FILE = path.join(DATA_FOLDER, 'mining-stats.json');
const TRACKER_ORES_FILE = path.join(DATA_FOLDER, 'tracker-ores.json');
const TRACKER_CROPS_FILE = path.join(DATA_FOLDER, 'tracker-crops.json');
const TRACKER_MINING_FILE = path.join(DATA_FOLDER, 'tracker-mining.json');

// Ensure folders
if (!fs.existsSync(DATA_FOLDER)) fs.mkdirSync(DATA_FOLDER);
if (!fs.existsSync(USERS_FOLDER)) fs.mkdirSync(USERS_FOLDER);

// Defaults
const defaultOres = {
  "Coal": 0, "Charcoal": 0, "Iron": 0, "Copper": 0, "Gold": 0, "Emerald": 0,
  "Lapuz": 0, "Diamon": 0, "Quartz": 0, "Amethest": 0, "Netherite Scrap": 0, "Netherite": 0
};
const defaultCrops = { "Wheat": 0, "Potatoes": 0, "Carrots": 0, "Melons": 0, "Pumpkins": 0, "Sugar Cane": 0 };
const defaultMiningStats = {
  currentDay: '', todayMined: 0, biggestDay: 0, biggestDate: '', currentStreak: 0, history: {}
};

// Load data
let ores = fs.existsSync(ORES_FILE) ? JSON.parse(fs.readFileSync(ORES_FILE, 'utf8')) : { ...defaultOres };
let crops = fs.existsSync(CROPS_FILE) ? JSON.parse(fs.readFileSync(CROPS_FILE, 'utf8')) : { ...defaultCrops };
let miningStats = fs.existsSync(MINING_STATS_FILE) ? JSON.parse(fs.readFileSync(MINING_STATS_FILE, 'utf8')) : { ...defaultMiningStats };
let trackerOres = fs.existsSync(TRACKER_ORES_FILE) ? JSON.parse(fs.readFileSync(TRACKER_ORES_FILE, 'utf8')) : null;
let trackerCrops = fs.existsSync(TRACKER_CROPS_FILE) ? JSON.parse(fs.readFileSync(TRACKER_CROPS_FILE, 'utf8')) : null;
let trackerMining = fs.existsSync(TRACKER_MINING_FILE) ? JSON.parse(fs.readFileSync(TRACKER_MINING_FILE, 'utf8')) : null;

// Save functions
function saveOres() { fs.writeFileSync(ORES_FILE, JSON.stringify(ores, null, 2)); }
function saveCrops() { fs.writeFileSync(CROPS_FILE, JSON.stringify(crops, null, 2)); }
function saveMiningStats() { fs.writeFileSync(MINING_STATS_FILE, JSON.stringify(miningStats, null, 2)); }

// Inventory functions
function getUserInv(userId) {
  const file = path.join(USERS_FOLDER, `${userId}.json`);
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return { tools: {}, armor: {}, food: {}, enchantments: {}, uncategorized: {} };
}
function saveUserInv(userId, inv) {
  const file = path.join(USERS_FOLDER, `${userId}.json`);
  fs.writeFileSync(file, JSON.stringify(inv, null, 2));
}

// Auto-categorize item
const categoryRegex = {
  tools: [/(pickaxe|axe|shovel|hoe|sword|bow|crossbow|trident|fishing_rod|shears)/i],
  armor: [/(helmet|chestplate|leggings|boots)/i],
  food: [/(steak|porkchop|chicken|cod|salmon|bread|apple|carrot|potato|beetroot|melon|pumpkin|cake|cookie|honey|chorus)/i],
  enchantments: [/enchanted_book/i]
};
function getCategory(itemName) {
  const lower = itemName.toLowerCase();
  for (const [cat, regexes] of Object.entries(categoryRegex)) {
    if (regexes.some(r => r.test(lower))) return cat;
  }
  return 'uncategorized';
}

// Mining Stats functions
function pruneHistory() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  Object.keys(miningStats.history).forEach(date => {
    if (date < cutoffStr) delete miningStats.history[date];
  });
}

function updateMiningStats(amount) {
  const todayStr = new Date().toISOString().split('T')[0];
  pruneHistory();

  if (miningStats.currentDay !== todayStr) {
    // Save previous day
    if (miningStats.currentDay) {
      miningStats.history[miningStats.currentDay] = miningStats.todayMined;
      if (miningStats.todayMined > miningStats.biggestDay) {
        miningStats.biggestDay = miningStats.todayMined;
        miningStats.biggestDate = miningStats.currentDay;
      }
    }
    miningStats.currentDay = todayStr;
    miningStats.todayMined = 0;
  }

  miningStats.todayMined += amount;
  if (miningStats.todayMined > miningStats.biggestDay) {
    miningStats.biggestDay = miningStats.todayMined;
    miningStats.biggestDate = todayStr;
  }

  // Calc streak (consecutive days with >0, including today)
  let streak = 0;
  let checkDate = new Date(todayStr);
  checkDate.setDate(checkDate.getDate() - 1);
  while (miningStats.history[checkDate.toISOString().split('T')[0]] > 0) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
    if (streak > 100) break;
  }
  miningStats.currentStreak = streak + 1; // + today since mined today

  saveMiningStats();
}

function fixMiningStats() {
  const todayStr = new Date().toISOString().split('T')[0];
  pruneHistory();

  if (miningStats.currentDay !== todayStr) {
    if (miningStats.currentDay) {
      miningStats.history[miningStats.currentDay] = miningStats.todayMined;
      if (miningStats.todayMined > miningStats.biggestDay) {
        miningStats.biggestDay = miningStats.todayMined;
        miningStats.biggestDate = miningStats.currentDay;
      }
    }
    miningStats.currentDay = todayStr;
    miningStats.todayMined = 0;

    // Streak without today
    let streak = 0;
    let checkDate = new Date(todayStr);
    checkDate.setDate(checkDate.getDate() - 1);
    while (miningStats.history[checkDate.toISOString().split('T')[0]] > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
      if (streak > 100) break;
    }
    miningStats.currentStreak = streak;

    saveMiningStats();
  }
}

// Update embeds
async function updateEmbed(message, type) {
  const data = type === 'ores' ? ores : crops;
  const title = type === 'ores' ? '🪨 Minecraft Ore Tracker' : '🌾 Minecraft Crop Tracker';
  const emptyMsg = type === 'ores' ? 'No ores mined yet!' : 'No crops harvested yet!';

  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).filter(([, amt]) => amt > 0);
  const max = sorted[0]?.[1] || 1;
  const medals = ['🥇', '🥈', '🥉'];
  const lines = sorted.map(([item, amt], i) => {
    const medal = medals[i] || '   ';
    const bars = Math.round((amt / max) * 10);
    return `${medal} **${item}** — ${amt.toLocaleString()} ${'█'.repeat(bars) + '░'.repeat(10 - bars)}`;
  });
  if (!lines.length) lines.push(emptyMsg);

  const embed = new EmbedBuilder().setTitle(title).setColor(0x2ecc71).setDescription(lines.join('\n'))
    .setFooter({ text: `Last Updated: ${new Date().toLocaleString()}` }).setTimestamp();

  await message.edit({ embeds: [embed] });
}

async function updateMiningEmbed(message) {
  const weekProgress = Math.round((miningStats.currentStreak / 7) * 10);
  const progBar = '█'.repeat(weekProgress) + '░'.repeat(10 - weekProgress);

  const embed = new EmbedBuilder()
    .setTitle('⛏️ Mining Stats')
    .setColor(0x2ecc71)
    .setDescription([
      `**Today:** ${miningStats.todayMined.toLocaleString()}`,
      `**Biggest Day:** ${miningStats.biggestDay.toLocaleString()} (${miningStats.biggestDate})`,
      `**Streak:** ${miningStats.currentStreak} days`,
      `**Weekly Progress:** ${progBar}`
    ].join('\n'))
    .setFooter({ text: `Last Updated: ${new Date().toLocaleString()}` })
    .setTimestamp();

  await message.edit({ embeds: [embed] });
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent] });
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  fixMiningStats();

  // Restore embeds
  if (trackerOres?.channelId && trackerOres.messageId) {
    try {
      const ch = client.channels.cache.get(trackerOres.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(trackerOres.messageId);
        await updateEmbed(msg, 'ores');
      }
    } catch {}
  }
  if (trackerCrops?.channelId && trackerCrops.messageId) {
    try {
      const ch = client.channels.cache.get(trackerCrops.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(trackerCrops.messageId);
        await updateEmbed(msg, 'crops');
      }
    } catch {}
  }
  if (trackerMining?.channelId && trackerMining.messageId) {
    try {
      const ch = client.channels.cache.get(trackerMining.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(trackerMining.messageId);
        await updateMiningEmbed(msg);
      }
    } catch {}
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd) {
      try { await cmd.execute(interaction); } catch (e) {
        console.error(e);
        await interaction.reply({ content: 'Error!', ephemeral: true });
      }
    }
  }
  // Button collectors handled in clearjson
});

module.exports = {
  client, ores, crops, miningStats, defaultOres, defaultCrops, defaultMiningStats,
  ORES_FILE, CROPS_FILE, MINING_STATS_FILE, TRACKER_ORES_FILE, TRACKER_CROPS_FILE, TRACKER_MINING_FILE,
  updateEmbed, updateMiningEmbed, updateMiningStats, saveOres, saveCrops,
  getUserInv, saveUserInv, getCategory
};

client.login(TOKEN);