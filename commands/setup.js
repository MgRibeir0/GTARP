const { SlashCommandBuilder, ActionRowBuilder, SelectMenuBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configurações essenciais do bot!'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            interaction.reply('Sem permissão para fazer isso')
            return
        }

        const actRow1 = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId(`setup-select`)
                    .setPlaceholder('Selecione uma opção')
                    .addOptions(
                        {
                            label: 'Canal de solicitação de set',
                            value: 'setup-opt-channel'
                        },
                        {
                            label: 'Canal de logs do bot',
                            value: 'setup-opt-logs'
                        },
                        {
                            label: 'Canal de sets',
                            value: 'setup-opt-sets'
                        },
                        {
                            label: 'Cargos de set',
                            value: 'setup-opt-roles'
                        })
            )

        await interaction.reply({
            content: `Selecione uma opção:`,
            components: [actRow1],
            ephemeral: true
        })
    },
};