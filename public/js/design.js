document.addEventListener('DOMContentLoaded', function() {
    const designForm = document.getElementById('design-form');
    const logoType = document.getElementById('logo-type');
    const logoTextGroup = document.getElementById('logo-text-group');
    const logoImageGroup = document.getElementById('logo-image-group');
    const funnelSelect = document.getElementById('funnel-select');

    loadFunnels();
    
    funnelSelect.addEventListener('change', function() {
        if (this.value) {
            loadDesignSettings(this.value);
        } else {
            resetForm();
        }
    });

    logoType.addEventListener('change', function() {
        if (this.value === 'text') {
            logoTextGroup.style.display = 'block';
            logoImageGroup.style.display = 'none';
        } else {
            logoTextGroup.style.display = 'none';
            logoImageGroup.style.display = 'block';
        }
    });

    designForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveDesignSettings();
    });

    function loadFunnels() {
        fetch('/api/funnels')
            .then(response => response.json())
            .then(funnels => {
                funnelSelect.innerHTML = '<option value="">Select a funnel</option>';
                funnels.forEach(funnel => {
                    if (funnel.templateType === 'Multi Product') {
                        const option = document.createElement('option');
                        option.value = funnel._id;
                        option.textContent = funnel.name;
                        funnelSelect.appendChild(option);
                    }
                });
            })
            .catch(error => {
                console.error('Error loading funnels:', error);
                showNotification('Failed to load funnels', 'error');
            });
    }

    function loadDesignSettings(funnelId) {
        fetch(`/api/design-settings/${funnelId}`)
            .then(response => response.json())
            .then(settings => {
                console.log('Received settings:', settings); // Ajoutez cette ligne
    
                const elements = {
                    'logo-type': settings.logoType || 'text',
                    'logo-text': settings.logoText || '',
                    'logo-image': settings.logoImage || '',
                    'header-color': settings.headerColor || '#000000',
                    'header-color-text': settings.headerColor || '#000000',
                    'footer-color': settings.footerColor || '#000000',
                    'footer-color-text': settings.footerColor || '#000000',
                    'logo-footer-color': settings.logoFooterColor || '#ffffff',
                    'logo-footer-color-text': settings.logoFooterColor || '#ffffff',
                    'footer-text': settings.footerText || ''
                };
    
                for (const [id, value] of Object.entries(elements)) {
                    const element = document.getElementById(id);
                    if (element) {
                        console.log(`Setting ${id} to ${value}`); // Ajoutez cette ligne
                        element.value = value;
                    } else {
                        console.warn(`Element with id ${id} not found`); // Ajoutez cette ligne
                    }
                }
    
                const logoType = document.getElementById('logo-type');
                if (logoType) logoType.dispatchEvent(new Event('change'));
            })
            .catch(error => {
                console.error('Error loading design settings:', error);
                showNotification('Failed to load design settings', 'error');
            });
    }

    function resetForm() {
        designForm.reset();
        logoType.dispatchEvent(new Event('change'));
    }

    function saveDesignSettings() {
        const form = document.getElementById('design-form');
        const formData = new FormData(form);
        const funnelId = document.getElementById('funnel-select').value;
        if (!funnelId) {
            showNotification('Please select a funnel', 'error');
            return;
        }
    
        // Ajoutez cette ligne pour inclure le fichier image s'il est sélectionné
        const logoImageFile = document.getElementById('logoImage').files[0];
        if (logoImageFile) {
            formData.append('logoImage', logoImageFile);
        }
    
        fetch(`/api/design-settings/${funnelId}`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            showNotification('Design settings saved successfully', 'success');
        })
        .catch(error => {
            console.error('Error saving design settings:', error);
            showNotification('Failed to save design settings', 'error');
        });
    }

    function showNotification(message, type = 'success') {
        // Implement this function to show notifications
        alert(message);
    }

    // Sync color inputs
    syncColorInputs('header-color');
    syncColorInputs('footer-color');
    syncColorInputs('logo-footer-color');
});

function syncColorInputs(baseName) {
    const colorInput = document.getElementById(baseName);
    const textInput = document.getElementById(`${baseName}-text`);
    
    colorInput.addEventListener('input', function() {
        textInput.value = this.value;
    });

    textInput.addEventListener('input', function() {
        colorInput.value = this.value;
    });
}