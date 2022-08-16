const $canvas = document.getElementById('game');
const $start = document.getElementById('start');
const $stop = document.getElementById('stop');
const $score = document.getElementById('score');
const $record = document.getElementById('record');
const $message = document.getElementById('message');
const $speed = document.getElementById('speed');
const $cells = document.getElementById('cells');
const $border = document.getElementById('border');
const $history = document.getElementById('history');
const $blocks = document.getElementById('blocks');

const context = $canvas.getContext('2d');

const appleImg = new Image();
const brickImg = new Image();
const snakeHeadImg = new Image();
appleImg.src = 'assets/img/apple.png';
brickImg.src = 'assets/img/brick.png';
snakeHeadImg.src = 'assets/img/snakeHead.png';

let count = 0, loopId, level, snake, apple, grid, countCells, borderIgnore, blocks;

setCanvasGridCells();

addEventListener('load', (event) => {
    let recordStorage = localStorage.getItem('record');
    $record.innerText = recordStorage ? recordStorage : 0;
    updateHistory();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getFreeXY() {
    let el = {
        x: grid * getRandomInt(0, countCells),
        y: grid * getRandomInt(0, countCells)
    }, error = false;

    //not block
    blocks.forEach(b => {
        if (b.x === el.x && b.y === el.y) {
            error = true;
        }
    });

    // not snake move line on begin
    if (!snake.cells.length && (snake.dx && (el.y === snake.y) || snake.dy && (el.x === snake.x))) {
        error = true;
    }

    // not snake for new apple
    if (snake.cells.length) {
        snake.cells.forEach(cell => {
            if (cell.x === el.x && cell.y === el.y) {
                error = true;
            }
        });
    }

    if (error) {
        el = getFreeXY();
    }

    return el;
}

function drawCells() {
    let wh = grid * countCells;
    for (let x = 0; x < wh; x = x + grid) {
        for (let y = 0; y < wh; y = y + grid) {
            if (x % 2 === 0 && y % 2 !== 0 || y % 2 === 0 && x % 2 !== 0) {
                context.fillStyle = '#bee0c1';
            } else {
                context.fillStyle = '#d6efd8';
            }
            context.fillRect(x, y, grid, grid);
        }
    }
}

function drawGame() {
    drawCells();

    // bricks
    blocks.forEach(b => {
        context.drawImage(brickImg, b.x, b.y, grid, grid);
    })

    // apple
    context.drawImage(appleImg, apple.x, apple.y, grid, grid);

    // snake
    snake.cells.forEach(function (cell, index) {
        // body
        if (index) {
            let minimizeCell = getRandomInt(3, parseInt(grid / 4));
            context.beginPath();
            context.fillStyle = 'white';
            context.strokeStyle = '#3e3e3e';
            context.shadowColor = '#b3b3b3';
            context.shadowBlur = '5';
            context.arc(cell.x + grid / 2, cell.y + grid / 2, (grid - minimizeCell) / 2, 0, 2 * Math.PI);
            context.fill();
            context.stroke();
            context.closePath();
            context.shadowColor = 'rgba(0,0,0,0)';
        }
        // head
        else {
            if (snake.dy) {
                context.translate(cell.x + grid / 2, cell.y + grid / 2);
                context.rotate((snake.dy < 0 ? 1 : 135) * Math.PI / 2); // up or down
                context.translate(-cell.x - grid / 2, -cell.y - grid / 2);
                context.drawImage(snakeHeadImg, cell.x, cell.y, grid, grid);
                context.setTransform(1, 0, 0, 1, 0, 0);
            } else if (snake.dx > 0) {
                // right
                context.save();
                context.scale(-1, 1);
                context.drawImage(snakeHeadImg, -cell.x, cell.y, -grid, grid);
                context.restore();
            } else {
                // left
                context.drawImage(snakeHeadImg, cell.x, cell.y, grid, grid);
            }
        }
    });
}

function loop() {
    loopId = requestAnimationFrame(loop);

    // Скорость
    if (++count < level) {
        return;
    }
    count = 0;

    context.clearRect(0, 0, $canvas.width, $canvas.height);

    // Двигаем змейку
    snake.x += snake.dx;
    snake.y += snake.dy;

    // Столкновение с бордером
    if (!borderIgnore && (snake.x < 0 || snake.x >= $canvas.width || snake.y < 0 || snake.y >= $canvas.height)) {
        stopGame();
    } else {
        // Если змейка достигла края поля, переносим
        if (snake.x < 0) {
            snake.x = $canvas.width - grid;
        } else if (snake.x >= $canvas.width) {
            snake.x = 0;
        }
        if (snake.y < 0) {
            snake.y = $canvas.height - grid;
        } else if (snake.y >= $canvas.height) {
            snake.y = 0;
        }
    }
    // Добавляем голову в начало
    snake.cells.unshift({x: snake.x, y: snake.y});
    // Удаляем последний элемент
    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // Столкновение с препятствием
    blocks.forEach(b => {
        if (b.x === snake.x && b.y === snake.y) {
            stopGame();
        }
    });

    // Столкновение с собой
    snake.cells.slice(1).forEach(cell => {
        if (cell.x === snake.x && cell.y === snake.y) {
            stopGame();
        }
    });

    // Попали на яблоко
    if (snake.x === apple.x && snake.y === apple.y) {
        $score.innerText = parseInt($score.innerText) + 1;
        checkAndSetRecord();
        snake.maxCells++;
        apple = getFreeXY();
    }

    drawGame();
}

document.addEventListener('keydown', function (e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    if (e.code === 'ArrowLeft' && snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
    } else if (e.code === 'ArrowUp' && snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
    } else if (e.code === 'ArrowRight' && snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
    } else if (e.code === 'ArrowDown' && snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
    } else if (e.code === 'Space' && $start.classList.contains('d-none')) {
        if ($start.getAttribute('data-pause') === 'off') {
            cancelAnimationFrame(loopId);
            $message.innerText = 'Pause';
            $message.classList.add('text-primary');
            $message.classList.remove('text-danger', 'd-none');
            $start.setAttribute('data-pause', 'on');
        } else {
            requestAnimationFrame(loop);
            $message.classList.add('d-none');
            $start.setAttribute('data-pause', 'off');
        }
    }
});

$start.addEventListener('click', function (e) {
    setCanvasGridCells();
    level = getLevelBySpeed(parseInt($speed.value));
    borderIgnore = $border.checked;

    $speed.disabled = true;
    $cells.disabled = true;
    $blocks.disabled = true;
    $border.disabled = true;

    snake = {
        x: grid * Math.floor(countCells / 2),
        y: grid * Math.floor(countCells / 2),
        dx: grid,
        dy: 0,
        cells: [],
        maxCells: 4
    };
    blocks = [];
    let bs = parseInt($blocks.value);
    if (bs) {
        for (let i = 0; i < bs; i++) {
            blocks.push(getFreeXY());
        }
    }
    apple = getFreeXY();

    $score.innerText = 0;
    $start.classList.add('d-none');
    $stop.classList.remove('d-none');
    $message.classList.add('d-none');

    loopId = requestAnimationFrame(loop);
});

$stop.addEventListener('click', function (e) {
    stopGame();
});

$border.addEventListener('change', function (e) {
    $border.checked
        ? $canvas.classList.remove('border-danger')
        : $canvas.classList.add('border-danger');
});

function stopGame() {
    cancelAnimationFrame(loopId);

    $speed.disabled = false;
    $cells.disabled = false;
    $blocks.disabled = false;
    $border.disabled = false;

    $start.classList.remove('d-none');
    $start.setAttribute('data-pause', 'off');
    $stop.classList.add('d-none');
    $message.innerText = 'Game over';
    $message.classList.add('text-danger');
    $message.classList.remove('text-primary', 'd-none');

    updateHistory(true);
}

function checkAndSetRecord() {
    let score = parseInt($score.innerText);
    let recordStorage = localStorage.getItem('record');
    recordStorage = recordStorage ? recordStorage : 0;
    if (score > recordStorage) {
        recordStorage = score;
        localStorage.setItem('record', recordStorage);
        $record.innerText = recordStorage;
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
        default:
            return 11;
    }
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
        default:
            return 25;
    }
}

function setCanvasGridCells() {
    countCells = parseInt($cells.value);
    grid = getGridByCells(countCells);
    $canvas.setAttribute('width', (grid * countCells).toString());
    $canvas.setAttribute('height', (grid * countCells).toString());
    drawCells();
}

function updateHistory(addNew = false) {
    let historyStorage = JSON.parse(localStorage.getItem('history'));
    if (addNew && parseInt($score.innerText) !== 0) {
        let newData = {
            date: new Date().toISOString().slice(0, 10),
            speed: parseInt($speed.value),
            cells: parseInt($cells.value),
            blocks: parseInt($blocks.value),
            border: $border.checked ? 'ignore' : ' no ignore',
            score: parseInt($score.innerText),
        };
        if (historyStorage) {
            historyStorage.push(newData);
            historyStorage.sort((a, b) => b.score - a.score);
            historyStorage = historyStorage.slice(0, 7);
        } else {
            historyStorage = [newData];
        }
        localStorage.setItem('history', JSON.stringify(historyStorage));
    }

    if (historyStorage) {
        let historyHtml = '';
        historyStorage.forEach(h => {
            historyHtml += `<tr>
                <td>${h.date}</td>
                <td>${h.speed}</td>
                <td>${h.cells}</td>
                <td>${h.blocks}</td>
                <td>${h.border}</td>
                <td>${h.score}</td>
            </tr>`;
        });
        $history.innerHTML = historyHtml;
    } else {
        $history.innerHTML = '<td colspan="5">No Data</td>';
    }
}