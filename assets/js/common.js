function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getGridByCells(cells) {
    switch (cells) {
        case 8:
            return 75;
        case 16:
            return 37;
        case 24:
            return 25;
        case 32:
            return 19;
        case 40:
            return 15;
        case 48:
            return 13;
        default:
            return 25;
    }
}

function getLevelBySpeed(valSpeed) {
    switch (valSpeed) {
        case 1:
            return 18;
        case 2:
            return 14;
        case 3:
            return 10;
        case 4:
            return 7;
        case 5:
            return 4;
        case 6:
            return 2;
        default:
            return 11;
    }
}