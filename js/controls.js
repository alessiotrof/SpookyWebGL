// Script per la gestione degli input

function initControls() {

    // Event listeners for keyboard
    window.addEventListener("keydown", doKeyDown, true);
    window.addEventListener("keyup", doKeyUp, true);

    // Togliere i commenti qui sotto per provare le funzioni del touch handlers
    // canvas.addEventListener('touchstart', handleTouchStart, false);
    // canvas.addEventListener('touchmove', (e) => handleTouchMove(e, canvas, camera), false);
    // canvas.addEventListener('touchend', handleTouchEnd, false);
    // canvas.addEventListener('mouseout', handleTouchEnd, false);

    canvas.addEventListener('touchstart', handleMouseDown, false);
    canvas.addEventListener('touchmove', handleMouseMove, false);
    canvas.addEventListener('touchend', handleMouseUp, false);
    canvas.addEventListener('mouseout', handleMouseUp, false);

    // Event listeners for mouse
    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mouseout', handleMouseUp, false);

    // Event listeners per le frecce a schermo
    document.getElementById('up-button').addEventListener('click', () => camera.moveForward(0.2));
    document.getElementById('down-button').addEventListener('click', () => camera.moveForward(-0.2));
    document.getElementById('left-button').addEventListener('click', () => camera.moveRight(-0.2));
    document.getElementById('right-button').addEventListener('click', () => camera.moveRight(0.2));
    document.getElementById('center-button').addEventListener('click', () => camera.reset());
}

const mouse = {
    drag: false,
    oldX: 0,
    oldY: 0
};

function handleMouseDown(e) {
    mouse.drag = true;
    mouse.oldX = e.pageX;
    mouse.oldY = e.pageY;
    e.preventDefault();
    //console.log("Pressed a mouse button!");
}

function handleMouseUp() {
    mouse.drag = false;
    //console.log("Released a mouse button!");
}

function handleMouseMove(e) {
    if (!mouse.drag)
        return;

    const dX = -(e.pageX - mouse.oldX) * 2 * Math.PI / canvas.width;
    camera.rotateLeft(-dX * 0.2);

    const dY = -(e.pageY - mouse.oldY) * 2 * Math.PI / canvas.height;
    camera.rotateUp(-dY * 0.2);

    mouse.oldX = e.pageX;
    mouse.oldY = e.pageY;
    e.preventDefault();
}

function handleTouchStart(e) {
    if (e.touches.length == 1) {
        const touch = e.touches[0];
        mouse.drag = true;
        mouse.oldX = touch.pageX;
        mouse.oldY = touch.pageY;
    }
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!mouse.drag || e.touches.length != 1)
        return;

    const touch = e.touches[0];
    const dX = -(touch.pageX - mouse.oldX) * 2 * Math.PI / canvas.width;
    camera.rotateLeft(-dX * 0.2);

    const dY = -(touch.pageY - mouse.oldY) * 2 * Math.PI / canvas.height;
    camera.rotateUp(-dY * 0.2);

    mouse.oldX = touch.pageX;
    mouse.oldY = touch.pageY;
    e.preventDefault();
}

function handleTouchEnd() {
    mouse.drag = false;
}

var keys = [];

function doKeyDown(e) {
    keys[e.key] = true;
    //console.log("Pressed a key!");
}

function doKeyUp(e) {
    keys[e.key] = false;
    //console.log("Released a key!");
}

function moveCameraWithKeyboard() {
    
    const speed = 0.02;

    // Movimento normale
    if (keys["w"]) {
        //console.log("Premuto W");
        camera.moveForward(speed);
    }
    if (keys["s"]) {
        //console.log("Premuto S");
        camera.moveForward(-speed);
    }
    if (keys["a"]) {
        //console.log("Premuto A");
        camera.moveRight(-speed);
    }
    if (keys["d"]) {
        //console.log("Premuto D");
        camera.moveRight(speed);
    }

    // Su/Giù
    if (keys["q"]) {
        //console.log("Premuto Q");
        camera.moveUp(speed);
    }
    if (keys["e"]) {
        //console.log("Premuto E");
        camera.moveUp(-speed);
    }

    // Rotazione
    if (keys["ArrowUp"]) {
        //console.log("Premuto Freccia Su");
        camera.rotateUp(speed*0.5);
    }
    if (keys["ArrowDown"]) {
        //console.log("Premuto Freccia Giù");
        camera.rotateUp(-speed*0.5);
    }
    if (keys["ArrowLeft"]) {
        //console.log("Premuto Freccia Sinistra");
        camera.rotateLeft(speed*0.5);
    }
    if (keys["ArrowRight"]) {
        //console.log("Premuto Freccia Destra");
        camera.rotateLeft(-speed*0.5);
    }

    // Reset
    if (keys["r"]) {
        //console.log("Premuto R");
        camera.reset();
    }
}