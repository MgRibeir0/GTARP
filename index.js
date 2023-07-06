const path = require('node:path')
const fs = require('node:fs')
const { Client, Events, GatewayIntentBits, Collection, ButtonStyle } = require('discord.js');
const { tokenPROD, tokenDEV } = require('./config.json');
const { db } = require('./utils/firebase.js');
const ChannelSelectMenu = require('./utils/builders/channelSelector.js').ChannelSelectMenu;
const TextInput = require('./utils/builders/textInput.js').TextInput;
const logger = require('./utils/logger.js');
const cron = require('node-cron');
const { updateSubscriptions } = require('./utils/subscription/sub.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
    ]
});

client.commands = new Collection()
client.db = require('./utils/firebase.js').db
client.configs = new Collection()
client.roles = new Collection()

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            logger.info(`[${commandsPath.split('\\')[8]}] Command ${command.data.name} loaded!`)
        } else {
            logger.warn(`The command ${filePath.split('\\')[9]} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.GuildCreate, async guild => {

    db.ref(`subscriptions/${guild.id}`).once('value', async snapshot => {
        if (!snapshot.exists()) {
            await createGuildOnDB(guild)
        }
    })

})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand() &&
        !interaction.isAnySelectMenu() &&
        !interaction.isButton() &&
        !interaction.isModalSubmit()) return;

    if (interaction.isChatInputCommand()) handleCommands(interaction);
    if (interaction.isAnySelectMenu()) handleSelectMenus(interaction);
    if (interaction.isButton()) handleButtons(interaction);
    if (interaction.isModalSubmit()) handleModals(interaction);

});


client.on(Events.ClientReady, async c => {

    //checks the subscriptions every day at 00:00
    cron.schedule('*/25 * * * *', async () => {
        updateSubscriptions(client)
    })

    c.guilds.cache.forEach(guild => {
        retrieveRoles(guild.id)
        db.ref(`guilds/${guild.id}/config`).once('value').then(async snapshot => {
            if (!snapshot.exists()) return;
            const config = snapshot.val()
            if (config.logs) {
                client.configs.set(guild.id, config);
                const guildFetched = await client.guilds.fetch(guild.id)
                const channelID = client.configs.get(guild.id)['channel']
                const channel = await guildFetched.channels.fetch(channelID)
                if (!channel) return;
                const message = await channel.messages.fetch({ limit: 1 })
                if (message.size === 0) sendFirstMessage(channel);
            }
        })
    })

    logger.info(`Logged in as ${c.user.tag}`)
})

client.on(Events.Error, err => {

})


async function createGuildOnDB(guild) {
    db.ref(`subscriptions/${guild.id}`).set({
        active: false,
        freeTrial: true,
        daysLeft: 0,
        type: 'free'
    })
}

async function handleModals(interaction) {
    if (interaction.customId === 'modal-set-form') {
        interaction.reply({ content: 'Formulário enviado com sucesso!', ephemeral: true })
        const { ActionRowBuilder, ButtonBuilder, EmbedBuilder, Colors } = require('discord.js')

        const embed = new EmbedBuilder()
            .setTitle('Solicitação de set')
            .setDescription(`\n**ID Discord:** ${interaction.user.id} \n**Nome:** ${interaction.fields.getTextInputValue('modal-set-name')}\n**Passaporte:** ${interaction.fields.getTextInputValue('modal-set-passport')}\n**Cargo:** ${interaction.fields.getTextInputValue('modal-set-role')}\n**Número:** ${interaction.fields.getTextInputValue('modal-set-number')}\n**Recrutador:** ${interaction.fields.getTextInputValue('modal-set-recruiter')}`)
            .setColor(Colors.Green)
            .setTimestamp()

        const btnAccept = new ButtonBuilder()
            .setCustomId('modal-set-accept')
            .setLabel('Aceitar')
            .setEmoji({ name: '✅' })
            .setStyle(ButtonStyle.Success)

        const btnDeny = new ButtonBuilder()
            .setCustomId('modal-set-deny')
            .setLabel('Recusar')
            .setEmoji({ name: '❌' })
            .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder()
            .addComponents(btnAccept, btnDeny)

        const setChannelID = client.configs.get(interaction.guild.id)['sets']
        const setChannel = interaction.guild.channels.cache.get(setChannelID)
        if (!setChannel) return;
        await setChannel.send({ content: '@here', embeds: [embed], components: [row] })

    }
}

async function handleButtons(interaction) {

    const { EmbedBuilder, Colors } = require('discord.js')

    if (interaction.customId === 'modal-set') {

        const { ActionRowBuilder, ModalBuilder } = require('discord.js')

        const textInputName = TextInput('modal-set-name', 'Digite seu nome', 'short', true)

        const textInputPassport = TextInput('modal-set-passport', 'Digite seu passaporte', 'short', true)

        const textInputRole = TextInput('modal-set-role', 'Digite seu cargo', 'short', true)

        const textInputNumber = TextInput('modal-set-number', 'Digite seu número', 'short', true)

        const textInputRecruiter = TextInput('modal-set-recruiter', 'Digite seu recrutador', 'short', true)

        const actRow1 = new ActionRowBuilder()
            .addComponents(
                textInputName
            );

        const actRow2 = new ActionRowBuilder()
            .addComponents(
                textInputPassport
            );

        const actRow3 = new ActionRowBuilder()
            .addComponents(
                textInputRole
            );

        const actRow4 = new ActionRowBuilder()
            .addComponents(
                textInputNumber
            );

        const actRow5 = new ActionRowBuilder()
            .addComponents(
                textInputRecruiter
            );

        const modal = new ModalBuilder()
            .setCustomId('modal-set-form')
            .setTitle('Solicitação de set');

        // idk why, it needs to be 1 at a time, otherwise it bugs (discord.js@14.11.0)
        modal.addComponents(actRow1);
        modal.addComponents(actRow2);
        modal.addComponents(actRow3);
        modal.addComponents(actRow4);
        modal.addComponents(actRow5);

        await interaction.showModal(modal);
    }
    if (interaction.customId === 'modal-set-accept') {

        const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
        newEmbed.setFooter({ text: `Aceito por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        newEmbed.setColor(Colors.Green)

        interaction.update({ embeds: [newEmbed], components: [] })

        giveRoles(interaction);

    }

    if (interaction.customId === 'modal-set-deny') {

        const newEmbed = new EmbedBuilder(interaction.message.embeds[0])
        newEmbed.setFooter({ text: `Recusado por ${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        newEmbed.setColor(Colors.Red)

        interaction.update({ embeds: [newEmbed], components: [] })

    }

}

async function handleCommands(interaction) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }

}

async function handleSelectMenus(interaction) {
    const { ActionRowBuilder } = require('@discordjs/builders');

    if (interaction.customId === "setup-select") {

        const selected = interaction.values[0];

        if (selected === "setup-opt-channel") {

            const actRow1 = new ActionRowBuilder()
                .addComponents(ChannelSelectMenu('setup-select-channel', 'text'))

            await interaction.update({
                content: `Selecione uma opção:`,
                components: [actRow1],
                ephemeral: true
            })
        }

        if (selected === "setup-opt-logs") {

            const actRow1 = new ActionRowBuilder()
                .addComponents(ChannelSelectMenu('setup-select-logs', 'text'))

            await interaction.update({
                content: `Selecione uma opção:`,
                components: [actRow1],
                ephemeral: true
            })

        }

        if (selected === "setup-opt-sets") {

            const actRow1 = new ActionRowBuilder()
                .addComponents(ChannelSelectMenu('setup-select-sets', 'text'))

            await interaction.update({
                content: `Selecione uma opção:`,
                components: [actRow1],
                ephemeral: true
            })

        }

        if (selected === "setup-opt-roles") {
            const { RoleSelectMenuBuilder } = require('discord.js')
            const actRow1 = new ActionRowBuilder()
                .addComponents(
                    new RoleSelectMenuBuilder()
                        .setCustomId('setup-select-roles')
                        .setPlaceholder('Selecione um cargo')
                        .setMinValues(1)
                        .setMaxValues(10)
                )

            await interaction.update({
                content: `Selecione uma opção:`,
                components: [actRow1],
                ephemeral: true
            })

        }
    }
    if (interaction.customId === "setup-select-channel") {
        try {
            db.ref(`guilds/${interaction.guild.id}/config`).update({
                channel: interaction.values[0]
            })
            db.ref(`guilds/${interaction.guild.id}/config`).once('value').then(snapshot => {
                if (!snapshot.exists()) return;
                const config = snapshot.val()
                client.configs.set(interaction.guild.id, config);
            })
            const resLog = await sendLog(interaction)
            resLog === -1 ? null :
                await interaction.update({
                    content: `Canal de solicitação de set configurado com sucesso!`,
                    components: [],
                    ephemeral: true
                })

        } catch (error) {
            logger.error(error)
        }
    }
    if (interaction.customId === 'setup-select-logs') {
        try {
            db.ref(`guilds/${interaction.guild.id}/config`).update({
                logs: interaction.values[0]
            })
            db.ref(`guilds/${interaction.guild.id}/config`).once('value').then(snapshot => {
                if (!snapshot.exists()) return;
                const config = snapshot.val()
                client.configs.set(interaction.guild.id, config);
            })
            const resLog = await sendLog(interaction)
            resLog === -1 ? null :
                await interaction.update({
                    content: `Canal de logs configurado com sucesso!`,
                    components: [],
                    ephemeral: true
                })
        } catch (error) {
            logger.error(error)
        }
    }
    if (interaction.customId === 'setup-select-sets') {
        try {
            db.ref(`guilds/${interaction.guild.id}/config`).update({
                sets: interaction.values[0]
            })
            db.ref(`guilds/${interaction.guild.id}/config`).once('value').then(snapshot => {
                if (!snapshot.exists()) return;
                const config = snapshot.val()
                client.configs.set(interaction.guild.id, config);
            })
            const resLog = await sendLog(interaction)
            resLog === -1 ? null :
                await interaction.update({
                    content: `Canal de sets configurado com sucesso!`,
                    components: [],
                    ephemeral: true
                })
        } catch (error) {
            logger.error(error)
        }
    }
    if (interaction.customId === 'setup-select-roles') {
        try {
            db.ref(`guilds/${interaction.guild.id}/config`).update({
                roles: interaction.values
            })
            db.ref(`guilds/${interaction.guild.id}/config`).once('value').then(snapshot => {
                if (!snapshot.exists()) return;
                const config = snapshot.val()
                client.configs.set(interaction.guild.id, config);
            })
            const resLog = await sendLog(interaction)
            resLog === -1 ? null :
                await interaction.update({
                    content: `Cargos configurados com sucesso!`,
                    components: [],
                    ephemeral: true
                })
        } catch (error) {
            logger(error)
        }
    }
}

async function giveRoles(interaction) {
    userID = interaction.message.embeds[0].data.description.split('\n')[0].split('**ID Discord:** ')[1]
    user = await interaction.guild.members.fetch(userID)

    const roles = client.roles.get(interaction.guild.id)
    logger.debug(roles)
    const passport = interaction.message.embeds[0].data.description.split('\n')[2].split('**Passaporte:**')[1]
    const nick = interaction.message.embeds[0].data.description.split('\n')[1].split('**Nome:**')[1];
    logger.debug(interaction.message.embeds[0].data.description.split('\n')[1].split('**Nome:**')[1]);
    logger.debug(nick.length)
    nick.length >= 25 ? user.setNickname(`${nick.slice(0, 20)}... | ${passport}`) : user.setNickname(`${nick} | ${passport}`)
    user.roles.add(roles);
}

async function sendLog(interaction) {

    const { EmbedBuilder } = require('@discordjs/builders')
    const { Colors } = require('discord.js')

    const logChannelID = client.configs.get(interaction.guild.id)['logs']
    const logChannel = interaction.guild.channels.cache.get(logChannelID)
    if (!logChannel) {
        await interaction.update({
            content: `Alteração executada com sucesso!\nCanal de logs não definido, use o comando /setup para definir!\nCaso esteja definindo o canal de logs, ignore essa mensagem.`,
            components: [],
            ephemeral: true
        })
        return -1; // Canal de logs não definido
    }
    const changes = interaction.customId.split('-')[2] == 'channel' ? 'Canal de solicitação de set' : interaction.customId.split('-')[2] == 'logs' ? 'Canal de logs' : 'Canal de sets'

    const embed = new EmbedBuilder()
        .setTitle('Configuração alterada')
        .setDescription(`\nO usuário ${interaction.user} alterou a configuração do bot`)
        .addFields(
            { name: '\u200b', value: '\u200b' },
            { name: 'Configuração alterada:', value: changes, inline: true },
            { name: 'Canal:', value: '<#' + interaction.values[0] + '>', inline: true }
        )
        .setColor(Colors.Green)
        .setTimestamp()

    await logChannel.send({ embeds: [embed], allowedMentions: { parse: [] } })

}

function sendFirstMessage(channel) {

    const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('@discordjs/builders')

    const button = new ButtonBuilder()
        .setCustomId('modal-set')
        .setEmoji({ name: '📍' })
        .setStyle(ButtonStyle.Secondary)

    const row = new ActionRowBuilder()
        .addComponents(button)

    const embed = new EmbedBuilder()
        .setDescription("Para solicitar a sua setagem no discord e no jogo é necessário que clique no botão abaixo e responda as perguntas.")

    channel.send({ embeds: [embed], components: [row] })

}

async function retrieveRoles(guildID) {
    await db.ref(`guilds/${guildID}/config`).once('value').then(snapshot => {
        if (!snapshot.exists()) return;
        const roles = snapshot.val()['roles']
        if (!roles) return;
        client.roles.set(guildID, roles)
    })
}

// client.login(tokenPROD);
client.login(tokenDEV);
