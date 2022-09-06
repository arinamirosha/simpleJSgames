const $canvas = document.getElementById('game');
const $message = document.getElementById('message');
const $start = document.getElementById('start');
const $stop = document.getElementById('stop');
const $lives = document.getElementById('lives');
const $round = document.getElementById('round');

const context = $canvas.getContext('2d');
const width = 800;
const height = 600;
const elSize = 25;
const halfSize = elSize / 2;
const startX = width / 2 - elSize;
const startY = height - elSize * 1.5;

$canvas.setAttribute('width', width.toString());
$canvas.setAttribute('height', height.toString());

let loopId, currentRound, player, ball, curStartX, curHeightY;

$start.addEventListener('click', function (e) {
    setRound(1);
    setStartPlayerBall();

    $lives.innerText = '3';
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

    if (e.code === 'ArrowUp') {
        ball.flying = true;
    } else if (e.code === 'ArrowLeft') {
        if (ball.flying && player.x - halfSize >= 0 ||
            !ball.flying && player.x + player.len >= ball.x + elSize
        ) {
            player.x -= halfSize;
            drawPlayer(true);
            if (!ball.flying && ball.angle + 6 < 45) {
                ball.angle += 6;
            }
        }
    } else if (e.code === 'ArrowRight') {
        if (ball.flying && player.x + player.len + halfSize <= width ||
            !ball.flying && player.x <= ball.x
        ) {
            player.x += halfSize;
            drawPlayer(true);
            if (!ball.flying && ball.angle - 6 > -45) {
                ball.angle -= 6;
            }
        }
    }
});

function loop() {
    loopId = requestAnimationFrame(loop);

    if (ball.flying) {
        let changeY = halfSize / 3;
        ball.y += changeY * ball.dy;
        curHeightY += changeY;
        if (ball.y <= 0 ||
            ball.y === startY && ball.x >= player.x - halfSize && ball.x <= player.x + player.len + halfSize
        ) {
            ball.dy *= -1;
            // change angle according there touched player
            if (ball.y === startY) {
                curStartX = ball.x;
                curHeightY = 0;
                setNewBallAngle();
            }
        }
        ball.x = curHeightY * Math.tan(ball.angle * Math.PI / 180) + curStartX;

        // round
        currentRound.forEach((cr, index) => {
            if (Math.ceil(ball.x) + elSize === cr.x && ball.y + elSize > cr.y && ball.y < cr.y + elSize ||
                Math.ceil(ball.x) === cr.x + elSize * 2 && ball.y + elSize > cr.y && ball.y < cr.y + elSize) {
                curStartX = ball.x;
                curHeightY = 0;
                ball.angle = -ball.angle;
                currentRound.splice(index, 1);
            } else if (ball.x + elSize > cr.x && ball.x < cr.x + elSize * 2 && Math.ceil(ball.y) === cr.y + elSize && ball.dy === -1 ||
                ball.x + elSize > cr.x && ball.x < cr.x + elSize * 2 && Math.ceil(ball.y) + elSize === cr.y && ball.dy === 1) {
                ball.dy *= -1;
                currentRound.splice(index, 1);
            }
        });

        // border
        if (ball.x + elSize >= width) {
            curStartX = width - elSize;
            curHeightY = 0;
            ball.angle = -ball.angle;
        } else if (ball.x <= 0) {
            curStartX = 0;
            curHeightY = 0;
            ball.angle = -ball.angle;
        }

        // bottom
        if (ball.y >= height) {
            setStartPlayerBall();
            let lives = parseInt($lives.innerText) - 1;
            $lives.innerText = lives.toString();
            if (!lives) {
                endGame();
            }
        }

        // finish or next round
        if (!currentRound.length) {
            let newRound = parseInt($round.innerText) + 1;
            if (newRound > getRounds().length) {
                endGame(true);
            } else {
                setStartPlayerBall();
                setRound(newRound);
            }
        }
    }


    drawGame();
}

function drawGame() {
    context.clearRect(0, 0, width, height);
    // round
    currentRound.forEach(cr => {
        context.fillStyle = cr.color;
        context.fillRect(cr.x, cr.y, elSize * 2 - 1, elSize - 1);
    });
    drawPlayer();
    // ball
    context.fillStyle = 'lightblue';
    context.beginPath();
    context.arc(ball.x + halfSize, ball.y + halfSize, halfSize, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
}

function drawPlayer(clearBefore) {
    if (clearBefore) {
        context.clearRect(0, player.y, width, halfSize);
    }
    context.fillStyle = 'pink';
    context.fillRect(player.x, player.y, player.len, halfSize);
}

function setRound(r) {
    $round.innerText = r;
    currentRound = getRounds()[r - 1];
}

function setStartPlayerBall() {
    player = {
        x: width / 2 - elSize * 4,
        y: height - halfSize,
        len: elSize * 7,
    };
    ball = {
        x: startX,
        y: startY,
        dy: -1, // 1 or -1
        flying: false,
        angle: 0,
    };
    curStartX = startX;
    curHeightY = 0;
}

function endGame(win = false) {
    cancelAnimationFrame(loopId);
    if (win) {
        $message.innerText = 'Congratulations!';
        $message.classList.remove('text-danger');
        $message.classList.add('text-primary');
    } else {
        $message.innerText = 'Game over';
        $message.classList.remove('text-primary');
        $message.classList.add('text-danger');
    }
    $message.classList.remove('d-none');
    $start.classList.remove('d-none');
    $stop.classList.add('d-none');
}

function getRounds() {
    let rounds = [],
        round1 = [],
        round2 = [],
        round3 = [];

    // round 1
    for (let x = 0; x < width; x += elSize * 2) {
        round1.push({x, y: elSize * 2, color: 'purple'});
        round1.push({x, y: elSize * 7, color: 'orange'});
        if (x > elSize * 5 && x < width / 2 - elSize * 6 || x < width - elSize * 6 && x > width / 2 + elSize * 5) {
            round1.push({x, y: elSize * 11, color: 'black'});
            round1.push({x, y: elSize * 11, color: 'black'});
        }
    }
    rounds.push(round1);

    // round 2
    for (let x = 0; x < width; x += elSize * 2) {
        if (x === width / 2 - elSize * 2) {
            round2.push({x, y: elSize * 2, color: 'brown'});
            round2.push({x, y: elSize * 8, color: 'black'});
            round2.push({x, y: elSize * 8, color: 'black'});
        }
        if (x > width / 2 - elSize * 5 && x < width / 2 + elSize * 2) {
            round2.push({x, y: elSize * 3, color: 'brown'});
            round2.push({x, y: elSize * 13, color: 'brown'});
        }
        if (x > width / 2 - elSize * 7 && x < width / 2 + elSize * 4) {
            round2.push({x, y: elSize * 4, color: 'brown'});
            round2.push({x, y: elSize * 12, color: 'brown'});
        }
        if (x > width / 2 - elSize * 9 && x < width / 2 + elSize * 5) {
            round2.push({x, y: elSize * 5, color: 'brown'});
            round2.push({x, y: elSize * 11, color: 'brown'});
        }
        if (x > width / 2 - elSize * 11 && x < width / 2 + elSize * 8) {
            round2.push({x, y: elSize * 6, color: 'brown'});
            round2.push({x, y: elSize * 10, color: 'brown'});
        }
        if (x > width / 2 - elSize * 13 && x < width / 2 + elSize * 10) {
            round2.push({x, y: elSize * 7, color: 'brown'});
            round2.push({x, y: elSize * 9, color: 'brown'});
        }
    }
    rounds.push(round2);

    // round 3
    for (let x = 0; x < width; x += elSize * 2) {
        round3.push({x, y: elSize * 2, color: 'blue'});
        round3.push({x, y: elSize * 9, color: 'yellow'});
        if (x % 3) {
            round3.push({x, y: elSize * 3, color: 'black'});
            round3.push({x, y: elSize * 3, color: 'black'});
        }
        if (x % 4) {
            round3.push({x: x < width / 2 ? x - elSize * 2 : x, y: elSize * 6, color: 'yellow'});
            round3.push({x: x < width / 2 ? x - elSize * 2 : x, y: elSize * 11, color: 'red'});
            round3.push({x: x < width / 2 ? x - elSize * 2 : x, y: elSize * 12, color: 'red'});
        }
        if (x % 8) {
            round3.push({x: x < width / 2 ? x - elSize * 2 : x, y: elSize * 7, color: 'green'});
        }
    }
    rounds.push(round3);

    return rounds;
}

function setNewBallAngle() {
    let xPayerBall = ball.x - player.x;
    ball.angle = xPayerBall < halfSize ? -42 :
        (xPayerBall < halfSize * 2 ? -36 :
                (xPayerBall < halfSize * 3 ? -30 :
                        (xPayerBall < halfSize * 4 ? -24 :
                                (xPayerBall < halfSize * 5 ? -18 :
                                        (xPayerBall < halfSize * 6 ? -12 :
                                                (xPayerBall < halfSize * 7 ? -6 :
                                                        (xPayerBall < halfSize * 8 ? 0 :
                                                                (xPayerBall < halfSize * 9 ? 6 :
                                                                        (xPayerBall < halfSize * 10 ? 12 :
                                                                                (xPayerBall < halfSize * 11 ? 18 :
                                                                                        (xPayerBall < halfSize * 12 ? 24 :
                                                                                                (xPayerBall < halfSize * 13 ? 30 :
                                                                                                        (xPayerBall < halfSize * 14 ? 36 : 42)
                                                                                                )
                                                                                        )
                                                                                )
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                )
                        )
                )
        );
}