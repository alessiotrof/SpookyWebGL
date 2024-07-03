
class Skybox {

    // texturePaths è un oggetto contenente le varie texture da ogni angolazione
    constructor(texturePaths) {

        // Le varie texture con i loro paths
        this.texturePaths = texturePaths;
        this.texture = null;

        // Cubo
        this.positions = new Float32Array( 
            [
              -1, -1, // bottom-left triangle
               1, -1,
              -1,  1,
              -1,  1, // top-right triangle
               1, -1,
               1,  1,
            ]
        );

        // Buffer del modello specifico e texture
        this.positionBuffer = null;


        this.init()
    }

    init() {
        
        createSkyboxBuffers(this);

        // Forse da lasciare qui???
        createSkyboxTexture(this);

    }
}


function createSkyboxBuffers(skybox) {

    // Look up where the vertex data needs to go.
    //skybox.positionLocation = gl.getAttribLocation(skyboxProgram, "a_position");
    //skybox.skyboxLocation = gl.getAttribLocation(skyboxProgram, "u_skybox");
    //skybox.viewDirectionProjectionInverseLocation = gl.getUniformLocation(program, "u_viewDirectionProjectionInverse");


    // Crea e configura il buffer delle posizioni
    skybox.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skybox.positions, gl.STATIC_DRAW);

}


function createSkyboxTexture(skybox) {

    skybox.texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.texture)


    const faceInfos = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: skybox.texturePaths.front },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: skybox.texturePaths.back },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: skybox.texturePaths.up },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: skybox.texturePaths.down },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: skybox.texturePaths.right },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: skybox.texturePaths.left },
    ];

    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;

        // Upload the canvas to the cubemap face.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1024;
        const height = 1024;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;

        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        // Asynchronously load an image
        const image = new Image();
        image.src = url;
        image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skybox.texture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        });
    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

}

function drawSkybox(skybox, view, projection) {

    gl.depthFunc(gl.LEQUAL); // Imposta la funzione di profondità per lo skybox

    const viewMatrix = m4.copy(view);
    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;

    let viewDirectionProjectionMatrix = m4.multiply(projection, viewMatrix);
    let viewDirectionProjectionInverse = m4.inverse(viewDirectionProjectionMatrix);

    gl.useProgram(skyboxProgram); // Usa il programma dello skybox

    // Imposta le uniform dello shader dello skybox
    gl.uniformMatrix4fv(
        gl.getUniformLocation(skyboxProgram, "u_viewDirectionProjectionInverse"),
        false,
        viewDirectionProjectionInverse
    );
    gl.uniform1i(gl.getUniformLocation(skyboxProgram, "u_skybox"), 0);

    // Associa il buffer delle posizioni allo shader
    const positionLocation = gl.getAttribLocation(skyboxProgram, "a_position");
    gl.bindBuffer(gl.ARRAY_BUFFER, skybox.positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Disegna il cubo dello skybox
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

    gl.depthFunc(gl.LESS); // Ripristina la funzione di profondità
}



function initSkybox() {

    // Inizializza l'oggetto skybox
    skybox = new Skybox({
        front: 'assets/models/skybox/front.jpg',
        back: 'assets/models/skybox/back.jpg',
        up: 'assets/models/skybox/up.jpg',
        down: 'assets/models/skybox/down.jpg',
        right: 'assets/models/skybox/right.jpg',
        left: 'assets/models/skybox/left.jpg'
    });

}

