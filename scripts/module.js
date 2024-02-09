(() => { 
    Hooks.once('init', async function() {
        console.log("CEB5e | Init");

    });

    Hooks.once('ready', async function() {
        document.addEventListener('contextmenu', event => {
            const clickedElement = event.target.closest('.directory-item.folder');
            if (clickedElement) {
              // Delay the injection to ensure the default context menu is already built
              setTimeout(() => {
                const customOption = document.createElement('li');
                customOption.className = 'context-item';
                customOption.innerHTML = '<i class="fas fa-folder-open"></i> Open Custom Dialog';
                customOption.addEventListener('click', openCustomDialog);
                document.querySelector('.context-menu').appendChild(customOption);
              }, 0);
            }
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
