// Main script: main.js

// Global variables
var gl, program, skyboxProgram, canvas;

// For settings
var camera, modelList = [];

function main() {

    // Draw the commands
    drawCommands();

    // WebGL initialization
    initWebGL();

    // Shader and skybox setup
    setupSkyboxProgram();
    setupProgram();
    
    // Initialize the Skybox
    initSkybox();

    // Load and configure the meshes
    modelList = createModels(
        parseInt(document.getElementById('minSkeletonNumber').value, 10),
        parseInt(document.getElementById('maxSkeletonNumber').value, 10),
        parseInt(document.getElementById('minGhostNumber').value, 10),
        parseInt(document.getElementById('maxGhostNumber').value, 10),
        parseInt(document.getElementById('minTombstoneNumber').value, 10),
        parseInt(document.getElementById('maxTombstoneNumber').value, 10),
        parseInt(document.getElementById('minTreeNumber').value, 10),
        parseInt(document.getElementById('maxTreeNumber').value, 10)
    );

    // Initialize the camera
    initCamera();

    // Initialize controls
    initControls();

    // Rendering loop
    requestAnimationFrame(renderLoop);
}


function initWebGL() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl");

    // Check if WebGL is supported
    if (!gl) {
        alert("WebGL does not appear to be supported by your browser, trying experimental...");
        gl = canvas.getContext('experimental-webgl'); // For browsers like Safari/Edge/IE
        if (!gl) {
            alert("Wow, not even experimental is supported, what are you using?!");
            throw new Error("WebGL not supported!");
        }
    }
    if (!gl.getExtension("WEBGL_depth_texture")) {
        throw new Error("need WEBGL_depth_texture");
    }

    // Initialize rendering parameters
    gl.enable(gl.DEPTH_TEST);                               // To determine which objects are visible
    gl.enable(gl.BLEND);                                    // Enables blending (transparency)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);     // Specifies how blending should occur
}


// To initialize the skybox
function setupSkyboxProgram() {
    skyboxProgram = webglUtils.createProgramFromScripts(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
    //gl.useProgram(skyboxProgram);
}


function setupProgram() {
    program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    gl.useProgram(program);  
}

// To update the fog
function updateFog() {

    // Fog color converted into a 4D array (the last value is alpha)
    let fogColor = [...hexToRgbArray(document.getElementById('fogColorPicker').value), 1.0];
    let fogStart = parseFloat(document.getElementById('fogStart').value);
    let fogEnd = parseFloat(document.getElementById('fogEnd').value);

    // Set in the fragment shader
    gl.uniform4fv(gl.getUniformLocation(program, "u_fogColor"), fogColor);
    gl.uniform2fv(gl.getUniformLocation(program, "u_fogDist"), [fogStart, fogEnd]);

    // Enable/disable fog based on the checkbox status
    const fogEnabled = document.getElementById('fogCheckbox').checked ? 1 : 0;
    gl.uniform1i(gl.getUniformLocation(program, "u_fogEnabled"), fogEnabled); // Set in the fragment shader

}


// To update the lights based on user settings
function updateLights() {
    
    // Ambient light color
    gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight"),  
        hexToRgbArray(document.getElementById('ambientLightColorPicker').value) // Convert from Hex to RGB
    );
    
    // Directional light color
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight"), 
        hexToRgbArray(document.getElementById('directionalLightColorPicker').value) // Convert from Hex to RGB
    );

    // Light direction
    gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection"), 
        m4.normalize(  
            [
                parseFloat(document.getElementById('directionalLightX').value),
                parseFloat(document.getElementById('directionalLightY').value),
                parseFloat(document.getElementById('directionalLightZ').value),
            ]
        )
    );
    
}


// For creating the ViewMatrix - transforms the entire scene to appear as if viewed from the camera
function createCameraViewMatrix() {

    // Get the view matrix from the camera and set it in the shader program
    const viewMatrix = camera.getViewMatrix();
    const viewMatrixLocation = gl.getUniformLocation(program, "u_view");
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

    // Set the camera position
    const viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition"); 
    gl.uniform3fv(viewWorldPositionLocation, camera.getPosition());

    return viewMatrix;
}


// For creating the ProjectionMatrix - used to project the 3D scene viewed onto a 2D plane (Canvas)
function createProjectionMatrix() {

    // Calculate the perspective projection matrix
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zmin = 0.1;
    const fieldOfViewRadians = degToRad(
        parseInt(document.getElementById('cameraFov').value, 10) // Taken from input
    );

    // Create the ProjectionMatrix
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200); // Creates a perspective projection matrix using field of view, aspect ratio, and clipping planes
    const projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    return projectionMatrix;
}


// Rendering loop
function renderLoop() {

    // Resize the canvas
    if (resizeCanvasToDisplaySize(gl.canvas)) {
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // Set the viewport to the entire size of the canvas
	}

    // Initialize parameters
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);    // Clear color and depth buffer
    gl.enable(gl.CULL_FACE);                                // Enable FACE CULLING
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);               // Use the default framebuffer
    gl.clearColor(0, 0, 0, 0);                              // Set the canvas color to black transparent when cleared


    // Update the fog
    updateFog();

    // Update lights in the scene
    updateLights();

    // Create ViewMatrix, ProjectionMatrix
    const viewMatrix = createCameraViewMatrix();
    const projectionMatrix = createProjectionMatrix();

    // Draw the Skybox (use Skybox shaders)
    drawSkybox(skybox, viewMatrix, projectionMatrix);

    // Switch back to normal shaders
    gl.useProgram(program); 

    // Enable camera movement with the keyboard
    moveCameraWithKeyboard();

    // Render each model in the scene
    for (const model of modelList) {
        
        // Create the transformation matrix for the current model (to change its position, rotation, and scale)
        const modelTransformationMatrix = createModelTransformationMatrix(model);
        const modelTransformationMatrixLocation = gl.getUniformLocation(program, "u_world");
        gl.uniformMatrix4fv(modelTransformationMatrixLocation, false, modelTransformationMatrix);
        
        // Draw the model
        drawModel(model);
    }

    // Request the next frame
    requestAnimationFrame(renderLoop);
}


// Initialize WebGL on startup
window.onload = main;
