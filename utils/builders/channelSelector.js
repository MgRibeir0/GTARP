const { ChannelSelectMenuBuilder, ChannelSelectMenuComponent } = require('discord.js');
const { channelsType } = require('../dicts.js');

/**
 * @param {string} customId
 * @param {channelsType} ChannelType
 * @returns {ChannelSelectMenuComponent}
 */
function ChannelSelectMenu(customId, ChannelType) {

    return new ChannelSelectMenuBuilder()
        .setCustomId(customId)
        .setPlaceholder('Selecione uma opção')
        .addChannelTypes(channelsType[ChannelType])
}

module.exports = { ChannelSelectMenu }