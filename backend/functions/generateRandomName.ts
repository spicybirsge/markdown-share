import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export default function generateRandomName(): string {
    return uniqueNamesGenerator({
        dictionaries: [colors, adjectives, animals],
        separator: ' ',
    })
}
