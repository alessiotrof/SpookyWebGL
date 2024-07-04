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


// Crea più copie di un certo modello
function createModelCopies(modelPath, modelList, minCopies, maxCopies) {

    // Numero di copie del modello
    const numCopies = Math.floor(Math.random() * (maxCopies - minCopies + 1)) + minCopies;

    for (let i = 0; i < numCopies; i++) {
        let posX = Math.random() * 20 - 10; // Distribuzione casuale tra -10 e +10
        let posY = 0;                       // Altezza fissa, assumendo un terreno piatto
        let posZ = Math.random() * 20 - 10; // Distribuzione casuale tra -10 e +10
        let rotY = Math.random() * 360;     // Rotazione casuale da 0 a 360 gradi
        //let scale = Math.random() * (scaleMax - scaleMin) + scaleMin; // Scala variabile tra scaleMin e scaleMax

        let model = new Model(
            modelPath,
            [posX, posY, posZ],
            [0, rotY, 0],
            [1.0, 1.0, 1.0]
        );
        modelList.push(model);
    }


}

function createModels(minSkeleton, maxSkeleton, minTombstone, maxTombstone, minTree, maxTree) {
    let modelList = [];
    
    // Creo più copie delle tombe
    createModelCopies('assets/models/tombstone/tombstone.obj', modelList, minTombstone, maxTombstone);

    // Creo più copie degli alberi
    createModelCopies('assets/models/tree/tree.obj', modelList, minTree, maxTree);

    // Calcola il numero totale di scheletri da creare
    // Distribuisci i scheletri tra i due modelli
    const totalSkeletons = Math.floor(Math.random() * (maxSkeleton - minSkeleton + 1)) + minSkeleton;
    let skeleton1Count, skeleton2Count;
    skeleton1Count = Math.floor(totalSkeletons / 2); // La metà al primo modello
    skeleton2Count = totalSkeletons - skeleton1Count; // Il resto al secondo modello

    // Creo più copie degli scheletri per ciascun modello
    createModelCopies('assets/models/skeleton1/skeleton1.obj', modelList, skeleton1Count, skeleton1Count);
    createModelCopies('assets/models/skeleton2/skeleton2.obj', modelList, skeleton2Count, skeleton2Count);

    return modelList;
}