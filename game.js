const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

function fillBackground(col) {
    fillRect(0, 0, canvas.width, canvas.height, col);
}

function fillRect(x, y, w, h, col) {
    context.fillStyle = col;
    context.fillRect(x, y, w, h);
}

function fillCircle(x, y, r, col) {
    context.beginPath();
    context.fillStyle = col;
    context.arc(x, y, r, 0, 2 * Math.PI, false);
    context.fill();
}

function drawText(x, y, text, col, fontSize) {
    context.font = fontSize + 'pt monospace';
    context.fillStyle = col;
    context.textAlign = 'center';
    context.fillText(text, x, y);
}

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 0;
        this.xDirection = 0;
        this.yDirection = 0;
    }

    draw() {
        // Can't draw an abstract entity
    }

    isWithinCanvas(newX, newY) {
        // Don't know how to check if an abstract entity is within the canvas
        return true;
    }

    setDirection(xDir, yDir) {
        this.xDirection = xDir;
        this.yDirection = yDir;
    }

    doCollisionBehaviour() {
        // No behaviour here...
    }
    
    move() {
        let newX = this.x + this.xDirection * this.speed;
        let newY = this.y + this.yDirection * this.speed;

        if (this.hasNoCollisions(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
        else {
            this.doCollisionBehaviour();
        }
    }
}

class Paddle extends Entity {
    constructor(x, y) {
        super(x, y);
        this.width = canvas.width / 3;
        this.height = canvas.height / 16;
        this.speed = 8;
    }

    draw() {
        fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height, 'white');
    }

    hasNoCollisions(newX, newY) {
        if (newX - (this.width / 2) < 0) {
            return false;
        }
        else if (newX + (this.width / 2) > canvas.width) {
            return false;
        }

        if (newY - (this.height / 2) < 0) {
            return false;
        }
        else if (newY + (this.height / 2) > canvas.height) {
            return false;
        }

        return true;
    }
}

class Ball extends Entity {
    constructor(x, y) {
        super(x, y);
        this.startingX = x;
        this.startingY = y;
        this.radius = canvas.width / 32;
        this.baseSpeed = 4;
        this.maxSpeed = 12;
        this.speed = this.baseSpeed;
        this.collidingWith = null;
        this.lastDirection = 1;
    }

    draw() {
        fillCircle(this.x, this.y, this.radius, 'white');
    }

    hasNoCollisions(newX, newY) {
        if (newX - this.radius < 0) {
            this.collidingWith = 'canvasLeft';
            return false;
        }
        else if (newX + this.radius > canvas.width) {
            this.collidingWith = 'canvasRight';
            return false;
        }

        if (newY - this.radius < 0) {
            this.collidingWith = 'canvasTop';
            return false;
        }
        else if (newY + this.radius > canvas.height) {
            this.collidingWith = 'canvasBottom';
            return false;
        }

        if (this.isCollidingWithPaddle(newX, newY, paddle1)) {
            this.collidingWith = 'paddle1';
            return false;
        }
        else if (this.isCollidingWithPaddle(newX, newY, paddle2)) {
            this.collidingWith = 'paddle2';
            return false;
        }

        this.collidingWith = null;
        return true;
    }

    doCollisionBehaviour() {
        let newXDirection = 0;
        let newYDirection = 0;
        let relativeX = 0;
        let angle = 0;
        
        if (this.speed < this.maxSpeed) {
            this.speed = this.speed + 0.5;
        }
        
        switch (this.collidingWith) {
            case 'canvasLeft':
                newXDirection = -this.xDirection;
                newYDirection = this.yDirection;
                this.x = this.radius;
                break;
            case 'canvasRight':
                newXDirection = -this.xDirection;
                newYDirection = this.yDirection;
                this.x = canvas.width - this.radius;
                break;
            case 'canvasTop':
                player2Score++;
                this.resetToOrigin();
                return;
            case 'canvasBottom':
                player1Score++;
                this.resetToOrigin();
                return;
            case 'paddle1':
                relativeX = (this.x - paddle1.x) / paddle1.width;
                angle = relativeX * Math.PI / 2;
                newXDirection = Math.sin(angle);
                newYDirection = Math.cos(angle);

                if (this.y - this.radius < paddle1.y + (paddle1.height / 2)) {
                    if (this.x < paddle1.x) {
                        this.x = paddle1.x - (paddle1.width / 2) - this.radius - (paddle1.speed + 1);
                    }
                    else {
                        this.x = paddle1.x + (paddle1.width / 2) + this.radius + (paddle1.speed + 1);
                    }
                }
                break;
            case 'paddle2':
                relativeX = (this.x - paddle2.x) / paddle2.width;
                angle = relativeX * Math.PI / 2;
                newXDirection = Math.sin(angle);
                newYDirection = -Math.cos(angle);

                if (this.y + this.radius > paddle2.y - (paddle2.height / 2)) {
                    if (this.x < paddle2.x) {
                        this.x = paddle2.x - (paddle2.width / 2) - this.radius - (paddle1.speed + 1);
                    }
                    else {
                        this.x = paddle2.x + (paddle2.width / 2) + this.radius + (paddle1.speed + 1);
                    }
                }
                break;
        }
        
        this.setDirection(newXDirection, newYDirection);
    }

    resetToOrigin() {
        this.x = this.startingX;
        this.y = this.startingY;
        this.lastDirection = -this.lastDirection;
        this.setDirection(0, this.lastDirection);
        this.speed = this.baseSpeed;
    }

    isCollidingWithPaddle(newX, newY, paddle) {
        let circleXDistance = Math.abs(newX - paddle.x);
        let circleYDistance = Math.abs(newY - paddle.y);

        if (circleXDistance > ((paddle.width / 2) + this.radius)) {
            return false;
        }
        if (circleYDistance > ((paddle.height / 2) + this.radius)) {
            return false;
        }

        if (circleXDistance <= (paddle.width / 2)) {
            return true;
        }
        if (circleYDistance <= (paddle.height / 2)) {
            return true;
        }

        let cornerDistanceSquared = Math.pow(circleXDistance - (paddle.width / 2), 2) + Math.pow(circleYDistance - (paddle.height / 2), 2);

        return cornerDistanceSquared <= Math.pow(this.radius, 2);
    }
}

let paddle1 = new Paddle(canvas.width / 2, canvas.height / 16);
let paddle2 = new Paddle(canvas.width / 2, canvas.height * 15 / 16);
let ball = new Ball(canvas.width / 2, canvas.height / 2);
let keys = {'l1': false, 'r1': false, 'l2': false, 'r2': false, 'restart': false};
let player1Score = 0;
let player2Score = 0;
let gamePlaying = true;

// Perform any other updates
function update(tFrame) {
    if (keys.l1 && !keys.r1) {
        paddle1.setDirection(-1, 0);
    }
    else if (!keys.l1 && keys.r1) {
        paddle1.setDirection(1, 0);
    }
    else {
        paddle1.setDirection(0, 0);
    }

    if (keys.l2 && !keys.r2) {
        paddle2.setDirection(-1, 0);
    }
    else if (!keys.l2 && keys.r2) {
        paddle2.setDirection(1, 0);
    }
    else {
        paddle2.setDirection(0, 0);
    }

    if (gamePlaying) {
        ball.move();
    }
    else if (keys.restart) {
        gamePlaying = true;
        player1Score = 0;
        player2Score = 0;
        paddle1.x = canvas.width / 2;
        paddle1.y = canvas.height / 16;
        paddle2.x = canvas.width / 2;
        paddle2.y = canvas.height * 15 / 16;
        ball.setDirection(0, 1);
    }

    paddle1.move();
    paddle2.move();
}

// Render all the objects on screen
function render() {
    fillBackground('black');
    drawText(150, 200, player1Score.toString(), 'white', 100);
    drawText(canvas.width - 200, canvas.height - 125, player2Score.toString(), 'white', 100);
    paddle1.draw();
    paddle2.draw();

    if (player1Score >= 5) {
        drawText(canvas.width / 2, canvas.height / 2, 'Player 1 wins!', 'white', 80);
        drawText(canvas.width / 2, canvas.height / 2 + 100, 'Press space to restart', 'white', 40);
        gamePlaying = false;
    }
    else if (player2Score >= 5) {
        drawText(canvas.width / 2, canvas.height / 2, 'Player 2 wins!', 'white', 80);
        drawText(canvas.width / 2, canvas.height / 2 + 100, 'Press space to restart', 'white', 40);
        gamePlaying = false;
    }

    if (gamePlaying) {
        ball.draw();
    }
}

function storeInputs(key, pressed) {
    switch (key) {
        case 'a':
            keys.l1 = pressed;
            break;
        case 'd':
            keys.r1 = pressed;
            break;
        case 'ArrowLeft':
            keys.l2 = pressed;
            break;
        case 'ArrowRight':
            keys.r2 = pressed;
            break;
        case ' ':
            keys.restart = pressed;
            break;
    }
}

(function() {
    // Main loop
    function main(tFrame) {
        window.requestAnimationFrame(main);

        update(tFrame);
        render();
    }

    document.addEventListener('keydown', function(e) {
        e.preventDefault();
        storeInputs(e.key, true);
    });

    document.addEventListener('keyup', function(e) {
        e.preventDefault();
        storeInputs(e.key, false);
    });

    ball.setDirection(0, 1);

    main();
})();