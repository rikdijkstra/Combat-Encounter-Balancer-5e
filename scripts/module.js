(() => { })();

Hooks.once('init', async function() {
    // Assuming you're within an async function
    const templatePath = "modules/combat-encounter-balancer-5e/templates/dialogs/select-folder-dialog.html";
    const templateHtml = await fetch(templatePath).then(response => response.text());

    // Render the template HTML in a dialog
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

});

Hooks.once('ready', async function() {

});
