//
// Funzioni di conversione
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

// Converti il valore hex del color picker in un array RGB normalizzato
function hexToRgbArray(hex) {

    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;

    return [r, g, b]; // Per il colorpicker 
}

function rgbToHex(rgb) {
    return '#' + rgb.map(function(value) {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function resizeCanvasToDisplaySize() {

    // Lookup the size the browser is displaying the canvas in CSS pixels
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size
    const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

    // Make the canvas the same size
    if (needResize) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}

