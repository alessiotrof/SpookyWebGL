//
// Script model.js
//

class Model {

    constructor(sourceMesh, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
        
        // Path della mesh
        this.sourceMesh = sourceMesh;

        // Impostazioni della mesh
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        // Caricate da loadMesh()
        this.positionsLoaded = [];
        this.normalsLoaded= [];
        this.texcoordsLoaded = [];
        this.textureLoaded = null;
        this.numVerticesLoaded = 0;

        // Posizioni
        this.positionLocation = null;
        this.normalLocation = null;
        this.texcoordLocation = null;

        // Buffer del modello specifico e texture
        this.positionBuffer = null;
        this.normalBuffer = null;
        this.texcoordBuffer = null;


        // Inizializza il modello
        this.init();
    }

    // Funzione di inizializzazione del modello
    init() {
        loadMesh(this);
        createModelBuffers(this);
    }

}


//
// Funzioni per la creazione/disegno del modello
//

// Matrice di trasformazione del modello per applicare le proprietà di: posizione, rotazione, scala
function createModelTransformationMatrix(model) {
    
    let translationMatrix = m4.translation(model.position[0], model.position[1], model.position[2]);
    let rotationXMatrix = m4.xRotation(model.rotation[0]);
    let rotationYMatrix = m4.yRotation(model.rotation[1]);
    let rotationZMatrix = m4.zRotation(model.rotation[2]);
    let scaleMatrix = m4.scaling(model.scale[0], model.scale[1], model.scale[2]);

    // Moltiplica le matrici nell'ordine: scala, rotazione, traslazione
    let transformationMatrix = m4.multiply(translationMatrix, m4.multiply(rotationZMatrix, m4.multiply(rotationYMatrix, m4.multiply(rotationXMatrix, scaleMatrix))));
    
    return transformationMatrix;
}


// Funzione per creare i buffer del modello
function createModelBuffers(model) {

    // Look up where the vertex data needs to go.
    model.positionLocation = gl.getAttribLocation(program, "a_position");
    model.normalLocation = gl.getAttribLocation(program, "a_normal");
    model.texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    // Crea e configura il buffer delle posizioni
    model.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.positionsLoaded), gl.STATIC_DRAW);

    // Crea e configura il buffer delle normali
    model.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normalsLoaded), gl.STATIC_DRAW);

    // Crea e configura il buffer delle coordinate di texture
    model.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoordsLoaded), gl.STATIC_DRAW);
}


function drawModel(model) {
    
    // Imposta le uniforms del materiale
    gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), model.diffuse);
    gl.uniform3fv(gl.getUniformLocation(program, "ambient"), model.ambient);
    gl.uniform3fv(gl.getUniformLocation(program, "specular"), model.specular);
    gl.uniform3fv(gl.getUniformLocation(program, "emissive"), model.emissive);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), model.shininess);
    gl.uniform1f(gl.getUniformLocation(program, "opacity"), model.opacity);
    if(model.sourceMesh.includes("ghost") && document.getElementById('transparencyCheckbox').checked) { // Trasparenza
        gl.uniform1f(gl.getUniformLocation(program, "uAlpha"), 0.35);
    } else {
        gl.uniform1f(gl.getUniformLocation(program, "uAlpha"), 1.0);
    }


    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);
    gl.enableVertexAttribArray(model.positionLocation);
    gl.vertexAttribPointer(model.positionLocation, 3, gl.FLOAT, false, 0, 0);

    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.enableVertexAttribArray(model.normalLocation);
    gl.vertexAttribPointer(model.normalLocation, 3, gl.FLOAT, false, 0, 0);

    // Bind texcoord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.texcoordBuffer);
    gl.enableVertexAttribArray(model.texcoordLocation);
    gl.vertexAttribPointer(model.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Bind texture
    gl.bindTexture(gl.TEXTURE_2D, model.textureLoaded);

    // Disegnamo il modello
    gl.drawArrays(gl.TRIANGLES, 0, model.numVerticesLoaded);

}



//
// Funzioni per il caricamento dei modelli
//


// Funzione che verifica se due modelli si sovrappongono
function checkCollision(newModel, existingModels) {

    // Distanza minima tra i centri dei modelli per evitare collisioni
    const threshold = 3.0; 

    for (let model of existingModels) {
        let distX = newModel.position[0] - model.position[0];
        let distZ = newModel.position[2] - model.position[2];
        let distance = Math.sqrt(distX * distX + distZ * distZ);

        if (distance < threshold) {
            return true; // Collisione rilevata
        }
    }

    return false; // Nessuna collisione
}

// Funzione per creare copie dei modelli con controllo delle collisioni
function createModelCopies(modelPath, modelList, minCopies, maxCopies) {

    const numCopies = Math.floor(Math.random() * (maxCopies - minCopies + 1)) + minCopies;
    const maxAttempts = 40;
    const placementRange = 26; // In questo caso c'è un range che va da 0 a 28

    console.log(modelPath + ": numero copie " + minCopies);

    for (let i = 0; i < numCopies; i++) {
        let attempts = 0;
        let collision;
        let newModel;

        do {
            let posX = Math.random() * placementRange - (placementRange / 2);  // Range tra [-13, 13]
            let posY = 0;
            let posZ = Math.random() * placementRange - (placementRange / 2);  // Range tra [-13, 13]
            let rotY = Math.random() * 360;                                    // Range [0, 360]
            
            newModel = new Model(
                modelPath,
                [posX, posY, posZ],
                [0, rotY, 0],
                [1.0, 1.0, 1.0]
            );

            collision = checkCollision(newModel, modelList);
            if (!collision) {
                modelList.push(newModel);
                break;
            }

            attempts++;
        } while (collision && attempts < maxAttempts); // Tentativi limitati per evitare cicli infiniti

        if (attempts >= maxAttempts && collision) {
            console.error("Non è stato possibile posizionare il modello " + modelPath + " senza collisioni dopo " + maxAttempts + " tentativi. Il suo posizionamento sarà casuale!");
            modelList.push(newModel); // Aggiungo il modello anche se c'è collisione
        }
    }
}



function createModels(minSkeleton, maxSkeleton, minGhost, maxGhost, minTombstone, maxTombstone, minTree, maxTree) {

    let modelList = [];

    // Creo il terreno (unico)
    let terrain = new Model(
        'assets/models/terrain/terrain.obj',
        [0, 0, 0],
        [0, 0, 0],
        [1.0, 1.0, 1.0]
    );
    modelList.push(terrain);

    // Creo il landscape (unico)
    let landscape = new Model(
        'assets/models/landscape/landscape.obj',
        [0, 0, 0],
        [0, 0, 0],
        [1.0, 1.0, 1.0]
    );
    modelList.push(landscape);
    
    // La mia tomba (unica)
    createModelCopies('assets/models/people_tombstones/my_tombstone.obj', modelList, 1, 1);

    // Creo più copie degli alberi
    const totalTrees = Math.floor(Math.random() * (maxTree - minTree + 1)) + minTree;
    let tree1Count = Math.floor(totalTrees / 2); // La metà al primo modello
    let tree2Count = totalTrees - tree1Count; // Il resto al secondo modello
    createModelCopies('assets/models/tree1/tree1.obj', modelList, tree1Count, tree1Count);
    createModelCopies('assets/models/tree2/tree2.obj', modelList, tree2Count, tree2Count);

    // Creo più copie dei fantasmi
    const totalGhosts = Math.floor(Math.random() * (maxGhost - minGhost + 1)) + minGhost;
    let ghost1Count = Math.floor(totalGhosts / 2); // La metà al primo modello
    let ghost2Count = totalGhosts - ghost1Count; // Il resto al secondo modello
    createModelCopies('assets/models/ghost1/ghost1.obj', modelList, ghost1Count, ghost1Count);
    createModelCopies('assets/models/ghost2/ghost2.obj', modelList, ghost2Count, ghost2Count);

    // Calcola il numero totale di tombe da creare
    // Distribuisci i scheletri tra i due modelli
    const totalTombstones = Math.floor(Math.random() * (maxTombstone - minTombstone + 1)) + minTombstone;
    let tombstone1Count = Math.floor(totalTombstones / 2); // La metà al primo modello
    let tombstone2Count = totalTombstones - tombstone1Count; // Il resto al secondo modello
    createModelCopies('assets/models/tombstone1/tombstone1.obj', modelList, tombstone1Count, tombstone1Count);
    createModelCopies('assets/models/tombstone2/tombstone2.obj', modelList, tombstone2Count, tombstone2Count);


    // Calcola il numero totale di scheletri da creare
    // Distribuisci i scheletri tra i due modelli
    const totalSkeletons = Math.floor(Math.random() * (maxSkeleton - minSkeleton + 1)) + minSkeleton;
    let skeleton1Count = Math.floor(totalSkeletons / 2); // La metà al primo modello
    let skeleton2Count = totalSkeletons - skeleton1Count; // Il resto al secondo modello
    createModelCopies('assets/models/skeleton1/skeleton1.obj', modelList, skeleton1Count, skeleton1Count);
    createModelCopies('assets/models/skeleton2/skeleton2.obj', modelList, skeleton2Count, skeleton2Count);
    
    return modelList;
}