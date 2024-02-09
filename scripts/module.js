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
                        const customButton = $('<button class="custom-action"><i class="fas fa-magic"></i> Custom Action</button>');
                        customButton.on('click', function() {
                            // Custom button action
                            console.log('Custom action button clicked');
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
