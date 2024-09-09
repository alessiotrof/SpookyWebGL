//
// Settings.js
//


// Settings
const minSkeletonInput = document.getElementById('minSkeletonNumber');
const maxSkeletonInput = document.getElementById('maxSkeletonNumber');
const minGhostInput = document.getElementById('minGhostNumber');
const maxGhostInput = document.getElementById('maxGhostNumber');
const minTombstoneInput = document.getElementById('minTombstoneNumber');
const maxTombstoneInput = document.getElementById('maxTombstoneNumber');
const minTreeInput = document.getElementById('maxTreeNumber');
const maxTreeInput = document.getElementById('minTreeNumber');




// When the "Apply" button is pressed
function processLandscapeSettings() {

    // Get the values
    let minSkeletonNumber = parseInt(minSkeletonInput.value, 10);
    let maxSkeletonNumber = parseInt(maxSkeletonInput.value, 10);
    let minGhostNumber = parseInt(minGhostInput.value, 10);
    let maxGhostNumber = parseInt(maxGhostInput.value, 10);
    let minTombstoneNumber = parseInt(minTombstoneInput.value, 10);
    let maxTombstoneNumber = parseInt(maxTombstoneInput.value, 10);
    let minTreeNumber = parseInt(minTreeInput.value, 10);
    let maxTreeNumber = parseInt(maxTreeInput.value, 10);

    
    alert("Landscape generation settings applied! Please wait...");

    // Print values in the console
    console.log('Minimum number of skeletons:', minSkeletonNumber);
    console.log('Maximum number of skeletons:', maxSkeletonNumber);
    console.log('Minimum number of ghosts:', minGhostNumber);
    console.log('Maximum number of ghosts:', maxGhostNumber);
    console.log('Minimum number of tombstones:', minTombstoneNumber);
    console.log('Maximum number of tombstones:', maxTombstoneNumber);
    console.log('Minimum number of trees:', minTreeNumber);
    console.log('Maximum number of trees:', maxTreeNumber);


    // Loading and configuration of meshes
    modelList = createModels(maxSkeletonNumber, minSkeletonNumber, minGhostNumber, maxGhostNumber, maxTombstoneNumber, minTombstoneNumber, minTreeNumber, maxTreeNumber);
}
