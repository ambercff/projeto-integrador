//carregar as sugestões em tempo real enquanto o usuário digita na barra de pesquisa

const searchInput = document.querySelector('.barra-pesquisa');
const hints = document.querySelector('.hints');

searchInput.oninput = async (ev) => {
    document.querySelectorAll('.hint').forEach((hint) => hint.remove());
    const input = ev.target.value.trim(); // Remova espaços em branco do início e do fim

    if (!input) {
        return;
    }

    try {
        const response = await fetch(`/search/suggestions?q=${input}`);
        const suggestions = await response.json();

        suggestions.forEach((suggestion) => {
            const newHint = document.createElement('div');
            newHint.className = 'hint';
            newHint.textContent = suggestion;

            hints.appendChild(newHint);
        });
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
    }
};