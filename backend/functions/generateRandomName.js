const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

function generateRandomName() {
    return uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        separator: ' ',
    })
}

module.exports = generateRandomName;