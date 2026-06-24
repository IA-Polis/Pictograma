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
let allPictograms = [];

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

        allPictograms = pictograms;
        initTypeFilter(pictograms);
        renderPictograms(pictograms);

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

function initTypeFilter(pictograms) {
    const typeFilter = document.getElementById('typeFilter');

    if (!typeFilter) {
        return;
    }

    const tipos = Array.from(new Set(
        pictograms
            .map(item => (item.tipo || item.type || 'Sem tipo').toString().trim())
            .filter(Boolean)
    ));

    tipos.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));

    typeFilter.innerHTML = '<option value="">Todos</option>';

    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        typeFilter.appendChild(option);
    });

    typeFilter.addEventListener('change', () => {
        const selectedType = typeFilter.value;
        const filtered = selectedType
            ? allPictograms.filter(item => (item.tipo || item.type || '').toString().trim() === selectedType)
            : allPictograms;

        renderPictograms(filtered);
    });
}

function renderPictograms(pictograms) {
    const pictogramList = document.getElementById('pictogramList');
    pictogramList.innerHTML = '';

    pictograms.forEach((item, index) => {
        const pictogramElement = createPictogramElement(item, index);
        pictogramList.appendChild(pictogramElement);
    });
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
    const tipo = (item.tipo || item.type || '').toString().trim();

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
            ${tipo ? `<p class="pictogram-type">Tipo: ${sanitizeHTML(tipo)}</p>` : ''}
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
