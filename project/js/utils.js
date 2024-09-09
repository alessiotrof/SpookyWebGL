//
// utils.js - utility functions
//


//
// Conversion functions
//

function degToRad(d) {
    return d * Math.PI / 180;
}


function radToDeg(r) {
    return r * 180 / Math.PI;
}


function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}


// Converts the hex value from the color picker into a normalized RGB array
function hexToRgbArray(hex) {

    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;

    return [r, g, b]; // For the ColorPicker
}


// Function to resize the canvas
function resizeCanvasToDisplaySize(canvas) {
    
    // Get the canvas size as displayed in the browser in CSS pixels
    // Retrieve the width and height of the canvas as it appears in the browser
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas size differs from the displayed size
    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

    // Resize the canvas to match the visible size
    if (needResize) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    // Return true if the canvas was resized, otherwise false
    return needResize;
}
