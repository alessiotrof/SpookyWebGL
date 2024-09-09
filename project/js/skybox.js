//
// skybox.js - skybox definition
//


class Skybox {

    // texturePaths is an object containing the various textures from each angle
    constructor(texturePaths) {

        // The various textures with their paths
        this.texturePaths = texturePaths;
        this.texture = null;

        // Contains 2 triangles that form a square covering the entire screen surface
        this.positions = new Float32Array( 
            [
              -1, -1, // bottom left triangle
               1, -1,
              -1,  1,
              -1,  1, // top right triangle
               1, -1,
               1,  1,
            ]
        );

        // Specific model and texture buffer
        this.positionBuffer = null;

        this.init()
    }

    init() {
        // Initialize buffer and texture
        createSkyboxBuffers(this);
        createSkyboxTexture(this);
    }
}


function createSkyboxBuffers(skybox) {

    // Create and configure the position buffer
    skybox.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skybox.positions, gl.STATIC_DRAW);
}

function createSkyboxTexture(skybox) {

    // Create a new texture and bind it to the CUBE_MAP type
    skybox.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.texture);

    // Define an array of objects representing the six faces of the cube
    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: skybox.texturePaths.front },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: skybox.texturePaths.back },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: skybox.texturePaths.up },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: skybox.texturePaths.down },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: skybox.texturePaths.right },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: skybox.texturePaths.left },
    ];

    // For each face of the cube, configure the texture
    faceInfos.forEach((faceInfo) => {

        // Get target and url
        const { target, url } = faceInfo;

        // Set up the texture with specific dimensions and format, initially empty (null)
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1024;
        const height = 1024;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Define an image and bind it to the texture once loaded
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {

            // Copy the image data into the texture
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);

            // Generate mipmap for the texture
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });

    // Configure texture filtering parameters
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // Applied when a texture needs to be scaled down to fit a smaller surface
}


// Draw the skybox in the scene 
function drawSkybox(skybox, view, projection) {
    
    // Set the depth function to ensure the skybox is drawn behind other objects in the scene
    gl.depthFunc(gl.LEQUAL); 

    // Modify the viewMatrix and reset translations on the X, Y, Z axes to keep the skybox centered around the camera
    const viewMatrix = m4.copy(view);
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    // Combine the modified view matrix with the projection matrix
    // And compute the inverse of the combined matrix for use in the shader
    // This helps determine which part of the cubemap texture should be displayed for each skybox pixel
    let viewDirectionProjectionMatrix = m4.multiply(projection, viewMatrix);
    let viewDirectionProjectionInverse = m4.inverse(viewDirectionProjectionMatrix);

    // Activate the specific shader program for rendering the skybox
    gl.useProgram(skyboxProgram);

    // Set it in the fragment shader
    gl.uniformMatrix4fv(
        gl.getUniformLocation(skyboxProgram, "u_viewDirectionProjectionInverse"),
        false,
        viewDirectionProjectionInverse
    );

    // Bind the cubemap texture to the skybox
    gl.uniform1i(gl.getUniformLocation(skyboxProgram, "u_skybox"), 0); 

    // Prepare the buffer containing the skybox vertex positions
    const positionLocation = gl.getAttribLocation(skyboxProgram, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.positionBuffer);
    gl.enableVertexAttribArray(positionLocation); // Tell WebGL to use the "a_position" attribute in the shader
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Draw the skybox cube using the vertex data
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

    // Restore the default depth function for subsequent rendering operations
    gl.depthFunc(gl.LESS); 
}


function initSkybox() {

    // Initialize the skybox object
    skybox = new Skybox({
        front: 'assets/models/skybox/front.jpg',
        back: 'assets/models/skybox/back.jpg',
        up: 'assets/models/skybox/up.jpg',
        down: 'assets/models/skybox/down.jpg',
        right: 'assets/models/skybox/right.jpg',
        left: 'assets/models/skybox/left.jpg'
    });
}
