(() => { 
    console.log("TESTLOG");
    Hooks.once('init', async function() {
        console.log("INIT HOOK TRIGGERED");
        console.info("INIT HOOK TRIGGERED");

    });

    Hooks.once('ready', async function() {
        Hooks.on('getActorDirectoryEntryContext', (html, contextOptions) => {
            console.log("hook triggered!");
            console.info("hook triggered!");
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
        const templatePath = "modules/combat-encounter-balancer-5e/templates/dialogs/select-folder-dialog.html";
        const response = await fetch(templatePath);
        const templateHtml = await fetch(templatePath).then(response => response.text());
        console.log("openCustomDialog() called")
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
