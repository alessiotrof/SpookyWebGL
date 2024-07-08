//
// Script per una telecamera in prima persona
//

class Camera {

    // position: array di 3 elementi posizione camera (x, y, z)
    // lookAt: array di 3 elementi che indica il punto verso cui la telecamera è puntata
    // up: Un array di  3 elementi che definisce la direzione verso l'alto della telecamera
    constructor(position = [0, 0, 0], lookAt = [0, 0, -1], up = [0, 1, 0]) {

        this.position = position; // Posizione
        this.forward = m4.normalize(m4.subtractVectors(lookAt, position)); // Direzione in cui guarda la camera
        this.right = m4.normalize(m4.cross(this.forward, up)); // Direzione verso destra della camera
        this.up = m4.normalize(m4.cross(this.right, this.forward)); // Direzione verso l'alto della camera
    }

    //
    // Funzioni di rotazione della camera
    //

    rotateUp(angle) {

        // Asse di rotazione right (perno dove muovo la testa)
        const rotation = m4.axisRotation(this.right, angle);

        // Modifico dove guarda la camera (forward) e la direzione verso l'alto (up) della camera
        this.forward = m4.transformPoint(rotation, this.forward);
        this.up = m4.transformPoint(rotation, this.up);

        // Normalizzo
        this.forward = m4.normalize(this.forward);
        this.up = m4.normalize(this.up);
    }

    rotateLeft(angle) {

        // Asse di rotazione right (perno dove muovo la testa)
        const rotation = m4.axisRotation(this.up, angle);
        
        // Modifico dove guarda la camera (forward) e la direzione verso destra (right) della camera
        this.forward = m4.transformPoint(rotation, this.forward);
        this.right = m4.transformPoint(rotation, this.right);

        // Normalizzo
        this.forward = m4.normalize(this.forward);
        this.right = m4.normalize(this.right);
    }


    //
    // Funzioni di movimento
    //

    // Muove in AVANTI/INDIETRO usando la distanza 
    moveForward(distance) {
        this.position[0] += this.forward[0] * distance;
        this.position[1] += this.forward[1] * distance;
        this.position[2] += this.forward[2] * distance;
    }

    // Muove a DX/SX usado la distanza
    moveRight(distance) {
        this.position[0] += this.right[0] * distance;
        this.position[1] += this.right[1] * distance;
        this.position[2] += this.right[2] * distance;
    }

    // Muove verso l'ALTO/BASSO usando la distanza
    moveUp(distance) {
        this.position[0] += this.up[0] * distance;
        this.position[1] += this.up[1] * distance;
        this.position[2] += this.up[2] * distance;
    }


    //
    // Funzioni ausiliarie
    // 

    // Per resettare la posizione della camera
    reset() {
        this.position = [0, 0, 0];
        this.forward = [0, 0, -1];
        this.right = m4.normalize(m4.cross(this.forward, this.up));
        this.up = [0, 1, 0];
    }

    // Per ottenere la matrice di vista
    getViewMatrix() {
        const look = m4.addVectors(this.position, this.forward);
        const cameraMatrix = m4.lookAt(this.position, look, this.up);
        return m4.inverse(cameraMatrix); // ViewMatrix
    };

    // Per ottenere la posizione attuale della camera
    getPosition() {
        return this.position
    }


}



// Funzione per inizializzare la camera (usata nel main)
function initCamera() {

    // X, Y, Z
    let position = [3, 1, 0];
    let up = [0, 1, 0];
    let lookAt = [0, 0, 0];

    fov = parseInt(document.getElementById('cameraFov').value, 10);

    // Inizializzazione della camera
    camera = new Camera(position, lookAt, up);

    //return camera;
}
