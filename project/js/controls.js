// Controls.js - controls and events

// Initialize the event handlers
function initControls() {

    // Keyboard event listeners
    window.addEventListener("keydown", doKeyDown, true);
    window.addEventListener("keyup", doKeyUp, true);

    // Mouse event listeners
    canvas.addEventListener('mousedown', handleMouseDown, false);
    canvas.addEventListener('mouseup', handleMouseUp, false);
    canvas.addEventListener('mousemove', handleMouseMove, false);
    canvas.addEventListener('mouseout', handleMouseUp, false);

    // Touch event listeners
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
    canvas.addEventListener('mouseout', handleTouchEnd, false);

    // Event listeners for the virtual arrows on the web page
    //document.getElementById('up-button').addEventListener('click', () => camera.moveForward(0.3));
    //document.getElementById('down-button').addEventListener('click', () => camera.moveForward(-0.3));
    //document.getElementById('left-button').addEventListener('click', () => camera.moveRight(-0.3));
    //document.getElementById('right-button').addEventListener('click', () => camera.moveRight(0.3));
    //document.getElementById('center-button').addEventListener('click', () => camera.reset());

    // Event listeners for the 2D Canvas buttons
    const commandsCanvas = document.getElementById('commands-canvas');
    commandsCanvas.addEventListener('click', (e) => {
        const rect = commandsCanvas.getBoundingClientRect();

        // Calculate the click coordinates relative to the canvas position
        // by subtracting the left and top borders of the canvas from the click coordinates
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        handleButtonClick(x, y);
    });
}


//
// MOUSE
//


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
}

function handleMouseUp() {
    mouse.drag = false;
}

function handleMouseMove(e) {

    if (!mouse.drag)
        return;

    // Calculate the horizontal mouse movement relative to the previous position
    // Convert the movement in pixels to an angle in radians to pass it to the camera (dX)
    const dX = -(e.pageX - mouse.oldX) * 2 * Math.PI / canvas.width;
    camera.rotateLeft(-dX * 0.2);

    // Same for vertical movement
    const dY = -(e.pageY - mouse.oldY) * 2 * Math.PI / canvas.height;
    camera.rotateUp(-dY * 0.2);

    // Update the mouse coordinates to the current position
    mouse.oldX = e.pageX;
    mouse.oldY = e.pageY;

    e.preventDefault();
}


//
// TOUCH
//


function handleTouchStart(e) {

    // Check if there is only one touch
    if (e.touches.length == 1) {
        const touch = e.touches[0];

        mouse.drag = true;
        
        mouse.oldX = touch.pageX;
        mouse.oldY = touch.pageY;
    }

    e.preventDefault();
}

function handleTouchMove(e) {

    // If there's no dragging or there are multiple touches
    if (!mouse.drag || e.touches.length != 1)
        return;

    // Get the touch coordinates
    const touch = e.touches[0];

    // Calculate the difference in touch position on the X-axis relative to the previous position
    const dX = -(touch.pageX - mouse.oldX) * 2 * Math.PI / canvas.width;
    camera.rotateLeft(-dX * 0.2);

    // Same, but relative to the Y-axis position
    const dY = -(touch.pageY - mouse.oldY) * 2 * Math.PI / canvas.height;
    camera.rotateUp(-dY * 0.2);

    // Update the touch coordinates to the current position
    mouse.oldX = touch.pageX;
    mouse.oldY = touch.pageY;

    e.preventDefault();
}

function handleTouchEnd() {
    mouse.drag = false;
}



//
// KEYBOARD
//


var keys = [];

function doKeyDown(e) {
    keys[e.key] = true;
}

function doKeyUp(e) {
    keys[e.key] = false;
}

function moveCameraWithKeyboard() {
    
    const speed = 0.02;

    // Normal movement
    if (keys["w"]) {
        //console.log("Pressed W");
        camera.moveForward(speed);
    }
    if (keys["s"]) {
        //console.log("Pressed S");
        camera.moveForward(-speed);
    }
    if (keys["a"]) {
        //console.log("Pressed A");
        camera.moveRight(-speed);
    }
    if (keys["d"]) {
        //console.log("Pressed D");
        camera.moveRight(speed);
    }

    // Up/Down
    if (keys["q"]) {
        //console.log("Pressed Q");
        camera.moveUp(speed);
    }
    if (keys["e"]) {
        //console.log("Pressed E");
        camera.moveUp(-speed);
    }

    // Rotation
    if (keys["ArrowUp"]) {
        //console.log("Pressed Arrow Up");
        camera.rotateUp(speed*0.5);
    }
    if (keys["ArrowDown"]) {
        //console.log("Pressed Arrow Down");
        camera.rotateUp(-speed*0.5);
    }
    if (keys["ArrowLeft"]) {
        //console.log("Pressed Arrow Left");
        camera.rotateLeft(speed*0.5);
    }
    if (keys["ArrowRight"]) {
        //console.log("Pressed Arrow Right");
        camera.rotateLeft(-speed*0.5);
    }

    // Reset
    if (keys["r"]) {
        //console.log("Pressed R");
        camera.reset();
    }
}


//
// 2D CANVAS FOR ON-SCREEN COMMANDS
//


// Drawing the on-screen commands
function drawCommands() {

    const canvas = document.getElementById('commands-canvas');
    const ctx = canvas.getContext('2d');

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Base configuration for the buttons
    const btnRadius = 25;
    const btnColor = 'black';
    const btnBorderColor = 'white';
    const btnBorderWidth = 3;

    // Define the positions of the buttons on the canvas
    const positions = {
        up: { x: canvas.width / 2, y: btnRadius + 10 },
        left: { x: btnRadius + 10, y: canvas.height / 2 },
        center: { x: canvas.width / 2, y: canvas.height / 2 },
        right: { x: canvas.width - btnRadius - 10, y: canvas.height / 2 },
        down: { x: canvas.width / 2, y: canvas.height - btnRadius - 10 }
    };

    // Draw the 5 buttons
    drawButton(ctx, positions.up.x, positions.up.y, '▲', btnRadius, btnColor, btnBorderColor, btnBorderWidth);
    drawButton(ctx, positions.left.x, positions.left.y, '◀', btnRadius, btnColor, btnBorderColor, btnBorderWidth);
    drawButton(ctx, positions.center.x, positions.center.y, '=', btnRadius, btnColor, btnBorderColor, btnBorderWidth);
    drawButton(ctx, positions.right.x, positions.right.y, '▶', btnRadius, btnColor, btnBorderColor, btnBorderWidth);
    drawButton(ctx, positions.down.x, positions.down.y, '▼', btnRadius, btnColor, btnBorderColor, btnBorderWidth);
}


// Function to draw a single button
function drawButton(ctx, x, y, label, btnRadius, btnColor, btnBorderColor, btnBorderWidth) {
    
    // Draw the button circle
    ctx.beginPath();
    ctx.arc(x, y, btnRadius, 0, 2 * Math.PI, false);    // Draw the circle
    ctx.fillStyle = btnColor;
    ctx.fill();                                         // Fill the inside
    ctx.lineWidth = btnBorderWidth;
    ctx.strokeStyle = btnBorderColor;
    ctx.stroke();                                       // Draw the border

    // Draw the button label
    ctx.fillStyle = btnBorderColor;
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);                          // Draw the text
}


// Function to handle button clicks
function handleButtonClick(x, y) {

    const canvas = document.getElementById('commands-canvas');
    const btnRadius = 25;

     // Define the positions of the buttons on the canvas
    const positions = {
        up: { x: canvas.width / 2, y: btnRadius + 10 },
        left: { x: btnRadius + 10, y: canvas.height / 2 },
        center: { x: canvas.width / 2, y: canvas.height / 2 },
        right: { x: canvas.width - btnRadius - 10, y: canvas.height / 2 },
        down: { x: canvas.width / 2, y: canvas.height - btnRadius - 10 }
    };
    
    // Check which button was clicked and execute the corresponding action
    if (isInsideButton(positions.up, x, y)) {
        camera.moveForward(0.3);
        //console.log('Up button clicked');
    } else if (isInsideButton(positions.left, x, y)) {
        //console.log('Left button clicked');
        camera.moveRight(-0.3);
    } else if (isInsideButton(positions.center, x, y)) {
        camera.reset();
        //console.log('Center button clicked');
    } else if (isInsideButton(positions.right, x, y)) {
        camera.moveRight(0.3);
        //console.log('Right button clicked');
    } else if (isInsideButton(positions.down, x, y)) {
        //console.log('Down button clicked');
        camera.moveForward(-0.3);
    }
}

// Check if a click occurred inside a button
function isInsideButton(button, x, y) {
    const btnRadius = 25;
    const dx = x - button.x;
    const dy = y - button.y;

    return dx * dx + dy * dy <= btnRadius * btnRadius; // Inside the button?
}
