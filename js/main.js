//
// Script main.js
//

// Variabili globali
var gl, program, skyboxProgram, canvas;

// Per le impostazioni
var camera, modelList = [];

// Da cambiare
var fogColor = [1.0, 1.0, 1.0, 1.0];
var fogStart = 5.0;
var fogEnd = 50.0;


function main() {

    // Inizializzazione WebGL
    initWebGL();
    if (!gl) { // Errore
        alert("Errore: WebGL non è stato correttamente inizializato!");
        console.error("Errore: WebGL non è stato correttamente inizializato!");
        return; 
    }

    // Impostazione degli shaders e skybox
    setupSkyboxProgram();
    setupProgram();
    
    // Inizializza lo Skybox
    initSkybox();

    // Caricamento e configurazione delle mesh
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

    // Inizializzo la camera
    initCamera();

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

// Per aggiornare la nebbia
function updateFog() {

    // Colore della nebbia trasformato in array a 4 dimensioni (l'ultimo è l'alpha)
    let fogColor = [...hexToRgbArray(document.getElementById('fogColorPicker').value), 1.0];
    let fogStart = parseFloat(document.getElementById('fogStart').value);
    let fogEnd = parseFloat(document.getElementById('fogEnd').value);

    // Imposto nel fragment shader
    gl.uniform4fv(gl.getUniformLocation(program, "u_fogColor"), fogColor);
    gl.uniform2fv(gl.getUniformLocation(program, "u_fogDist"), [fogStart, fogEnd]);

    // Attiva/disattiva la nebbia in base allo stato della checkbox
    const fogEnabled = document.getElementById('fogCheckbox').checked ? 1 : 0;
    gl.uniform1i(gl.getUniformLocation(program, "u_fogEnabled"), fogEnabled); // Imposto nel fragment shader

}


// Per aggiornare le luci in base alle impostazioni dell'utente
function updateLights() {
    
    // Colore luce ambientale
    gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight"),  
        hexToRgbArray(document.getElementById('ambientLightColorPicker').value) // Converto da Hex a RGB
    );

    // Colore luce direzionale
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight"), 
        hexToRgbArray(document.getElementById('directionalLightColorPicker').value) // Converto da Hex a RGB
    );

    // Direzione luce
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


// Per la creazione della ViewMatrix
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


// Per la creazione della ProjectionMatrix
function createProjectionMatrix() {

    // Calcola la matrice di proiezione prospettica
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zmin = 0.1;
    const fieldOfViewRadians = degToRad(
        parseInt(document.getElementById('cameraFov').value, 10) // Presa da input
    ); 

    // Creazione della ProjectionMatrix
    const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200); // Var globale
    const projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    
    return projectionMatrix;
}


// Ciclo di rendering
function renderLoop() {

    // Faccio un resize del canvas
    if (resizeCanvasToDisplaySize(gl.canvas)) {
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}

    // Inizializzazione parametri
    gl.clearColor(...fogColor); // Aggiunto per la nebbia
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.CULL_FACE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);


    // Per aggiornare la nebbia
    updateFog();

    // Per aggiornare le luci nella scena
    updateLights();

    // Skybox
    const viewMatrix = createCameraViewMatrix();
    const projectionMatrix = createProjectionMatrix();
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
