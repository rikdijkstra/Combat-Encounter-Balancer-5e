(() => { 
    Hooks.once('init', async function() {
        console.log("CEB5e | Init");

    });

    Hooks.once('ready', async function() {
        $(document).on('click', '#sidebar-tabs a.item', function() {
            // Check if the actors tab is activated
            if ($(this).data('tab') === 'actors') {
                // Wait a short time to ensure the actors content is loaded
                setTimeout(() => {
                    const actorsHeader = $('#actors .directory-header .header-actions.action-buttons.flexrow');
                    if (actorsHeader.length > 0 && !actorsHeader.find('.custom-action').length) {
                        // Create the button if it doesn't already exist
                        const customButton = $('<button class="custom-action"><i class="fas fa-magic"></i> Balance Encounter</button>');
                        customButton.on('click', function() {
                            // Custom button action
                            console.log('CEB5e | Balance Encounter Triggered');
                            openCustomDialog();
                        });
                        actorsHeader.append(customButton);
                    }
                }, 100); // Adjust timeout as necessary
            }
        });    
    });
})();

// Retrieve all actors that are in the specified folder
function loadActorsFromFolder(folderId) {
    // This will filter the actors collection to find those with the folder ID matching 'folderId'
    const actorsInFolder = game.actors.filter(actor => actor.data.folder === folderId);
    return actorsInFolder;
}

// Balance folders
function balance(selectedEnemyFolderName, selectedEnemyFolderID, selectedAllyFolderName, selectedAllyFolderID){
    let enemies = loadActorsFromFolder(selectedEnemyFolderID);
    let allies = loadActorsFromFolder(selectedAllyFolderID);
    console.log("CED5e| Balancing started");
}

async function openCustomDialog() {
    // Assuming you have a Dialog subclass or a similar setup
    // Render the template HTML in a dialog
    // Assuming you're within an async function
    console.log("CEB5e | openCustomDialog() called")

    // Attempt to locate the directory list within the specified actors section
    const directoryList = document.querySelector("#ui-right #sidebar #actors .directory-list");
    let folders = {}; // Use an object to map folder names to their IDs
    if (directoryList) {
        console.log("CEB5e | Directory list found.");

         // Select only the direct children 'li' elements of the directory list that are top-level folders
        directoryList.querySelectorAll('li[data-folder-depth="1"]').forEach(folder => {
            // Extract the folder name. Assuming the folder name is within a <h3> tag or similar
            const folderName = folder.querySelector('header.folder-header h3').textContent.trim();

            // Directly extract the folder ID from the folder element
            const folderID = folder.getAttribute('data-folder-id');

            // Map the folder name to its ID in the folders object
            folders[folderName] = folderID;
        });

        console.log("CEB5e | Top-level folder names:", folderNames);
    } else {
        console.log("CEB5e | Directory list not found. Ensure you are targeting the correct element and it exists in the DOM.");
    }
    const folderNames = Object.keys(folders);
    const htmlContent = `
                        <form>
                            <div class="form-group">
                                <label>Select Enemy Folder:</label>
                                <select id="enemy-folder-select">${folderNames}</select>
                            </div>
                            <div class="form-group">
                                <label>Select Ally Folder:</label>
                                <select id="ally-folder-select">${folderNames}</select>
                            </div>
                        </form>
                        `
    

    // Helper function to populate a select dropdown
    function populateSelect(selectElement, options) {
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }
    
    let dialog = new Dialog({
        title: "Select Encounter Folders",
        content: htmlContent,
        buttons: {
            select: {
                label: "Select",
                callback: html => {
                     // Use jQuery or equivalent to get selected option's text (folder name)
                    const selectedEnemyFolderName = html.find("#enemy-folder-select option:selected").text();
                    const selectedAllyFolderName = html.find("#ally-folder-select option:selected").text();

                    // Lookup folder IDs from the folders dictionary
                    const selectedEnemyFolderID = folders[selectedEnemyFolderName];
                    const selectedAllyFolderID = folders[selectedAllyFolderName];

                    // Call balance with folder names and IDs
                    balance(selectedEnemyFolderName, selectedEnemyFolderID, selectedAllyFolderName, selectedAllyFolderID);
                }
            }
        },
        default: "select",
        render: html => {
            // This is where you ensure the dialog content is in the DOM
            setTimeout(() => {
                const enemyFolderSelect = document.querySelector('#enemy-folder-select');
                const allyFolderSelect = document.querySelector('#ally-folder-select');
                // Now you can safely manipulate these elements
                
                // Populate both selects with the folder names
                populateSelect(enemyFolderSelect, folderNames);
                populateSelect(allyFolderSelect, folderNames);
            }, 100); // Delay might need adjustment
        }
    });

    dialog.render(true);
}

