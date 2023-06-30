const { ChannelType, TextInputStyle } = require('discord.js')

module.exports = {
    typeChannels: {
        'text': ChannelType.GuildText,
        'voice': ChannelType.GuildVoice,
        'category': ChannelType.GuildCategory
    },
    textTypes: {
        'short': TextInputStyle.Short,
        'long': TextInputStyle.Paragraph
    }
}