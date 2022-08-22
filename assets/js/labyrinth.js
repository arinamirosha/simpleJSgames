const $canvas = document.getElementById('game');
const $message = document.getElementById('message');
const $timer = document.getElementById('timer');
const $cells = document.getElementById('cells');
const $start = document.getElementById('start');
const $stop = document.getElementById('stop');
const $designCanvas = document.getElementById('designCanvas');

const context = $canvas.getContext('2d');
const contextDesign = $designCanvas.getContext('2d');

let countCells, grid = 25, wh, player, way, finish, gameOver, finished, timer;

designCanvasContext();

function removeMiddleNineSquare(x, y) {
    let square = getSquare(x, y),
        allSquare = true;

    square.forEach(s => {
        if (!s.count) {
            allSquare = false;
        }
    })

    if (allSquare) {
        let middle = square.pop();
        way = way.filter(w => {
            return !(w.x === middle.x && w.y === middle.y);
        });
    }
}

function connectMiddleNineSquare(x, y) {
    let square = getSquare(x, y),
        freeMiddle = true,
        middle = square[square.length - 1];

    // check square with empty center
    square.forEach(s => {
        if ((!s.count && s.x !== middle.x && s.y !== middle.y) ||
            (s.count && s.x === middle.x && s.y === middle.y)
        ) {
            freeMiddle = false;
        }
    })

    if (freeMiddle) {
        let nextSquare = getSquare(x + grid * 2, y),
            bottomSquare = getSquare(x, y + grid * 2),
            freeMiddleNext = true,
            freeMiddleBottom = true;

        nextSquare.forEach(s => {
            if ((!s.count && s.x !== middle.x && s.y !== middle.y) ||
                (s.count && s.x === middle.x && s.y === middle.y)
            ) {
                freeMiddleNext = false;
            }
        })
        bottomSquare.forEach(s => {
            if ((!s.count && s.x !== middle.x && s.y !== middle.y) ||
                (s.count && s.x === middle.x && s.y === middle.y)
            ) {
                freeMiddleBottom = false;
            }
        })
        if (freeMiddleNext) {
            way = way.filter(w => {
                return !(w.x === middle.x + grid && w.y === middle.y);
            });
        }
        if (freeMiddleBottom) {
            way = way.filter(w => {
                return !(w.x === middle.x && w.y === middle.y + grid);
            });
        }
    }
}

function getSquare(x, y) {
    let square = [
        {x: x, y: y, count: 0},
        {x: x + grid, y: y, count: 0},
        {x: x + grid * 2, y: y, count: 0},
        {x: x + grid * 2, y: y + grid, count: 0},
        {x: x + grid * 2, y: y + grid * 2, count: 0},
        {x: x + grid, y: y + grid * 2, count: 0},
        {x: x, y: y + grid * 2, count: 0},
        {x: x, y: y + grid, count: 0},
        {x: x + grid, y: y + grid, count: 0},
    ];
    square.forEach(s => {
        let filteredWay = way.filter(w => {
            return w.x === s.x && w.y === s.y;
        })
        if (filteredWay.length) {
            s.count++;
        }
    });
    return square;
}

function drawRandomBorderLine(x, y, c = context) {
    let randomStart = getRandomInt(1, 5), side;
    switch (randomStart) {
        case 1:
            side = 'top';
            break;
        case 2:
            side = 'right';
            break;
        case 3:
            side = 'bottom';
            break;
        default:
            side = 'left';
            break;
    }
    drawBorder(x, y, side, 'gray', c);
}

function drawBorder(x, y, side, color = 'gray', c = context) {
    c.strokeStyle = color;
    c.beginPath();
    switch (side) {
        case 'top':
            c.moveTo(x, y);
            c.lineTo(x + grid, y);
            break;
        case 'right':
            c.moveTo(x + grid, y);
            c.lineTo(x + grid, y + grid);
            break;
        case 'bottom':
            c.moveTo(x, y + grid);
            c.lineTo(x + grid, y + grid);
            break;
        case 'left':
            c.moveTo(x, y);
            c.lineTo(x, y + grid);
            break;
    }
    c.stroke();
}

function getRandomDirection() {
    let randDirection = getRandomInt(1, 5);
    switch (randDirection) {
        // down
        case 1:
            return {dx: 0, dy: grid};
        // left
        case 2:
            return {dx: -grid, dy: 0};
        // up
        case 3:
            return {dx: 0, dy: -grid};
        // right
        default:
            return {dx: grid, dy: 0};
    }
}

function drawPlayer(color = 'lightblue') {
    context.fillStyle = color;
    context.fillRect(player.x, player.y, grid, grid);
}

function prepareCanvas() {
    countCells = parseInt($cells.value);
    grid = getGridByCells(countCells);
    wh = grid * countCells;
    $canvas.setAttribute('width', wh.toString());
    $canvas.setAttribute('height', wh.toString());
}

function setStartParameters() {
    let startSide = getRandomInt(1, 5),
        randStart = getRandomInt(1, countCells) * grid
    switch (startSide) {
        // top
        case 1:
            player = {x: randStart, y: 0, d: startSide};
            way = [player, {x: randStart, y: grid}];
            break;
        // right
        case 2:
            player = {x: wh - grid, y: randStart, d: startSide};
            way = [player, {x: wh - grid * 2, y: randStart}];
            break;
        // bottom
        case 3:
            player = {x: randStart, y: wh - grid, d: startSide};
            way = [player, {x: randStart, y: wh - grid * 2}];
            break;
        // left
        default:
            player = {x: 0, y: randStart, d: startSide};
            way = [player, {x: grid, y: randStart}];
            break;
    }
}

function drawWay() {
    let c = 0;
    while (true) {
        let {dx, dy} = getRandomDirection(),
            newCell = {x: way[way.length - 1].x + dx, y: way[way.length - 1].y + dy},
            skip = false;

        // end from other side
        if (player.d === 1 && (newCell.x === 0 || newCell.y === 0 || newCell.x === wh - grid) ||
            player.d === 2 && (newCell.y === 0 || newCell.x === wh - grid || newCell.y === wh - grid) ||
            player.d === 3 && (newCell.x === 0 || newCell.x === wh - grid || newCell.y === wh - grid) ||
            player.d === 4 && (newCell.x === 0 || newCell.y === 0 || newCell.y === wh - grid)
        ) {
            skip = true;
        }

        if (!skip) {
            // outside border
            if (newCell.x < 0 || newCell.y < 0 || newCell.x >= wh || newCell.y >= wh) {
                break;
            }
            way.push(newCell);
        }

        c++;
        if (c > wh * wh * 2) {
            console.log('ERROR');
            break;
        }
    }
    // unique way but leave finish
    finish = way[way.length - 1];
    way = way.filter((v, i, self) =>
        i === self.findIndex((v2) => (
            v2.x === v.x && v2.y === v.y
        ))
    );
    way.push(finish);

    // remove some cells
    for (let x = 0; x < wh; x = x + grid) {
        for (let y = 0; y < wh; y = y + grid) {
            removeMiddleNineSquare(x, y);
        }
    }
    for (let x = 0; x < wh; x = x + grid) {
        for (let y = 0; y < wh; y = y + grid) {
            connectMiddleNineSquare(x, y);
        }
    }
    for (let x = 0; x < wh; x = x + grid) {
        for (let y = 0; y < wh; y = y + grid) {
            let border = true;
            for (let w of way) {
                if (w.x === x && w.y === y) {
                    border = false;
                    break;
                }
            }
            if (border) {
                for (let w of way) {
                    if (w.x === x && w.y === y - grid) {
                        drawBorder(x, y, 'top');
                    }
                    if (w.x === x + grid && w.y === y) {
                        drawBorder(x, y, 'right');
                    }
                    if (w.x === x && w.y === y + grid) {
                        drawBorder(x, y, 'bottom');
                    }
                    if (w.x === x - grid && w.y === y) {
                        drawBorder(x, y, 'left');
                    }
                }
                drawRandomBorderLine(x, y);
            }
        }
    }

    // canvas border
    for (let x = 0; x < wh; x = x + grid) {
        for (let y = 0; y < wh; y = y + grid) {
            if (y === 0) {
                drawBorder(x, y, 'top', 'black');
            }
            if (x === wh - grid) {
                drawBorder(x, y, 'right', 'black');
            }
            if (y === wh - grid) {
                drawBorder(x, y, 'bottom', 'black');
            }
            if (x === 0) {
                drawBorder(x, y, 'left', 'black');
            }
        }
    }

    // open start and finish
    context.clearRect(finish.x, finish.y, grid, grid);
    context.clearRect(player.x, player.y, grid, grid);
}

function endGame(win = false) {
    if (win) {
        $message.innerText = 'Congratulations!';
        $message.classList.remove('text-danger');
        $message.classList.add('text-primary');
    } else {
        $message.innerText = 'Game over';
        $message.classList.remove('text-primary');
        $message.classList.add('text-danger');
    }
    clearInterval(timer);
    timer = null;
    $start.classList.remove('disabled');
    $message.classList.remove('d-none');
    $start.classList.remove('d-none');
    $stop.classList.add('d-none');
}

function designCanvasContext() {
    let cW = $designCanvas.getAttribute('width'),
        cH = $designCanvas.getAttribute('height');

    for (let x = 0; x < cW; x = x + grid) {
        for (let y = 0; y < cH; y = y + grid) {
            drawRandomBorderLine(x, y, contextDesign);
        }
    }
}

document.addEventListener('keydown', function (e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    if (gameOver || finished) {
        return;
    }

    context.clearRect(player.x, player.y, grid, grid);
    if (e.code === 'ArrowLeft') {
        player.x -= grid;
    } else if (e.code === 'ArrowUp') {
        player.y -= grid;
    } else if (e.code === 'ArrowRight') {
        player.x += grid;
    } else if (e.code === 'ArrowDown') {
        player.y += grid;
    }

    let color = 'lightblue';

    gameOver = way.filter(w => {
        if (finish.x === player.x && finish.y === player.y) {
            finished = true;
        }
        return w.x === player.x && w.y === player.y;
    }).length < 2;

    if (gameOver) {
        color = 'red';
        endGame();
    } else if (finished) {
        color = 'blue';
        endGame(true);
    }

    drawPlayer(color);
});

$start.addEventListener('click', function (e) {
    prepareCanvas();
    setStartParameters();
    drawWay();
    drawPlayer();

    $start.classList.add('d-none');
    $stop.classList.remove('d-none');
    $timer.innerText = 0;
    $message.classList.add('d-none');

    finished = false;
    gameOver = false;

    timer = setInterval(() => {
        $timer.innerText = parseInt($timer.innerText) + 1;
    }, 1000);
});

$stop.addEventListener('click', function (e) {
    endGame();
});