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

const context = $canvas.getContext('2d');
const minimizeCell = 1;

let count = 0, loopId, level, snake, apple, grid, countCells, borderIgnore;

setCanvasGridCells();

addEventListener('load', (event) => {
    let recordStorage = localStorage.getItem('record');
    $record.innerText = recordStorage ? recordStorage : 0;
    updateHistory();
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function drawApple() {
    context.beginPath();

    context.fillStyle = 'gold';
    context.arc(apple.x + grid / 2, apple.y + grid / 2, grid / 2 - minimizeCell, 0, 2 * Math.PI);
    context.fill();

    context.arc(apple.x + grid / 2, apple.y + grid / 2, grid / 2 - minimizeCell, 0, 2 * Math.PI);
    context.stroke();

    context.closePath();
}

function drawSnake() {
    // Обрабатываем каждый элемент змейки
    snake.cells.forEach(function (cell, index) {
        // Рисуем элемент
        if (index) {
            context.fillStyle = 'PaleTurquoise';
        } else {
            context.fillStyle = 'DeepSkyBlue';
        }
        context.fillRect(cell.x, cell.y, grid - minimizeCell, grid - minimizeCell);
        context.strokeRect(cell.x, cell.y, grid - (minimizeCell * 2), grid - (minimizeCell * 2));

        // Попали на яблоко
        if (cell.x === apple.x && cell.y === apple.y) {
            $score.innerText = parseInt($score.innerText) + 1;
            checkAndSetRecord();
            snake.maxCells++;
            apple.x = grid * getRandomInt(0, countCells);
            apple.y = grid * getRandomInt(0, countCells);
        }

        // Столкновние с собой
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                stopGame();
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

    drawApple();
    drawSnake();
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
    $border.disabled = true;

    snake = {
        x: grid * Math.floor(countCells / 2),
        y: grid * Math.floor(countCells / 2),
        dx: grid,
        dy: 0,
        cells: [],
        maxCells: 4
    };
    apple = {
        x: grid * getRandomInt(0, countCells),
        y: grid * getRandomInt(0, countCells)
    };

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
            return 38;
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
}

function updateHistory(addNew = false) {
    let historyStorage = JSON.parse(localStorage.getItem('history'));
    if (addNew && parseInt($score.innerText) !== 0) {
        let newData = {
            date: new Date().toISOString().slice(0, 10),
            speed: parseInt($speed.value),
            border: $border.checked ? 'ignore' : ' no ignore',
            cells: parseInt($cells.value),
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
                <td>${h.border}</td>
                <td>${h.cells}</td>
                <td>${h.score}</td>
            </tr>`;
        });
        $history.innerHTML = historyHtml;
    } else {
        $history.innerHTML = '<td colspan="5">No Data</td>';
    }
}