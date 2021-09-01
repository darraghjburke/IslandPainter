"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = exports.getCharacter = void 0;
const characters = [
    "Falstaff",
    "Hamlet",
    "Othello",
    "Anthony",
    "Timon",
    "Mercutio",
    "Guildenstern",
    "Cleopatra",
    "Rosalind",
    "Brutus",
    "Rosencrantz",
    "Iago",
    "Vincentio",
    "Coriolanus",
    "Lear",
    "Desdemona",
    "Romeo",
    "Ophelia",
    "Petruchio",
    "Macbeth",
    "Claudio",
    "Juliet",
    "Portia",
    "Hotspur",
    "Polonius"
];
const locations = [
    "Verona",
    "Elsinore",
    "Padua",
    "Illyria",
    "Inverness"
];
let charIdx = Math.floor(Math.random() * characters.length);
let step = Math.floor(Math.random() * 2) - 3;
function getCharacter() {
    const name = characters[charIdx];
    charIdx += step;
    if (charIdx < 0)
        charIdx += characters.length;
    if (charIdx > characters.length)
        charIdx = 0;
    return name;
}
exports.getCharacter = getCharacter;
function getLocation() {
    return locations[Math.floor(Math.random() * locations.length)];
}
exports.getLocation = getLocation;
