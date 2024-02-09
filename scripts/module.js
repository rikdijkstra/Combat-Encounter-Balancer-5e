(() => { 
    Hooks.once('init', async function() {
        console.log("CEB5e | Init");

    });

    Hooks.once('ready', async function() {
        // Wait for the UI to be fully loaded
        setTimeout(() => {
            // Find the container for the action buttons in the actors directory header
            const actionsContainer = document.querySelector('.directory-header .header-actions.action-buttons.flexrow');

            if (actionsContainer) {
                // Create the new button
                const customButton = document.createElement('button');
                customButton.className = 'custom-action';
                customButton.innerHTML = '<i class="fas fa-magic"></i> Custom Action';
                
                // Add an event listener for your custom button action
                customButton.addEventListener('click', () => {
                    console.log('Custom action button clicked');
                    // Place your custom action code here
                });

                // Append the new button to the actions container
                actionsContainer.appendChild(customButton);
            }
        }, 500);
          

        Hooks.on('getActorDirectoryEntryContext', (html, contextOptions) => {
            console.log("CEB5e |hook triggered!");
            contextOptions.push({
                name: "Open Custom Dialog",
                icon: '<i class="fas fa-folder-open"></i>',
                condition: li => true, // This function determines when the menu option is available
                callback: li => {
                    // Your function to open the dialog
                    openCustomDialog();
                }
            });
        });
    });




})();
async function openCustomDialog() {
    // Assuming you have a Dialog subclass or a similar setup
    // Render the template HTML in a dialog
    // Assuming you're within an async function
    console.log("CEB5e | openCustomDialog() called")
    const templatePath = "modules/combat-encounter-balancer-5e/templates/dialogs/select-folder-dialog.html";
    const templateHtml = await fetch(templatePath).then(response => response.text()).catch(err => console.error(err));        console.log("openCustomDialog() called")
    let dialog = new Dialog({
        title: "Select Folder",
        content: templateHtml,
        buttons: {
            select: {
            label: "Select",
            callback: html => {
                // Handle selection
            }
            }
        },
        default: "select"
        });
    dialog.render(true);
}

// class CustomActorSheet extends ActorSheet {
//     get template() {
//         // Return the path to your actor sheet template
//     }

//     static get defaultOptions() {
//         return mergeObject(super.defaultOptions, {
//             // Your options here
//         });
//     }

//     activateListeners(html) {
//         super.activateListeners(html);
//         html.find(".your-custom-button-class").click(ev => {
//             openCustomDialog();
//         });
//     }

//     // Additional methods as needed
// }
