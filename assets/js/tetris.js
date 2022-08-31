const $canvas = document.getElementById('game');
const $message = document.getElementById('message');
const $start = document.getElementById('start');
const $stop = document.getElementById('stop');
const $speed = document.getElementById('speed');
const $lines = document.getElementById('lines');

const context = $canvas.getContext('2d');
// carefully change width, height and elSize
const width = 400;
const height = 600;
const elSize = 25;
const countInLine = width / elSize; // must be int
const figures = [
    {
        elements: [
            {x: 0, y: 0},
            {x: elSize, y: 0},
            {x: elSize, y: elSize},
            {x: 0, y: elSize}
        ],
        color: 'yellow',
    },
    {
        elements: [
            {x: 0, y: 0},
            {x: 0, y: elSize},
            {x: 0, y: elSize * 2},
            {x: 0, y: elSize * 3},
        ],
        color: 'lightblue',
    },
    {
        elements: [
            {x: 0, y: 0},
            {x: 0, y: elSize},
            {x: 0, y: elSize * 2},
            {x: elSize, y: elSize * 2},
        ],
        color: 'orange',
    },
    {
        elements: [
            {x: elSize, y: 0},
            {x: elSize, y: elSize},
            {x: elSize, y: elSize * 2},
            {x: 0, y: elSize * 2},
        ],
        color: 'blue',
    },
    {
        elements: [
            {x: elSize, y: 0},
            {x: 0, y: elSize},
            {x: elSize, y: elSize},
            {x: elSize * 2, y: elSize},
        ],
        color: 'purple',
    },

    {
        elements: [
            {x: 0, y: 0},
            {x: 0, y: elSize},
            {x: elSize, y: elSize},
            {x: elSize, y: elSize * 2},
        ],
        color: 'green',
    },
    {
        elements: [
            {x: elSize, y: 0},
            {x: 0, y: elSize},
            {x: elSize, y: elSize},
            {x: 0, y: elSize * 2},
        ],
        color: 'red',
    }
];

$canvas.setAttribute('width', width.toString());
$canvas.setAttribute('height', height.toString());

let curFigure, inGame, level, loopId, speedX = false, count = 0;

$start.addEventListener('click', function (e) {
    level = getLevelBySpeed(parseInt($speed.value));
    inGame = [];
    setNewFigure();

    $speed.disabled = true;
    $lines.innerText = '0';
    $start.classList.add('d-none');
    $stop.classList.remove('d-none');
    $message.classList.add('d-none');

    loopId = requestAnimationFrame(loop);
});

$stop.addEventListener('click', function (e) {
    endGame();
});

document.addEventListener('keydown', function (e) {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    if (e.code === 'ArrowLeft' && curFigure.dx - elSize >= 0) {
        if (!isNextStop('x', 'minus')) {
            curFigure.dx -= elSize;
            speedX = true;
        }
    } else if (e.code === 'ArrowUp') {
        rotateFigure();
    } else if (e.code === 'ArrowRight' && Math.max(...curFigure.elements.map(el => el.x)) + curFigure.dx + elSize < width) {
        if (!isNextStop('x')) {
            curFigure.dx += elSize;
            speedX = true;
        }
    } else if (e.code === 'ArrowDown') {
        level = getLevelBySpeed(6);
    }
});

document.addEventListener('keyup', function (e) {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        speedX = false;
    } else if (e.code === 'ArrowDown') {
        level = getLevelBySpeed(parseInt($speed.value));
    }
});

function loop() {
    loopId = requestAnimationFrame(loop);

    if (speedX) {
        drawGame();
    }

    if (++count < level) {
        return;
    }
    count = 0;


    if (isNextStop()) {
        addToBottom();
        setNewFigure();
        if (Math.min(...inGame.map(ig => ig.y)) <= 0) {
            endGame();
        }
    } else {
        curFigure.dy += elSize;
    }

    drawGame();
}

function drawGame() {
    context.clearRect(0, 0, width, height);
    drawFigure();
    drawInGame();
}

function setNewFigure() {
    let randIndex = getRandomInt(0, figures.length);
    curFigure = figures[randIndex];
    curFigure.dx = width / 2 - elSize * 2;
    curFigure.dy = -elSize * 3;
}

function drawFigure() {
    context.fillStyle = curFigure.color;
    curFigure.elements.forEach(el =>
        context.fillRect(el.x + curFigure.dx, el.y + curFigure.dy, elSize - 1, elSize - 1)
    );
}

function drawInGame() {
    inGame.forEach(ig => {
        context.fillStyle = ig.color;
        context.fillRect(ig.x, ig.y, elSize - 1, elSize - 1);
    })
}

function isNextStop(xy = 'y', sign = 'plus') {
    try {
        let size = elSize * (sign === 'minus' ? -1 : 1);
        curFigure.elements.forEach(el => {
            let stop = false,
                newX = curFigure.dx + el.x + (xy === 'x' ? size : 0),
                newY = curFigure.dy + el.y + (xy === 'y' ? size : 0);
            if (newY >= height) {
                stop = true;
            }
            inGame.forEach(ig => {
                if (newX === ig.x && newY === ig.y) {
                    stop = true;
                }
            })
            if (stop) {
                throw 'Stop';
            }
        })
        return false;
    } catch (e) {
        return true;
    }
}

function addToBottom() {
    curFigure.elements.forEach(e =>
        inGame.push({
            color: curFigure.color,
            x: e.x + curFigure.dx,
            y: e.y + curFigure.dy,
        })
    );
    // delete full lines
    let counts = [];
    inGame.forEach(ig => counts[ig.y] = counts[ig.y] ? ++counts[ig.y] : 1)
    counts.forEach((count, key) => {
        if (count === countInLine) {
            inGame = inGame.filter(ig => ig.y !== key);
            inGame.forEach(ig => {
                if (ig.y < key) {
                    ig.y += elSize;
                }
            });
            $lines.innerText = parseInt($lines.innerText) + 1;
        }
    });
}

function rotateFigure(changeDx = 0) {
    let fw = Math.max(...curFigure.elements.map(el => el.x)) / elSize + 1,
        fh = Math.max(...curFigure.elements.map(el => el.y)) / elSize + 1,
        changes = [];

    try {
        curFigure.elements.forEach((el, index) => {
            let changeX = 0, changeY = 0;

            if (fw === 2 && fh === 3) {
                if (el.x === 0 && el.y === 0) {
                    changeX = elSize * 2;
                } else if (el.x === elSize && el.y === 0) {
                    changeX = elSize;
                    changeY = elSize;
                } else if (el.x === elSize && el.y === elSize * 2) {
                    changeX = -elSize;
                    changeY = -elSize;
                } else if (el.x === 0 && el.y === elSize * 2) {
                    changeY = -elSize * 2;
                } else if (el.x === 0 && el.y === elSize) {
                    changeX = elSize;
                    changeY = -elSize;
                }

            } else if (fw === 3 && fh === 2) {
                if (el.x === 0 && el.y === 0) {
                    changeX = elSize;
                } else if (el.x === elSize && el.y === 0) {
                    changeY = elSize;
                } else if (el.x === elSize * 2 && el.y === 0) {
                    changeX = -elSize;
                    changeY = elSize * 2;
                } else if (el.x === elSize * 2 && el.y === elSize) {
                    changeX = -elSize * 2;
                    changeY = elSize;
                } else if (el.x === elSize && el.y === elSize) {
                    changeX = -elSize;
                } else if (el.x === 0 && el.y === elSize) {
                    changeY = -elSize;
                }

            } else if (fw === 1 && fh === 4) {
                if (el.x === 0 && el.y === elSize) {
                    changeX = elSize;
                    changeY = -elSize;
                } else if (el.x === 0 && el.y === elSize * 2) {
                    changeX = elSize * 2;
                    changeY = -elSize * 2;
                } else if (el.x === 0 && el.y === elSize * 3) {
                    changeX = elSize * 3;
                    changeY = -elSize * 3;
                }

            } else if (fw === 4 && fh === 1) {
                if (el.x === elSize && el.y === 0) {
                    changeX = -elSize;
                    changeY = elSize;
                } else if (el.x === elSize * 2 && el.y === 0) {
                    changeX = -elSize * 2;
                    changeY = elSize * 2;
                } else if (el.x === elSize * 3 && el.y === 0) {
                    changeX = -elSize * 3;
                    changeY = elSize * 3;
                }
            }
            if (changeX || changeY) {
                let newX = curFigure.dx + changeDx + el.x + changeX,
                    newY = curFigure.dy + el.y + changeY;
                if (newY >= height) {
                    throw 'Out of bottom border';
                }
                if (newX >= width) {
                    rotateFigure(-elSize * (fh - fw));
                    throw 'Out of side border';
                }
                inGame.forEach(ig => {
                    if (newX === ig.x && newY === ig.y) {
                        throw 'No rotate';
                    }
                });
                changes.push({
                    elIndex: index,
                    changeX,
                    changeY
                })
            }
        })
        if (changeDx) {
            curFigure.dx += changeDx;
        }
        changes.forEach(c => {
            curFigure.elements[c.elIndex].x += c.changeX;
            curFigure.elements[c.elIndex].y += c.changeY;
        })
    } catch (e) {
    }
}

function endGame() {
    cancelAnimationFrame(loopId);

    $message.innerText = 'Game over';
    $message.classList.add('text-danger');
    $message.classList.remove('d-none');
    $start.classList.remove('d-none');
    $stop.classList.add('d-none');

    $speed.disabled = false;
}