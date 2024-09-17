let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
const gridSize = 50;
let parkingLotWidth, parkingLotHeight;
let parkingX, parkingY;
let parkingWidth, parkingHeight;
let cars = [];
let score = 0;
let isCarMoving = false;
let isGameStarted = false;
let timer = 0;
let timerInterval = null;
const buttonWidth = 100;
const buttonHeight = 50;

const carImages = {};
const carSizes = [
    { width: 1, height: 1, imageSrc: './img/carHor1.png' },
    { width: 1, height: 2, imageSrc: './img/carVer2.png' },
    { width: 1, height: 3, imageSrc: './img/carVer3.png' },
    { width: 2, height: 1, imageSrc: './img/carHor2.png' },
    { width: 3, height: 1, imageSrc: './img/carHor3.png' }
];

const buttons = [
    { x: 10, y: 110, width: buttonWidth, height: buttonHeight, label: 'Fácil', level: 'easy' },
    { x: 10, y: 170, width: buttonWidth, height: buttonHeight, label: 'Medio', level: 'medium' },
    { x: 10, y: 230, width: buttonWidth, height: buttonHeight, label: 'Difícil', level: 'hard' }
];

const ambientMusic = new Audio('./audio/HansZimmer.mp3');
const carMoveSound = new Audio('./audio/carMove.mp3');
const carExitSound = new Audio('./audio/carExit.mp3');

ambientMusic.loop = true;
ambientMusic.volume = 0.5;
carMoveSound.volume = 0.1;
carExitSound.volume = 0.1;

let endGameImage = new Image();
endGameImage.src = './img/hayClase.png';

ambientMusic.loop = true;
ambientMusic.volume = 0.5;

function startAmbientMusic() {
    ambientMusic.play();
}

function loadCarImages(callback) {
    let imagesLoaded = 0;
    carSizes.forEach((carSize, index) => {
        const img = new Image();
        img.src = carSize.imageSrc;
        img.onload = () => {
            carImages[index] = img;
            imagesLoaded++;
            if (imagesLoaded === carSizes.length) {
                callback();
            }
        };
    });
}

function setDifficulty(level) {
    switch (level) {
        case 'easy':
            parkingLotWidth = 5;
            parkingLotHeight = 5;
            break;
        case 'medium':
            parkingLotWidth = 10;
            parkingLotHeight = 10;
            break;
        case 'hard':
            parkingLotWidth = 15;
            parkingLotHeight = 15;
            break;
    }
    initGame();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        drawParkingLot();
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function isPositionValid(x, y, width, height) {
    if (x < 0 || y < 0 || x + width > parkingLotWidth || y + height > parkingLotHeight) {
        return false;
    }

    for (let car of cars) {
        if (
            x < car.x + car.width &&
            x + width > car.x &&
            y < car.y + car.height &&
            y + height > car.y
        ) {
            return false;
        }
    }

    return true;
}

function getRandomPosition(size) {
    const { width, height } = size;
    let x, y;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        x = Math.floor(Math.random() * (parkingLotWidth - width + 1));
        y = Math.floor(Math.random() * (parkingLotHeight - height + 1));
        attempts++;
    } while (!isPositionValid(x, y, width, height) && attempts < maxAttempts);

    if (attempts >= maxAttempts) {
        return null;
    }

    return { x, y };
}

function fillParkingLot() {
    let attempts = 0;
    const maxAttempts = 1000;

    while (attempts < maxAttempts) {
        const carSize = carSizes[Math.floor(Math.random() * carSizes.length)];
        let position = getRandomPosition(carSize);

        if (position !== null) {
            const { x, y } = position;
            const direction = carSize.width === 1 ? 'vertical' : 'horizontal';
            cars.push(new Car(x, y, carSize.width, carSize.height, carSizes.indexOf(carSize), direction));
            drawParkingLot();
            attempts = 0;
        } else {
            attempts++;
        }

        if (attempts >= maxAttempts) {
            console.warn("No se pudo encontrar más espacio para carros.");
            break;
        }
    }
}

function drawButtons() {
    buttons.forEach(button => {
        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
    });
}

function drawParkingLot() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(parkingX, parkingY, parkingWidth, parkingHeight);

    cars.forEach(car => {
        car.draw();
    });

    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Puntaje: " + score, 60, 60);

    ctx.fillText("Tiempo: " + timer + "s", 60, 90);

    drawButtons();

    if (cars.length === 0) {
        stopTimer();
        drawEndGameImage();
    }
}

function drawEndGameImage() {
    const imageWidth = 600;
    const imageHeight = 600;
    const x = (canvas.width - imageWidth) / 2;
    const y = (canvas.height - imageHeight) / 2;
    
    ctx.drawImage(endGameImage, x, y, imageWidth, imageHeight);
}

function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    parkingWidth = parkingLotWidth * gridSize;
    parkingHeight = parkingLotHeight * gridSize;
    parkingX = (canvas.width - parkingWidth) / 2;
    parkingY = (canvas.height - parkingHeight) / 2;

    cars = [];
    score = 0;
    isCarMoving = false;
    isGameStarted = false;
    timer = 0;
    stopTimer();

    loadCarImages(() => {
        fillParkingLot();
    });
}

function isPointInRect(px, py, rect) {
    return px >= rect.x && px <= rect.x + rect.width &&
           py >= rect.y && py <= rect.y + rect.height;
}

canvas.addEventListener('click', (e) => {
    if (isCarMoving) return;
    startAmbientMusic();

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let button of buttons) {
        if (isPointInRect(mouseX, mouseY, button)) {
            setDifficulty(button.level);
            return;
        }
    }

    for (let car of cars) {
        if (car.containsPoint(mouseX, mouseY)) {
            if (!isGameStarted) {
                isGameStarted = true;
                startTimer();
            }
            car.moveAutomatically();
            isCarMoving = true;
            break;
        }
    }
});

setDifficulty('easy');
