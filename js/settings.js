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
const checkboxInput = document.getElementById('transparencyCheckbox');



// Quando viene premuto il pulsante "Applica"
function processLandscapeSettings() {

    // Ottengo i valori
    let minSkeletonNumber = parseInt(minSkeletonInput.value, 10);
    let maxSkeletonNumber = parseInt(maxSkeletonInput.value, 10);
    let minGhostNumber = parseInt(minGhostInput.value, 10);
    let maxGhostNumber = parseInt(maxGhostInput.value, 10);
    let minTombstoneNumber = parseInt(minTombstoneInput.value, 10);
    let maxTombstoneNumber = parseInt(maxTombstoneInput.value, 10);
    let minTreeNumber = parseInt(minTreeInput.value, 10);
    let maxTreeNumber = parseInt(maxTreeInput.value, 10);

    
    alert("Impostazioni sulla generazione del paesaggio applicate!");

    // Stampa i valori nella console
    console.log('Numero minimo scheletri:', minSkeletonNumber);
    console.log('Numero massimo scheletri:', maxSkeletonNumber);
    console.log('Numero minimo fantasmi:', minGhostNumber);
    console.log('Numero massimo fantasmi:', maxGhostNumber);
    console.log('Numero minimo tombe:', minTombstoneNumber);
    console.log('Numero massimo tombe:', maxTombstoneNumber);
    console.log('Numero minimo alberi:', minTreeNumber);
    console.log('Numero massimo alberi:', maxTreeNumber);


    // Caricamento e configurazione delle mesh
    modelList = createModels(maxSkeletonNumber, minSkeletonNumber, minGhostNumber, maxGhostNumber, maxTombstoneNumber, minTombstoneNumber, minTreeNumber, maxTreeNumber);
}



function processCheckbox() {
    
    if (checkboxInput.checked) {
      alert('Trasparenza abilitata!');
      console.log('Trasparenza abilitata!');
    } else {
      alert('Trasparenza disabilitata!');
      console.log('Trasparenza abilitata!');
    }
  }
