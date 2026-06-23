/**
 * PictoSUS - Carregador de Pictogramas
 * Carrega pictogramas do arquivo fonte.json e exibe em formato de grade
 */

document.addEventListener('DOMContentLoaded', function() {
    loadPictograms();
});

/**
 * Carrega os pictogramas do arquivo fonte.json
 */
async function loadPictograms() {
    const pictogramList = document.getElementById('pictogramList');

    try {
        let pictograms;

        // Tenta carregar via fetch (funciona em servidores e GitHub Pages)
        if (window.PICTOGRAMS_DATA) {
            // Se os dados foram injetados no HTML
            pictograms = window.PICTOGRAMS_DATA;
        } else {
            // Tenta carregar via fetch
            const response = await fetch('assets/fonte.json');

            if (!response.ok) {
                throw new Error(`Erro ao carregar fonte.json: ${response.status}`);
            }

            pictograms = await response.json();
        }

        // Verifica se o array está vazio
        if (!Array.isArray(pictograms) || pictograms.length === 0) {
            pictogramList.innerHTML = '<div class="error">Nenhum pictograma encontrado.</div>';
            return;
        }

        // Limpa o conteúdo
        pictogramList.innerHTML = '';

        // Cria elementos para cada pictograma
        pictograms.forEach((item, index) => {
            const pictogramElement = createPictogramElement(item, index);
            pictogramList.appendChild(pictogramElement);
        });

    } catch (error) {
        console.error('Erro ao carregar pictogramas:', error);
        pictogramList.innerHTML = `
            <div class="error">
                <strong>Erro ao carregar pictogramas:</strong><br>
                ${error.message}
            </div>
        `;
    }
}

/**
 * Cria um elemento de pictograma
 * @param {Object} item - Objeto contendo imagem e referente
 * @param {number} index - Índice do pictograma
 * @returns {HTMLElement} Elemento do pictograma
 */
function createPictogramElement(item, index) {
    const div = document.createElement('div');
    div.className = 'pictogram-item';
    div.setAttribute('data-index', index);

    // Validação básica
    const imageName = item.imagem || 'sem-imagem.png';
    const referente = item.referente || 'Sem descrição';

    const imagePath = `imagens/${imageName}`;

    div.innerHTML = `
        <div class="pictogram-image">
            <img 
                src="${imagePath}" 
                alt="${referente}"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22 font-size=%2214%22%3EImagem não encontrada%3C/text%3E%3C/svg%3E'"
            >
        </div>
        <div class="pictogram-text">
            <h3>Pictograma ${index + 1}</h3>
            <p>${sanitizeHTML(referente)}</p>
        </div>
    `;

    return div;
}

/**
 * Sanitiza strings HTML para evitar injeção
 * @param {string} text - Texto a ser sanitizado
 * @returns {string} Texto sanitizado
 */
function sanitizeHTML(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
