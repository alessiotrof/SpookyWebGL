// Script camera.js - first-person camera

class Camera {

    // position: array of 3 elements for camera position (x, y, z)
    // lookAt: array of 3 elements indicating the point the camera is initially pointed at
    // up: An array of 3 elements defining the upward direction of the camera
    constructor(position = [0, 0, 0], lookAt = [0, 0, -1], up = [0, 1, 0]) {

        this.position = position;                                           
        this.forward = m4.normalize(m4.subtractVectors(lookAt, position));  
        this.right = m4.normalize(m4.cross(this.forward, up));              
        this.up = m4.normalize(m4.cross(this.right, this.forward));        
    }

    //
    // Camera rotation functions
    //

    rotateUp(angle) {

        // Rotation axis: right (pivot for nodding motion)
        const rotation = m4.axisRotation(this.right, angle);

        // Modify camera's forward direction and upward direction
        this.forward = m4.transformPoint(rotation, this.forward);
        this.up = m4.transformPoint(rotation, this.up);

        // Normalize
        this.forward = m4.normalize(this.forward);
        this.up = m4.normalize(this.up);
    }

    rotateLeft(angle) {

        // Rotation axis: up (pivot for shaking head in disapproval)
        const rotation = m4.axisRotation(this.up, angle);
        
        // Modify camera's forward direction and right direction
        this.forward = m4.transformPoint(rotation, this.forward);
        this.right = m4.transformPoint(rotation, this.right);

        // Normalize
        this.forward = m4.normalize(this.forward);
        this.right = m4.normalize(this.right);
    }


    //
    // Movement functions
    //

    // Move FORWARD/BACKWARD using the distance 
    moveForward(distance) {
        this.position[0] += this.forward[0] * distance;
        this.position[1] += this.forward[1] * distance;
        this.position[2] += this.forward[2] * distance;
    }

    // Move RIGHT/LEFT using the distance
    moveRight(distance) {
        this.position[0] += this.right[0] * distance;
        this.position[1] += this.right[1] * distance;
        this.position[2] += this.right[2] * distance;
    }

    // Move UP/DOWN using the distance
    moveUp(distance) {
        this.position[0] += this.up[0] * distance;
        this.position[1] += this.up[1] * distance;
        this.position[2] += this.up[2] * distance;
    }


    //
    // Auxiliary functions
    // 

    // To reset the camera's position
    reset() {
        //this.position = [0, 1, 0]; // Don't reset the position, only the tilt
        this.forward = [0, 0, -1];
        this.right = m4.normalize(m4.cross(this.forward, this.up));
        this.up = [0, 1, 0];
    }

    // To get the view matrix
    getViewMatrix() {
        const look = m4.addVectors(this.position, this.forward);        // Get the point where the camera is currently pointed
        const cameraMatrix = m4.lookAt(this.position, look, this.up);   // Create the view matrix
        return m4.inverse(cameraMatrix);                                // Return the inverse because we don't move the camera, but transform the world around it in the opposite direction to the camera's position and orientation
    }

    // To get the camera's current position
    getPosition() {
        return this.position
    }
}



// Function to initialize the camera (used in main)
function initCamera() {

    // X, Y, Z
    let position = [3, 1, 0];   // Indicates the camera's position in the scene
    let up = [0, 1, 0];         // Indicates that up is along the positive Y-axis
    let lookAt = [0, 0, 0];     // Indicates the point the camera is directed at

    // Initialize the camera
    camera = new Camera(position, lookAt, up);
}
