// Valori di default
const maxModelNumber = 15; // Limite massimo = 15
const maxCameraFov = 120; // Limite massimo fov

const minSkeletonNumberDefault = 5;
const maxSkeletonNumberDefault = 10;
const minTombstoneNumberDefault = 10;
const maxTombstoneNumberDefault = 15;
const minTreeNumberDefault = 5;
const maxTreeNumberDefault = 10;
const cameraFovDefault = 60;

// Ottieni i valori dei numeri dagli input
const maxSkeletonInput = document.getElementById('maxSkeletonNumber');
const minSkeletonInput = document.getElementById('minSkeletonNumber');
const maxTombstoneInput = document.getElementById('maxTombstoneNumber');
const minTombstoneInput = document.getElementById('minTombstoneNumber');
const maxTreeInput = document.getElementById('minTreeNumber');
const minTreeInput = document.getElementById('maxTreeNumber');
const cameraFovInput = document.getElementById('cameraFov');

// Aggancio gli eventi
maxSkeletonInput.addEventListener('keypress', validateNumberInput);
minSkeletonInput.addEventListener('keypress', validateNumberInput);
maxTombstoneInput.addEventListener('keypress', validateNumberInput);
minTombstoneInput .addEventListener('keypress', validateNumberInput);
maxTreeInput.addEventListener('keypress', validateNumberInput);
minTreeInput .addEventListener('keypress', validateNumberInput);
cameraFovInput.addEventListener('keypress', validateNumberInput);


function reset() {
    maxSkeletonInput.value = maxSkeletonNumberDefault;
    minSkeletonInput.value = minSkeletonNumberDefault;
    maxTombstoneInput.value = maxTombstoneNumberDefault;
    minTombstoneInput.value = minTombstoneNumberDefault;
    maxTreeInput.value = maxTreeNumberDefault;
    minTreeInput.value = minTreeNumberDefault;
    cameraFovInput.value = cameraFovDefault;
}


function validateNumberInput(event) {

    // Previene l'inserimento se il carattere non è un numero
    if (event.key < '0' || event.key > '9') {
        event.preventDefault();
    }
}

// Quando viene premuto il pulsante "Applica"
function processNumbers() {

    // Converti i valori in numeri interi
    
    let minSkeletonNumber = parseInt(minSkeletonInput.value, 10);
    let maxSkeletonNumber = parseInt(maxSkeletonInput.value, 10);
    
    let minTombstoneNumber = parseInt(minTombstoneInput.value, 10);
    let maxTombstoneNumber = parseInt(maxTombstoneInput.value, 10);
    
    let minTreeNumber = parseInt(minTreeInput.value, 10);
    let maxTreeNumber = parseInt(maxTreeInput.value, 10);

    let cameraFov = parseInt(cameraFovInput.value, 10);

    // Verifica se i valori sono numeri validi
    if (isNaN(maxSkeletonNumber) || isNaN(minSkeletonNumber) || 
        isNaN(maxTombstoneNumber) || isNaN(minTombstoneNumber) || 
        isNaN(maxTreeNumber) || isNaN(minTreeNumber) || 
        isNaN(cameraFov)) {

        alert('Attenzione: i numeri inseriti non sono validi.');
        return;
    }

    // Controlla se i valori sono troppo elevati e resettali se necessario
    if (minSkeletonNumber > maxModelNumber || maxSkeletonNumber > maxModelNumber ||
        minTombstoneNumber > maxModelNumber || maxTombstoneNumber > maxModelNumber ||
        minTreeNumber > maxModelNumber || maxTreeNumber > maxModelNumber) {
        
        reset();

        alert('Attenzione: i valori del numero di modelli nella scena sono stati resettati per non ridurre le performance.');
        return;
    }

    if(cameraFov > maxCameraFov) {

        reset();

        alert('Attenzione: il valore della camera è stato resettato per evitare problemi di visualizzazione.');
        return;
    }


    // Passa i numeri a una funzione
    handleNumbers(maxSkeletonNumber, minSkeletonNumber, maxTombstoneNumber, minTombstoneNumber, minTreeNumber, maxTreeNumber, cameraFov);
}

function handleNumbers(maxSkeletonNumber, minSkeletonNumber, maxTombstoneNumber, minTombstoneNumber, minTreeNumber, maxTreeNumber, cameraFov) {

    // Stampa i risultati nella console (puoi modificarlo per mostrare i risultati nella pagina)
    alert("Impostazioni applicate correttamente! " + maxTreeNumber + " " + minTreeNumber);

    
    // Caricamento e configurazione delle mesh
    modelList = createModels(maxSkeletonNumber, minSkeletonNumber, maxTombstoneNumber, minTombstoneNumber, minTreeNumber, maxTreeNumber);
    fov = cameraFov;

}