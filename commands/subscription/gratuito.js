const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gratuito')
        .setDescription('Ativa o teste grátis de 5 dias do bot.'),

    async execute(interaction) {
        const db = interaction.client.db;

        const freeTrial = await db.ref(`subscriptions/${interaction.guild.id}`).once('value').then(snapshot => { return snapshot.val().freeTrial })

        if (!freeTrial) {
            await interaction.reply({ content: 'O teste grátis já foi ativado nesse servidor!\nCaso queira continuar utilizando as funções do bot, use o comando \`/assinar\`.', ephemeral: true })
            return;
        }

        db.ref(`subscriptions/${interaction.guild.id}`).update({
            active: true,
            freeTrial: false,
            daysLeft: 5,
            type: 'premium'
        })

        const embed = new EmbedBuilder()
            .setTitle('Teste grátis ativado!')
            .setDescription('O teste grátis de 5 dias foi ativado com sucesso! Aproveite!')
            .setColor('#00ff00')
            .setTimestamp()
            .addFields(
                {
                    name: 'Ativado por:',
                    value: interaction.user.tag
                },
                {
                    name: 'Ativado em:',
                    value: `${new Date().toLocaleString('pt-br', { timeZone: 'America/Sao_Paulo' }).split(',')[0]}`,
                    inline: true
                },
                {
                    name: 'Expira em:',
                    value: `${new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleString('pt-br', { timeZone: 'America/Sao_Paulo' }).split(',')[0]}`,
                    inline: true
                })


        await interaction.reply({ embeds: [embed] });

    }
}