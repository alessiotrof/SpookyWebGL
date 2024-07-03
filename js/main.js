//
// Script main.js
//

var gl, program, skyboxProgram, canvas;

// Per le impostazioni
var camera, modelList = [], fov;

function main() {

    // Inizializzazione WebGL
    initWebGL();
    if (!gl) { // Errore
        alert("Errore: WebGL non è stato correttamente inizializato!");
        console.log("Errore: WebGL non è stato correttamente inizializato!");
        return; 
    }

    // Impostazione degli shaders e skybox
    setupSkyboxProgram();
    setupProgram();
    
    // Inizializza lo Skybox
    initSkybox();

    // Caricamento e configurazione delle mesh
    // createModels(minSkeleton, maxSkeleton, minTombstone, maxTombstone, minTree, maxTree) 
    modelList = createModels(
        parseInt(document.getElementById('minSkeletonNumber').value, 10),
        parseInt(document.getElementById('maxSkeletonNumber').value, 10),
        parseInt(document.getElementById('minTombstoneNumber').value, 10),
        parseInt(document.getElementById('maxTombstoneNumber').value, 10),
        parseInt(document.getElementById('minTreeNumber').value, 10),
        parseInt(document.getElementById('maxTreeNumber').value, 10)
    );

    // Inizializzo la camera
    initCamera();

    // Impostazione delle uniform
    setupLights();

    // Inizializzo i controlli
    initControls();

    // Ciclo di renderizzazione
    requestAnimationFrame(renderLoop);
}


function initWebGL() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext("webgl");

    // Controllo se WebGL è supportata
    if (!gl) {
        alert("WebGL non sembra essere supportata dal tuo browser, provo experimental...");
        gl = canvas.getContext('experimental-webgl'); // Per browser come safari / edge / ie
        if (!gl) {
            alert("Wow, nemmeno experimental sembra essere supportata, ma che stai usando?!");
            throw new Error("WebGL not supported!");
        }
    }
    if (!gl.getExtension("WEBGL_depth_texture")) {
        throw new Error("need WEBGL_depth_texture");
    }

    // Inizializzo i parametri di renderizzazione 
    gl.enable(gl.DEPTH_TEST); // Determina quali oggetti 3D devono essere visualizzati e quali no
    gl.enable(gl.BLEND); // Abilita il blending (colore trasparenza)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Specifica come deve avvenire il blending
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); // Viene utilizzata l'intera area della finestra per il rendering
}



// Per inizializzare lo skybox 
function setupSkyboxProgram() {
    skyboxProgram = webglUtils.createProgramFromScripts(gl, ["skybox-vertex-shader", "skybox-fragment-shader"]);
    //gl.useProgram(skyboxProgram);
   
}


function setupProgram() {
    program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    gl.useProgram(program); 
}


function setupLights() {

    // Luce ambientale molto bassa per una scena notturna
    const ambientLight = [0.05, 0.05, 0.1]; // Blu molto scuro

    // Colore della luce freddo, simula il chiaro di luna
    const colorLight = [0.6, 0.7, 0.9]; // Blu chiaro/grigio

    // Direzione della luce come se provenisse dalla luna
    // Ad esempio, dall'alto verso il basso e da un angolo, simula una luna alta nel cielo
    const lightDirection = m4.normalize([0.5, -1, 0.5]);

    gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight"), ambientLight);
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight"), colorLight);
    gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection"), lightDirection);
}


function createCameraViewMatrix() {

    // Ottiene la matrice di vista dalla camera e la imposta nel programma shader
    const viewMatrix = camera.getViewMatrix();
    const viewMatrixLocation = gl.getUniformLocation(program, "u_view");
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

    // Posizione della camera
    const viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition"); 
    gl.uniform3fv(viewWorldPositionLocation, camera.getPosition());


    return viewMatrix;
}

function createProjectionMatrix(fov) {

    // Calcola la matrice di proiezione prospettica
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zmin = 0.1;
    const fieldOfViewRadians = degToRad(fov);

    // Creazione della ProjectionMatrix
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200); // Var globale
    const projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    return projectionMatrix;
}


function renderLoop() {

    // Inizializzazione parametri
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);


    // Skybox
    const viewMatrix = createCameraViewMatrix();
    const projectionMatrix = createProjectionMatrix(fov);
    drawSkybox(skybox, viewMatrix, projectionMatrix);

    // Attiva il programma principale
    gl.useProgram(program); 
    moveCameraWithKeyboard();

    // Renderizza ogni modello nella scena
    for (const model of modelList) {
        
        // Crea la matrice di trasformazione per il modello corrente
        const modelTransformationMatrix = createModelTransformationMatrix(model);
        const modelTransformationMatrixLocation = gl.getUniformLocation(program, "u_world");
        gl.uniformMatrix4fv(modelTransformationMatrixLocation, false, modelTransformationMatrix);
        
        // Disegno il modello
        drawModel(model);
    }


    // Richiede il prossimo frame
    requestAnimationFrame(renderLoop);

}


// Inizializzo WebGL all'avvio
window.onload = main;


