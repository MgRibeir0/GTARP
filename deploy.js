const { REST, Routes } = require('discord.js');
const { clientIDDEV, guildIDDEV, tokenDEV } = require('./config.json');
const { clientIDPROD, guildIDPROD, tokenPROD } = require('./config.json')
const fs = require('node:fs');
const logger = require('./utils/logger.js')

const prod = false;

if (!prod) {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(tokenDEV);
    // const rest = new REST({ version: '10' }).setToken(tokenPROD);

    (async () => {
        try {
            logger.info(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationGuildCommands(clientIDDEV, guildIDDEV),
                // Routes.applicationGuildCommands(clientIDPROD, guildIDPROD),
                { body: commands },
            );

            logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
}
else {
    const commands = [];
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(tokenPROD);

    (async () => {
        try {
            logger.info(`Started refreshing ${commands.length} application (/) commands.`);

            const data = await rest.put(
                Routes.applicationCommands(clientIDPROD),
                { body: commands },
            );

            logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            console.error(error);
        }
    })();
}