// Ottieni i valori dei numeri dagli input
const minSkeletonInput = document.getElementById('minSkeletonNumber');
const maxSkeletonInput = document.getElementById('maxSkeletonNumber');
const minTombstoneInput = document.getElementById('minTombstoneNumber');
const maxTombstoneInput = document.getElementById('maxTombstoneNumber');
const minTreeInput = document.getElementById('maxTreeNumber');
const maxTreeInput = document.getElementById('minTreeNumber');
const cameraFovInput = document.getElementById('cameraFov');


// Quando viene premuto il pulsante "Applica"
function processNumbers() {

    // Ottengo i valori
    let minSkeletonNumber = parseInt(minSkeletonInput.value, 10);
    let maxSkeletonNumber = parseInt(maxSkeletonInput.value, 10);
    let minTombstoneNumber = parseInt(minTombstoneInput.value, 10);
    let maxTombstoneNumber = parseInt(maxTombstoneInput.value, 10);
    let minTreeNumber = parseInt(minTreeInput.value, 10);
    let maxTreeNumber = parseInt(maxTreeInput.value, 10);
    let cameraFov = parseInt(cameraFovInput.value, 10);

    // Passa i numeri a una funzione
    handleNumbers(minSkeletonNumber, maxSkeletonNumber, minTombstoneNumber, maxTombstoneNumber, minTreeNumber, maxTreeNumber, cameraFov);
}

function handleNumbers(minSkeletonNumber, maxSkeletonNumber, minTombstoneNumber, maxTombstoneNumber, minTreeNumber, maxTreeNumber, cameraFov) {

    // Stampa i risultati nella console (puoi modificarlo per mostrare i risultati nella pagina)
    alert("Le impostazioni sono state applicate!");

    // Stampa i valori nella console
    console.log('Numero minimo scheletri:', minSkeletonNumber);
    console.log('Numero massimo scheletri:', maxSkeletonNumber);
    console.log('Numero minimo tombe:', minTombstoneNumber);
    console.log('Numero massimo tombe:', maxTombstoneNumber);
    console.log('Numero minimo alberi:', minTreeNumber);
    console.log('Numero massimo alberi:', maxTreeNumber);
    console.log('FOV:', cameraFov);

    
    // Caricamento e configurazione delle mesh
    modelList = createModels(maxSkeletonNumber, minSkeletonNumber, maxTombstoneNumber, minTombstoneNumber, minTreeNumber, maxTreeNumber);
    fov = cameraFov;

}