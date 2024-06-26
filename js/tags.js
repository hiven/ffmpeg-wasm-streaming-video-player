document.addEventListener('DOMContentLoaded', () => {
    const multiSelect = document.getElementById('multiSelect');
    const tagContainer = document.getElementById('tagContainer');

    const handleTagClick = (option, tag) => {
        option.selected = !option.selected;
        tag.classList.toggle('selected');
    };

    const updateTags = () => {
        const fragment = document.createDocumentFragment();
        Array.from(multiSelect.options).forEach(option => {
            const tag = document.createElement('div');
            tag.className = 'tag' + (option.selected ? ' selected' : '');
            tag.textContent = option.text;
            tag.dataset.value = option.value;

            tag.addEventListener('click', () => handleTagClick(option, tag));
            fragment.appendChild(tag);
        });
        tagContainer.innerHTML = '';
        tagContainer.appendChild(fragment);
    };

    const debounce = (func, delay) => {
        let debounceTimer;
        return (...args) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func(...args), delay);
        };
    };

    // Initial render
    updateTags();

    // Update tags if multiSelect changes
    multiSelect.addEventListener('change', debounce(updateTags, 200));
});
