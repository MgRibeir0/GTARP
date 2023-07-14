const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { botImageURL, whitespace, devServerInviteURL } = require('../../utils/constants')
const logger = require('../../utils/logger')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assinatura')
        .setDescription('Abre o menu de assinatura do bot'),
    async execute(interaction) {
        logger.info(`Command: ${interaction.commandName}`)
        const embed = new EmbedBuilder()
            .setTitle('Menu de assinatura')
            .setDescription('Veja as opções de assinatura do bot!')
            .setColor('#a914c7')
            .setThumbnail(botImageURL)
            .addFields(
                { name: whitespace, value: whitespace },
                { name: 'Gratuito - **R$0,00**', value: 'Acesso limitado ao bot, periodo de teste de 5 dias' },
                { name: whitespace, value: whitespace },
                { name: 'Planos Mensais', value: whitespace },
                { name: 'Mensal Padrão - **R$40**', value: 'Acesso ao bot principal', inline: true },
                { name: whitespace, value: whitespace, inline: true },
                { name: 'Mensal Premium - **R$60**', value: 'Acesso ao bot principal e +2 funções extras customizáveis', inline: true },
                { name: whitespace, value: whitespace },
                { name: 'Planos Trimestrais', value: whitespace },
                { name: 'Trimestral Padrão - **R$100**', value: 'Acesso ao bot principal', inline: true },
                { name: whitespace, value: whitespace, inline: true },
                { name: 'Trimestral Premium - **R$160**', value: 'Acesso ao bot principal e +2 funções extras customizáveis', inline: true },
                { name: whitespace, value: whitespace },
                { name: 'Para adquirir qualquer assinatura, entre em contato com o desenvolvedor.', value: `**Discord:** ${devServerInviteURL}\n**Discord Tag: [gendii_](discord://-/user/310616379084505088)**` }
            )
            .setFooter({ text: 'Feito com ❤️ por Gendii_', iconURL: botImageURL })

        await interaction.reply({ embeds: [embed] })

    }
}

// there is a way to link a message to a user using
// discord://-/users/<user-id>