class Car {
    constructor(x, y, width, height, imageIndex, direction) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imageIndex = imageIndex;
        this.direction = direction;
    }

    draw() {
        const img = carImages[this.imageIndex];
        if (img) {
            ctx.drawImage(img, parkingX + this.x * gridSize, parkingY + this.y * gridSize, this.width * gridSize, this.height * gridSize);
        }
    }

    containsPoint(px, py) {
        return px >= parkingX + this.x * gridSize && px <= parkingX + (this.x + this.width) * gridSize &&
               py >= parkingY + this.y * gridSize && py <= parkingY + (this.y + this.height) * gridSize;
    }

    canMove(dx, dy) {
        let newX = this.x + dx;
        let newY = this.y + dy;

        if (newX < 0) newX = -this.width;
        if (newX + this.width > parkingLotWidth) newX = parkingLotWidth;
        if (newY < 0) newY = -this.height;
        if (newY + this.height > parkingLotHeight) newY = parkingLotHeight;

        for (let otherCar of cars) {
            if (otherCar !== this) {
                if (newX < otherCar.x + otherCar.width &&
                    newX + this.width > otherCar.x &&
                    newY < otherCar.y + otherCar.height &&
                    newY + this.height > otherCar.y) {
                    return false;
                }
            }
        }

        return { x: newX, y: newY };
    }

    moveAutomatically() {
        if (isCarMoving) return;

        carMoveSound.play();

        let dx = 0, dy = 0;
        if (this.height === 1) {
            dx = Math.random() > 0.5 ? 1 : -1;
        } else if (this.width === 1) {
            dy = Math.random() > 0.5 ? 1 : -1;
        } else {
            return;
        }

        isCarMoving = true;

        const interval = setInterval(() => {
            const newPos = this.canMove(dx, dy);
            if (newPos) {
                this.x = newPos.x;
                this.y = newPos.y;

                if (this.isOutOfParkingLot()) {
                    carExitSound.play();
                    score += 50;
                    cars.splice(cars.indexOf(this), 1);
                    drawParkingLot();
                    clearInterval(interval);
                    isCarMoving = false;
                } else {
                    drawParkingLot();
                }
            } else {
                clearInterval(interval);
                isCarMoving = false;
            }
        }, 100);
    }

    isOutOfParkingLot() {
        return (
            this.x + this.width <= 0 ||
            this.x >= parkingLotWidth ||
            this.y + this.height <= 0 ||
            this.y >= parkingLotHeight
        );
    }
}
