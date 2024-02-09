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

async function openCustomDialog() {
    // Assuming you have a Dialog subclass or a similar setup
    // Render the template HTML in a dialog
    // Assuming you're within an async function
    console.log("CEB5e | openCustomDialog() called")

    // Attempt to locate the directory list within the specified actors section
    const directoryList = document.querySelector("#ui-right #sidebar #actors .directory-list");
    let folderNames = [];

    if (directoryList) {
        console.log("CEB5e | Directory list found.");

        // Select only the direct children 'li' elements of the directory list that are top-level folders
        directoryList.querySelectorAll('li[data-folder-depth="1"]').forEach(folder => {
            // Extract the folder name. Assuming the folder name is within a <h3> tag or similar
            const folderName = folder.querySelector('header.folder-header h3').textContent.trim();
            folderNames.push(folderName);
        });

        console.log("CEB5e | Top-level folder names:", folderNames);
    } else {
        console.log("CEB5e | Directory list not found. Ensure you are targeting the correct element and it exists in the DOM.");
    }
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
    let dialog = new Dialog({
        title: "Select Encounter Folders",
        content: htmlContent,
        buttons: {
            select: {
            label: "Select",
            callback: html => {
                // const selectedEnemyFolder = html.find("#enemy-folder-select").val();
                // const selectedAllyFolder = html.find("#ally-folder-select").val();
                }
            }
        },
        default: "select"
    });
    dialog.render(true);

    // Now populate your dropdowns. Assuming you have two dropdowns for enemy and ally folders
    const enemyFolderSelect = document.querySelector('#enemy-folder-select');
    const allyFolderSelect = document.querySelector('#ally-folder-select');

    // Helper function to populate a select dropdown
    function populateSelect(selectElement, options) {
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    // Populate both selects with the folder names
    populateSelect(enemyFolderSelect, folderNames);
    populateSelect(allyFolderSelect, folderNames);
}
