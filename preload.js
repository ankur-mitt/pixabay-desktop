// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {

    const searchFormElement = document.getElementById('search-form');
    const searchInputElement = document.getElementById('search-value');

    searchFormElement.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInputElement.value;
        searchInputElement.value = '';

        ipcRenderer.send('image:search', query);
    });

});
