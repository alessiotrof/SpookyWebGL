//
// load_mesh.js - loading models
//

// Function to load a texture
function loadTexture(path, fileName) {

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]); // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    if (fileName) {

        const image = new Image();

        image.onload = function() {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            if (isPowerOf2(image.width) && isPowerOf2(image.height))
                gl.generateMipmap(gl.TEXTURE_2D); // Yes, it's a power of 2. Generate mips.
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        };
        image.src = path + fileName;
    }
    return texture;

    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
}

// Function that uses the glm_utils library to read an optional
// MTL file associated with the mesh
function readMTLFile(MTLfileName, mesh) {

    return $.ajax({
        type: "GET",
        url: MTLfileName,
        dataType: "text",
        async: false,
        success: parseMTLFile,
        error: handleError,
    });

    function parseMTLFile(result, status, xhr) {
        glmReadMTL(result, mesh);
    }

    function handleError(jqXhr, textStatus, errorMessage) {
        console.error('Error : ' + errorMessage);
    }
}

// Function to retrieve mesh data from an OBJ file
function retrieveDataFromSource(mesh) {

    loadMeshFromOBJ(mesh);

    if (mesh.fileMTL) {
        readMTLFile(mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/") + 1) + mesh.fileMTL, mesh.data);
        mesh.materials = mesh.data.materials;
        delete mesh.data.materials;
    }
}

// Function that uses the glm_utils library to read an OBJ file 
// containing the mesh definition
function loadMeshFromOBJ(mesh) {

    return $.ajax({
        type: "GET",
        url: mesh.sourceMesh,
        dataType: "text",
        async: false,
        success: parseobjFile,
        error: handleError,
    });

    function parseobjFile(result, status, xhr) {
        var result = glmReadOBJ(result, new subd_mesh());
        // uncomment/comment to use or not use LoadSubdivMesh
        // mesh.data = LoadSubdivMesh(result.mesh);
        mesh.data = result.mesh;
        mesh.fileMTL = result.fileMtl;
    }

    function handleError(jqXhr, textStatus, errorMessage) {
        console.error('Error : ' + errorMessage);
    }
}


// Loads a model from the .obj file and materials from the .mtl file
function loadMesh(mesh) {

    retrieveDataFromSource(mesh);
    //Unitize(mesh.data);
    
    // Now that I have the mesh and the associated material(s), I handle loading
    // the texture(s) that these materials contain
    let map = mesh.materials[1].parameter;
    let path = mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/")+1);
    let tex = loadTexture(path, map.get("map_Kd"));
    map.set("map_Kd", tex);

    
    let x=[], y=[], z=[];
    let xt=[], yt=[];
    let i0, i1, i2;
    let nvert = mesh.data.nvert;
    let nface = mesh.data.nface;
    let ntexcoord = mesh.data.textCoords.length;

    // Added
    // Assign the texture to my model
    mesh.textureLoaded = tex;

    for (let i=0; i<nvert; i++){
        x[i]=mesh.data.vert[i+1].x;
        y[i]=mesh.data.vert[i+1].y;
        z[i]=mesh.data.vert[i+1].z;       
    }
    
    for (let i=0; i<ntexcoord-1; i++){
        xt[i]=mesh.data.textCoords[i+1].u;
        yt[i]=mesh.data.textCoords[i+1].v;      
    }
    
    for (let i=1; i<=nface; i++){
        i0=mesh.data.face[i].vert[0]-1;
        i1=mesh.data.face[i].vert[1]-1;
        i2=mesh.data.face[i].vert[2]-1;
        mesh.positionsLoaded.push(x[i0], y[i0], z[i0], x[i1], y[i1], z[i1], x[i2], y[i2], z[i2]); // Added

        i0=mesh.data.facetnorms[i].i;
        i1=mesh.data.facetnorms[i].j;
        i2=mesh.data.facetnorms[i].k;
        mesh.normalsLoaded.push(i0, i1, i2, i0, i1, i2, i0, i1, i2); // Added

        i0=mesh.data.face[i].textCoordsIndex[0]-1;
        i1=mesh.data.face[i].textCoordsIndex[1]-1;
        i2=mesh.data.face[i].textCoordsIndex[2]-1;
        mesh.texcoordsLoaded.push(xt[i0], yt[i0], xt[i1], yt[i1], xt[i2], yt[i2]); // Added
    }  

    // Added
    // Assign the number of faces in the model
    mesh.numVerticesLoaded = 3 * nface;

    if (mesh.fileMTL == null) {
        mesh.ambient = mesh.materials[0].parameter.get("Ka");
        mesh.diffuse = mesh.materials[0].parameter.get("Kd");
        mesh.specular = mesh.materials[0].parameter.get("Ks");
        mesh.emissive = mesh.materials[0].parameter.get("Ke");
        mesh.shininess = mesh.materials[0].parameter.get("Ns");
        mesh.opacity = mesh.materials[0].parameter.get("Ni");
    }
    else {
        mesh.ambient = mesh.materials[1].parameter.get("Ka");
        mesh.diffuse = mesh.materials[1].parameter.get("Kd");
        mesh.specular = mesh.materials[1].parameter.get("Ks");
        mesh.emissive = mesh.materials[1].parameter.get("Ke");
        mesh.shininess = mesh.materials[1].parameter.get("Ns");
        mesh.opacity = mesh.materials[1].parameter.get("Ni");
    }
}
