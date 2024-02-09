(() => { 
    Hooks.once('init', async function() {
        console.log("CEB5e | Init");

    });

    Hooks.once('ready', async function() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    // Check if the added node is a context menu
                    // You might need a more specific check here depending on how Foundry VTT marks context menus for folders
                    if (node.nodeType === 1 && node.matches('.context-menu-selector')) { // Update '.context-menu-selector' as needed
                        // Ensure this context menu is for a folder, you might need additional checks here
                        const customOption = document.createElement('li');
                        customOption.className = 'context-item';
                        customOption.innerHTML = '<i class="fas fa-folder-open"></i> Open Custom Dialog';
                        customOption.onclick = openCustomDialog;
                        node.appendChild(customOption);
                    }
                });
            });
        });
    
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
          

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
})();


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
