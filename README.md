🌍 Minecraft Tools – Discord Bot

A powerful, user-friendly Discord bot designed to track ores, seeds, and progression across your Minecraft worlds. With built-in inventory sharing, world progress analytics, and easy-to-manage slash commands, this bot is perfect for survival players, SMPs, or anyone who wants to stay organized while exploring Minecraft.

GitHub: https://github.com/SyntaxLabs25/Minecraft-Tools

⭐ Features
📦 World Resource Tracking

Log and track all ores, including Diamond, Netherite, Redstone, Gold, Copper, Emeralds, and more.

Add and manage your world seeds with a simple slash command.

See how much of each resource you’ve collected and how your world is developing over time.

📊 Progression Analytics

Automatically calculates your resource totals and displays progress bars or stats.

Lets you compare previous data to see how fast you’re advancing.

🧳 Inventory Sharing

Share your full inventory in an organized embed.

Perfect for SMP coordination and team resource management.

🛠️ Simple Slash Command System

All commands are built with Discord.js v14 and registered via deploy-commands.js.

If you break a command or lose formatting, the bot includes a Command Regeneration Tool:

Run node generate-commands.js to automatically rebuild and refresh command files.

⚙️ Installation Guide (Detailed)
1️⃣ Clone the Repository
git clone https://github.com/SyntaxLabs25/Minecraft-Tools
cd Minecraft-Tools

2️⃣ Install Dependencies

Run the following commands in your terminal:

npm i discord.js
npm i ms


These install:

discord.js for the Discord API

ms for time parsing (cooldowns, etc.)

3️⃣ Configure Your Bot

Open index.js and scroll to the top.
You must configure:

✔️ Bot token
✔️ Guild/server ID
✔️ Client ID
✔️ MongoDB or database links if needed
✔️ Optional cooldowns and settings

Then open deploy-commands.js and update:

✔️ Your bot client ID
✔️ Your guild ID (for testing commands instantly)

4️⃣ Register Slash Commands

Before running the bot, you must deploy the slash commands:

node deploy-commands.js


This will push all commands to Discord.

5️⃣ Start the Bot

Finally, run:

node index.js


Your bot is now live and ready to track all your Minecraft resources.

🔧 Optional Tool – Command Generator

If a command file breaks or you forget a format, simply use the built-in regeneration script:

node generate-commands.js


This will repair/update every command file to the correct structure.

🤝 Perfect For:

SMP Communities

Survival/Hardcore World Tracking

Discord-Linked Minecraft Progress Logs

Minecraft Resource Analytics

Players who want to show off their progression

🚀 Summary

Minecraft Tools is a lightweight yet powerful Discord bot that helps you organize your Minecraft world, track every ore and seed you collect, and share your inventory with friends. With easy setup, slash commands, and repair tools, it’s designed to be simple, efficient, and SMP-friendly.
