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

