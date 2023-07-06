const { db } = require('../firebase.js')
const { EmbedBuilder, Colors } = require('discord.js')
const logger = require('../logger.js')

const updateSubscriptions = async (client) => {
    logger.info('Checking subscriptions')
    const guilds = await client.guilds.fetch()
    guilds.forEach(async guild => {
        db.ref(`subscriptions/${guild.id}`).once('value', async snapshot => {
            if (!snapshot.exists()) {
                await createGuildOnDB(guild)
            }
            if (snapshot.val().active) {
                const daysLeft = snapshot.val().daysLeft
                if (daysLeft === 0) {
                    db.ref(`subscriptions/${guild.id}`).update({
                        active: false
                    })
                } else {
                    db.ref(`subscriptions/${guild.id}`).update({
                        daysLeft: daysLeft - 1
                    })
                    const embed = new EmbedBuilder()
                        .setTitle('Renovação de assinatura')
                        .setDescription(`Sua assinatura expirou!`)
                        .setColor(Colors.Red)
                    const guildFetched = await client.guilds.fetch(guild.id)
                    const channelID = client.configs.get(guild.id)['channel']
                    const channel = await guildFetched.channels.fetch(channelID)
                    if (!channel) return;
                    if (!snapshot.val().messageSent) {
                        channel.send({ embeds: [embed] })
                        db.ref(`subscriptions/${guild.id}`).update({
                            messageSent: true
                        })
                    }


                }
            }
        })

    })

}

module.exports = { updateSubscriptions }