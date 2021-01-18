const {ipcRenderer} = require('electron');

window.addEventListener('DOMContentLoaded', () => {

    const imagesContainer = document.getElementById('images-container');
    const headingElement = document.getElementById('heading-info');
    ipcRenderer.on('image:results', (event, images, query) => {
        headingElement.innerHTML = `Search results for '${query}'`;
        let imagesHtml = '';
        images.map(image => {
            const {id, tags, webformatURL} = image;
            imagesHtml += `<img id="${id}" data-src="${webformatURL}" alt="${tags}" uk-img>`;
        });
        imagesContainer.innerHTML = imagesHtml;

        images.map(image => {
            const {id, largeImageURL} = image;
            const imageElement = document.getElementById(`${id}`);
            imageElement.addEventListener('click', () => {
                ipcRenderer.send('image:open', largeImageURL);
            });
        });
    });

});
