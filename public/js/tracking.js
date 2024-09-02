document.addEventListener('DOMContentLoaded', function() {
    const trackingForm = document.getElementById('tracking-form');
    const funnelSelect = document.getElementById('funnel-select');

    loadFunnels();
    loadTrackingSettings();

    funnelSelect.addEventListener('change', loadTrackingSettings);

    trackingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveTrackingSettings();
    });
});

function loadFunnels() {
    fetch('/api/funnels')
        .then(response => response.json())
        .then(funnels => {
            const funnelSelect = document.getElementById('funnel-select');
            funnels.forEach(funnel => {
                const option = document.createElement('option');
                option.value = funnel._id;
                option.textContent = funnel.name;
                funnelSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading funnels:', error));
}

function loadTrackingSettings() {
    const funnelId = document.getElementById('funnel-select').value;
    const url = funnelId ? `/api/tracking-settings/${funnelId}` : '/api/tracking-settings';

    showLoader();
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(settings => {
            hideLoader();
            document.getElementById('google-tag-manager').value = settings.googleTagManager || '';
            document.getElementById('google-ads-id').value = settings.googleAdsId || '';
            document.getElementById('google-ads-conversion-label').value = settings.googleAdsConversionLabel || '';
            document.getElementById('amazon-affiliate-tag').value = settings.amazonAffiliateTag || '';  // Nouvelle ligne
        })
        .catch(error => {
            hideLoader();
            console.error('Error loading tracking settings:', error);
            showNotification('Failed to load tracking settings', 'error');
        });
}


function saveTrackingSettings() {
    const formData = new FormData(document.getElementById('tracking-form'));
    const settings = Object.fromEntries(formData);
    const funnelId = document.getElementById('funnel-select').value;
    const url = funnelId ? `/api/tracking-settings/${funnelId}` : '/api/tracking-settings';

    showLoader();
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        hideLoader();
        showNotification('Tracking settings saved successfully');
    })
    .catch(error => {
        hideLoader();
        console.error('Error saving tracking settings:', error);
        showNotification('Failed to save tracking settings', 'error');
    });
}

function showNotification(message, type) {
    // Implémentez cette fonction pour afficher une notification
    alert(message); // Temporairement, utilisez alert pour voir le message
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}