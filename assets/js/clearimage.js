const $canvas = document.getElementById('game');
const $message = document.getElementById('message');
const $timer = document.getElementById('timer');
const $cells = document.getElementById('cells');
const $start = document.getElementById('start');
const $stop = document.getElementById('stop');

const context = $canvas.getContext('2d');

let grid, countCells, mouseX = 0, mouseY = 0, squares;

$canvas.addEventListener("mousemove", function (e) {
    mouseX = e.offsetX;
    mouseY = e.offsetY;
    squares.forEach((s, i) => {
        if (mouseX >= s.x && mouseX <= s.x + s.size && mouseY >= s.y && mouseY <= s.y + s.size) {
            if (s.size < grid) {
                context.clearRect(s.x, s.y, s.size, s.size);
            } else {
                separateSquare(s.x, s.y, s.size);
            }
            squares.splice(i, 1);
            if (!squares.length) {
                context.clearRect(0, 0, wh, wh);
                endGame(true);
            }
        }
    });
}, false);

$start.addEventListener('click', function (e) {
    prepareCanvas();

    $start.classList.add('d-none');
    $stop.classList.remove('d-none');
    $timer.innerText = 0;
    $message.classList.add('d-none');
    $cells.disabled = true;

    timer = setInterval(() => {
        $timer.innerText = parseInt($timer.innerText) + 1;
    }, 1000);
});

$stop.addEventListener('click', function (e) {
    endGame();
});

function prepareCanvas() {
    countCells = parseInt($cells.value);
    grid = getGridByCells(countCells);
    wh = grid * countCells;
    $canvas.setAttribute('width', wh.toString());
    $canvas.setAttribute('height', wh.toString());

    let imgPath = 'assets/img/clearimages/' + getRandomInt(1, 11) + '.jpg';
    $canvas.style.background = 'url(' + imgPath + ')';
    $canvas.style.backgroundSize = 'cover';

    squares = [];
    separateSquare(0, 0, wh);
}

function separateSquare(x, y, fullSize) {
    let size = fullSize / 2;

    squares.push({x, y, size});
    squares.push({x: x + size, y, size});
    squares.push({x, y: y + size, size});
    squares.push({x: x + size, y: y + size, size});

    squares.slice(-4).forEach(s => {
        context.fillStyle = getRandomColor();
        context.fillRect(s.x, s.y, s.size, s.size);
    })
}

function getRandomColor() {
    switch (getRandomInt(1, 5)) {
        case 1:
            return 'lightblue';
        case 2:
            return 'lightpink';
        case 3:
            return 'lightgreen';
        default:
            return 'lightyellow';
    }
}

function endGame(win = false) {
    clearInterval(timer);
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
    $cells.disabled = false;
}