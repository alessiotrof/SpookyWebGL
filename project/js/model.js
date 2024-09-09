//
// Script model.js - creation and management of 3D models
//

class Model {

    constructor(sourceMesh, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
        
        // Path of the mesh
        this.sourceMesh = sourceMesh;

        // Mesh settings
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;

        // Loaded from loadMesh()
        this.positionsLoaded = [];
        this.normalsLoaded = [];
        this.texcoordsLoaded = [];
        this.textureLoaded = null;
        this.numVerticesLoaded = 0;

        // Positions
        this.positionLocation = null;
        this.normalLocation = null;
        this.texcoordLocation = null;

        // Model-specific buffers and texture
        this.positionBuffer = null;
        this.normalBuffer = null;
        this.texcoordBuffer = null;

        // Initialize the model
        this.init();
    }

    // Model initialization function
    init() {
        // Load the mesh from the file and fill the buffers
        loadMesh(this);
        createModelBuffers(this);
    }

}


//
// Functions for model creation/drawing
//

// Model transformation matrix to apply properties of: position, rotation, scale
function createModelTransformationMatrix(model) {
    
    let translationMatrix = m4.translation(model.position[0], model.position[1], model.position[2]); // Moves the model in 3D space
    let rotationXMatrix = m4.xRotation(model.rotation[0]);                                           // Rotation around the X axis
    let rotationYMatrix = m4.yRotation(model.rotation[1]);                                           // Rotation around the Y axis
    let rotationZMatrix = m4.zRotation(model.rotation[2]);                                           // Rotation around the Z axis
    let scaleMatrix = m4.scaling(model.scale[0], model.scale[1], model.scale[2]);                    // Scale the model

    // Multiply matrices in the order: scale, rotation, translation
    let transformationMatrix = m4.multiply(translationMatrix, m4.multiply(rotationZMatrix, m4.multiply(rotationYMatrix, m4.multiply(rotationXMatrix, scaleMatrix))));
    
    return transformationMatrix;
}


// Function to create model buffers
function createModelBuffers(model) {

    // Get attribute locations in shaders
    model.positionLocation = gl.getAttribLocation(program, "a_position");
    model.normalLocation = gl.getAttribLocation(program, "a_normal");
    model.texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    // Create and configure the position buffer
    model.positionBuffer = gl.createBuffer();                                                   // Create buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);                                       // Specify which buffer to operate on
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.positionsLoaded), gl.STATIC_DRAW);    // Fill the buffer with data

    // Create and configure the normal buffer
    model.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normalsLoaded), gl.STATIC_DRAW);

    // Create and configure the texture coordinates buffer
    model.texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texcoordsLoaded), gl.STATIC_DRAW);
}


// Sets material parameters and binds buffers
function drawModel(model) {
    
    // Set material parameters read from loadMesh()
    gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), model.diffuse);
    gl.uniform3fv(gl.getUniformLocation(program, "ambient"), model.ambient);
    gl.uniform3fv(gl.getUniformLocation(program, "specular"), model.specular);
    gl.uniform3fv(gl.getUniformLocation(program, "emissive"), model.emissive);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), model.shininess);
    gl.uniform1f(gl.getUniformLocation(program, "opacity"), model.opacity);

    // Transparency
    if(model.sourceMesh.includes("ghost") && document.getElementById('transparencyCheckbox').checked) {
        gl.uniform1f(gl.getUniformLocation(program, "uAlpha"), 0.35);
    } else {
        gl.uniform1f(gl.getUniformLocation(program, "uAlpha"), 1.0);
    }


    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.positionBuffer);                       // Specify which buffer to work on for subsequent operations
    gl.enableVertexAttribArray(model.positionLocation);                         // The "a_position" attribute in the shader is active and can receive data from the buffer
    gl.vertexAttribPointer(model.positionLocation, 3, gl.FLOAT, false, 0, 0);   // Indicates how to interpret buffer data for the vertex attribute

    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.enableVertexAttribArray(model.normalLocation);
    gl.vertexAttribPointer(model.normalLocation, 3, gl.FLOAT, false, 0, 0);

    // Bind texcoord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, model.texcoordBuffer);
    gl.enableVertexAttribArray(model.texcoordLocation);
    gl.vertexAttribPointer(model.texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Bind texture
    gl.bindTexture(gl.TEXTURE_2D, model.textureLoaded);                         // Set the texture that will be used for all subsequent operations

    // Draw the model
    gl.drawArrays(gl.TRIANGLES, 0, model.numVerticesLoaded);

}



//
// Functions for loading models and collision detection
//


// Function that checks if two models overlap
function checkCollision(newModel, existingModels) {

    // Minimum distance between model centers to avoid collisions
    const threshold = 3.0; 

    for (let model of existingModels) {
        let distX = newModel.position[0] - model.position[0];
        let distZ = newModel.position[2] - model.position[2];
        let distance = Math.sqrt(distX * distX + distZ * distZ); // Pythagorean theorem

        // Collision detected!!!
        if (distance < threshold) {
            return true; 
        }
    }

    return false; // No collision
}

// Function to create copies of models with collision detection
// TO BE MODIFIED TO USE ONLY "numCopies"
function createModelCopies(modelPath, modelList, minCopies, maxCopies) {

    const numCopies = Math.floor(Math.random() * (maxCopies - minCopies + 1)) + minCopies;
    const maxAttempts = 40;
    const placementRange = 26; // In this case, there's a range from 0 to 26

    console.log(modelPath + ": number of copies " + minCopies);

    for (let i = 0; i < numCopies; i++) {
        let attempts = 0;
        let collision;
        let newModel;

        do {
            let posX = Math.random() * placementRange - (placementRange / 2);  // Range between [-13, 13]
            let posY = 0;
            let posZ = Math.random() * placementRange - (placementRange / 2);  // Range between [-13, 13]
            let rotY = Math.random() * 360;                                    // Range [0, 360]
            
            newModel = new Model(
                modelPath,
                [posX, posY, posZ],
                [0, rotY, 0],
                [1.0, 1.0, 1.0]
            );

            // Check if it collides with another model in the list; if not, add it
            collision = checkCollision(newModel, modelList);
            if (!collision) {
                modelList.push(newModel);
                break;
            }

            attempts++;
        } while (collision && attempts < maxAttempts); // Limit attempts to avoid infinite loops

        if (attempts >= maxAttempts && collision) {
            console.error("Unable to place model " + modelPath + " without collisions after " + maxAttempts + " attempts. Its placement will be random!");
            modelList.push(newModel); // Add the model even if there is a collision
        }
    }
}


// Creation of all models
function createModels(minSkeleton, maxSkeleton, minGhost, maxGhost, minTombstone, maxTombstone, minTree, maxTree) {

    let modelList = [];


    // Create the terrain (unique)
    let terrain = new Model(
        'assets/models/terrain/terrain.obj',
        [0, 0, 0],
        [0, 0, 0],
        [1.0, 1.0, 1.0]
    );
    modelList.push(terrain);

    // Create the landscape (unique)
    let landscape = new Model(
        'assets/models/landscape/landscape.obj',
        [0, 0, 0],
        [0, 0, 0],
        [1.0, 1.0, 1.0]
    );
    modelList.push(landscape);
    
    // Generate tombstones with names only if enabled
    if(document.getElementById('peopleTombstonesCheckbox').checked) {
        // My tombstone (unique)
        createModelCopies('assets/models/people_tombstones/my_tombstone.obj', modelList, 1, 1);

        // Giulia's tombstone (unique)
        createModelCopies('assets/models/people_tombstones/giulia_tombstone.obj', modelList, 1, 1);

        // Danilo's tombstone (unique)
        createModelCopies('assets/models/people_tombstones/danilo_tombstone.obj', modelList, 1, 1);
    }


    // Create multiple copies of trees
    const totalTrees = Math.floor(Math.random() * (maxTree - minTree + 1)) + minTree;
    let tree1Count = Math.floor(totalTrees / 2); // Half for the first model
    let tree2Count = totalTrees - tree1Count; // The rest for the second model
    createModelCopies('assets/models/tree1/tree1.obj', modelList, tree1Count, tree1Count);
    createModelCopies('assets/models/tree2/tree2.obj', modelList, tree2Count, tree2Count);

    // Create multiple copies of tombstones
    const totalTombstones = Math.floor(Math.random() * (maxTombstone - minTombstone + 1)) + minTombstone;
    let tombstone1Count = Math.floor(totalTombstones / 2); // Half for the first model
    let tombstone2Count = totalTombstones - tombstone1Count; // The rest for the second model
    createModelCopies('assets/models/tombstone1/tombstone1.obj', modelList, tombstone1Count, tombstone1Count);
    createModelCopies('assets/models/tombstone2/tombstone2.obj', modelList, tombstone2Count, tombstone2Count);

    // Create multiple copies of skeletons
    const totalSkeletons = Math.floor(Math.random() * (maxSkeleton - minSkeleton + 1)) + minSkeleton;
    let skeleton1Count = Math.floor(totalSkeletons / 2); // Half for the first model
    let skeleton2Count = totalSkeletons - skeleton1Count; // The rest for the second model
    createModelCopies('assets/models/skeleton1/skeleton1.obj', modelList, skeleton1Count, skeleton1Count);
    createModelCopies('assets/models/skeleton2/skeleton2.obj', modelList, skeleton2Count, skeleton2Count);
    
    // Create multiple copies of ghosts last
    const totalGhosts = Math.floor(Math.random() * (maxGhost - minGhost + 1)) + minGhost;
    let ghost1Count = Math.floor(totalGhosts / 2); // Half for the first model
    let ghost2Count = totalGhosts - ghost1Count; // The rest for the second model
    createModelCopies('assets/models/ghost1/ghost1.obj', modelList, ghost1Count, ghost1Count);
    createModelCopies('assets/models/ghost2/ghost2.obj', modelList, ghost2Count, ghost2Count);



    return modelList;
}
