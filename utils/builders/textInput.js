const { TextInputBuilder, TextInputComponent } = require('discord.js');
const { textTypes } = require('../dicts.js');

/**
 * @param {string} customId
 * @param {string} label
 * @param {textTypes} type
 * @param {boolean} required
 * @returns {TextInputComponent}
 */
function TextInput(customId, label, type, required) {
  return new TextInputBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(textTypes[type])
    .setRequired(required)
}

module.exports = { TextInput }