function nvr() {
    this.x = 0;
    this.y = 0;
    this.z = 0; // x, y and z are read
    this.n_neigh = 0; // number of vertices in the first ring
    this.neigh = new Int32Array(MAXVAL);
    this.edge = new Int32Array(MAXVAL);
    this.face = new Int32Array(MAXVAL);
    this.val = 0; // vertex valence
    this.bound = null; // flag if it is on the boundary
    this.vind = 0; // if the vertex is extraordinary, it's the index in the extraordinary vertices list
};

function ndg() {
    this.neigh = new Int32Array(2);
    this.vert = new Int32Array(2);
    this.val = 0; // indicates the edge valence; whether it is on the boundary or not
};

function nfc() {
    this.n_v_e = 0; // number of vertices or edges; read
    this.neigh = new Int32Array(MAXVAL);
    this.edge = new Int32Array(MAXVAL);
    this.vert = new Int32Array(MAXVAL); // vertices; read
    this.val = 0; // face valence; number of faces in the first ring
    this.bound = null; // flag if it is on the boundary
    this.find = null; // if the face is not quadrilateral, it is equal to the number of extraordinary vertices in the original mesh + 
    // index of the face in the list of non-quadrilateral faces
    this.textCoordsIndex = new Array(); // texture indices associated with the face vertices
    this.normalVertexIndex = new Array(); // normal indices associated with the face vertices
    this.normalFaceIndex = 0; // index of the normal associated with the face
    this.group = 0; // group index
    this.material = 0; // material index
};

function subd_mesh() {
    this.nvert = 0; /* num. of vertices */
    this.nedge = 0; /* num. of edges */
    this.nface = 0; /* num. of faces */
    this.vert = new Array(); /* mesh vertices [1..nvert] */
    this.edge = new Array(); /* mesh edges [1..nedge] */
    this.face = new Array(); /* mesh faces [1..nface] */
    this.textCoords = new Array();
    this.normal = new Array();
    this.facetnorms = new Array();
    this.groups = new Array();
    this.materials = new Array();
};

function Grid_data() { // mesh (grid) models
    this.npolygons; // number of polygons
    this.firstv; // for each polygon, index of the first vertex in the node array
    // the number of vertices per polygon is determined by firstv[i+1] - firstv[i];
    // the length of firstv is npolygons + 1.
    // firstv[0] = 0
    // firstv[npolygons] = length of the node_index array.
    // node_index[firstv[i]] .. node_index[firstv[i+1]-1] are the nodes of polygon i
    // i is in the range [0 .. npolygons-1]
    this.node_index = []; // for each vertex, index in the node array

    this.nnodes; // number of nodes

    this.nodes = [new Float64Array(3)];
};

function work_area() {
    this.n = 0;
    this.vedge = [];
    this.epos = [];
    this.f1pos = [];
    this.f2pos = [];
};

// set of functions to manage a mesh after it has been loaded
// with glmReadOBJ

var mesh = new subd_mesh();

function swap_int(a, b) {
    return [b, a];
}

// searches for a given face index in the vert_face structure
function find_in_vert_face(vert, ind_vert, ind_face) {
    var k, nval;
    if (vert[ind_vert].bound)
        nval = vert[ind_vert].val - 1;
    else
        nval = vert[ind_vert].val;
    for (k = 0; k < nval; k++)
        if (vert[ind_vert].face[k] == ind_face)
            break;
    return (k);
}

// searches for a given vertex index in the face structure
function find_in_face(face, ind_face, ind_vert) {
    var k;
    for (k = 0; k < face[ind_face].n_v_e; k++)
        if (face[ind_face].vert[k] == ind_vert)
            break;
    return (k);
}

function convert_obj2grid_data(model, gc_grid) {
    var i, j;
    var nvf;
    var grid;

    grid = new Grid_data();
    if (!grid) console.log("No memory");
    grid.nnodes = model.numvertices;
    grid.npolygons = model.numtriangles;

    for (var h = 0; h < grid.nnodes * 3; h++)
        grid.nodes.push(new Array(3));
    if (!grid.nodes) console.log("No memory");

    grid.firstv = new Int32Array(grid.npolygons + 1);
    if (!grid.firstv) console.log("No memory");
    nvf = 0;
    console.log("Number of edges per face; Number of faces", model.numtriangles);
    for (i = 0; i < model.numtriangles; i++)
        nvf += model.triangles[i].nv;
    console.log("Number of edges per face; ", nvf);
    grid.firstv[grid.npolygons] = nvf;

    grid.node_index = new Int32Array(nvf);
    if (!grid.node_index) console.log("No memory");

    for (i = 1; i <= model.numvertices; i++) {
        grid.nodes[i - 1][0] = model.vertices[3 * i + 0];
        grid.nodes[i - 1][1] = model.vertices[3 * i + 1];
        grid.nodes[i - 1][2] = model.vertices[3 * i + 2];
    }

    nvf = 0;
    grid.firstv[0] = 0;
    for (j = 0; j < model.triangles[0].nv; j++) {
        grid.node_index[nvf] = model.triangles[0].vindices[j] - 1;
        nvf++;
    }

    for (i = 1; i < model.numtriangles; i++) {
        grid.firstv[i] = grid.firstv[i - 1] + model.triangles[i - 1].nv;
        for (j = 0; j < model.triangles[i].nv; j++) {
            grid.node_index[nvf] = model.triangles[i].vindices[j] - 1;
            nvf++;
        }
    }

    gc_grid = grid;

    return gc_grid;
}

function convert_grid_data2mesh(grid, mesh) {

    if (mesh) {
        mesh = null;
    }
    mesh = new subd_mesh();
    if (!mesh) console.log("No memory");
    mesh.nvert = grid.nnodes;
    mesh.nface = grid.npolygons;

    mesh.vert = new Array(mesh.nvert + 1);

    for (var h = 0; h < mesh.nvert + 1; h++)
        mesh.vert[h] = new nvr();

    mesh.face = new Array(mesh.nface + 2);
    for (var h = 0; h < mesh.nface + 2; h++)
        mesh.face[h] = new nfc();

    // vertices need to be loaded in any case
    for (i = 1; i <= mesh.nvert; i++) {
        mesh.vert[i].x = grid.nodes[i - 1][0];
        mesh.vert[i].y = grid.nodes[i - 1][1];
        mesh.vert[i].z = grid.nodes[i - 1][2];
    }

    // if new grid, recalculate the subd_mesh
    jjj = 0;
    for (i = 1; i <= mesh.nface; i++) {
        mesh.face[i].n_v_e = grid.firstv[i] - grid.firstv[i - 1];

        for (j = 0; j < mesh.face[i].n_v_e; j++) {
            mesh.face[i].vert[j] = grid.node_index[jjj] + 1;
            jjj++;
        }
    }

    return mesh;
}

// takes the subd_mesh "mesh" with vertices and faces
// and fills all the fields required for the subd_mesh structure
function LoadSubdivMesh(mesh) {
    var nvert, nedge, nface, nval;
    var vert;
    var edge = [];
    var face;

    var buf = [];
    var count_fe;
    var coppie = new Int32Array(2 * MAXVAL),
        ic, il;
    var i, j, k, l, ii, jj, kk, ij, i_st, i_en, ijc;

    nvert = mesh.nvert;
    nface = mesh.nface;
    vert = mesh.vert;
    face = mesh.face;

    // Allocate a working structure that I will fill and use
    // then I can easily fill the EV, EF, VE structures
    for (var h = 0; h < mesh.nvert + 1; h++)
        vert[h] = new nvr();

    for (var h = 0; h < mesh.nface + 2; h++)
        face[h] = new nfc();

    // Allocate all fields of the mesh
    // Number of edges
    count_fe = 0;
    for (i = 1; i <= nface; i++)
        count_fe += face[i].n_v_e;

    // Number of edges
    edge = new Array(count_fe + 1);

    for (i = 0; i <= nvert; i++)
        vert[i].n_neigh = 0;

    for (i = 1; i <= nface; i++) {
        for (j = 0; j < face[i].n_v_e; j++) {
            if (j == face[i].n_v_e - 1)
                ii = face[i].vert[0];
            else
                ii = face[i].vert[j + 1];

            if (ii > face[i].vert[j]) {
                ic = face[i].vert[j];
                il = ii;
            } else {
                ic = ii;
                il = face[i].vert[j];
            }

            k = find_in_vert_face(vert, ic - 1, i);
            if (k == vert[ic - 1].val) {
                vert[ic - 1].face[k] = i;
                vert[ic - 1].n_neigh++;
            }
            vert[ic - 1].neigh[k] = il;

            k = find_in_vert_face(vert, il - 1, i);
            if (k == vert[il - 1].val) {
                vert[il - 1].face[k] = i;
                vert[il - 1].n_neigh++;
            }
            vert[il - 1].neigh[k] = ic;

            // Add edge
            edge[count_fe++] = new ndg();
            edge[count_fe - 1].vert[0] = ic;
            edge[count_fe - 1].vert[1] = il;
        }
    }

    mesh.nedge = count_fe;
    mesh.edge = edge;

    // Add faces
    for (i = 1; i <= nface; i++) {
        for (j = 0; j < face[i].n_v_e; j++) {
            if (j == face[i].n_v_e - 1)
                ii = face[i].vert[0];
            else
                ii = face[i].vert[j + 1];

            if (ii > face[i].vert[j]) {
                ic = face[i].vert[j];
                il = ii;
            } else {
                ic = ii;
                il = face[i].vert[j];
            }

            for (j = 0; j < nface; j++) {
                if (face[j].n_v_e == 2) {
                    if (face[j].vert[0] == ic && face[j].vert[1] == il ||
                        face[j].vert[0] == il && face[j].vert[1] == ic) {
                        vert[ic - 1].edge[j] = edge[count_fe].edge[j];
                        vert[il - 1].edge[j] = edge[count_fe].edge[j];
                    }
                }
            }
        }
    }

    return mesh;
}
