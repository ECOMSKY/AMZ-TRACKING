document.addEventListener('DOMContentLoaded', function() {
    const apiForm = document.getElementById('api-form');
    const loader = document.getElementById('loader');

    loadAPISettings();

    apiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveAPISettings();
    });
});

function loadAPISettings() {
    showLoader();
    fetch('/api/api-settings',{
        headers: {
        'Authorization' : `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    }})
        .then(response => response.json())
        .then(settings => {
            hideLoader();
            document.getElementById('amazon-access-key').value = settings.amazonAccessKey || '';
            document.getElementById('amazon-secret-key').value = settings.amazonSecretKey || '';
            document.getElementById('google-ads-client-id').value = settings.googleAdsClientId || '';
            document.getElementById('google-ads-client-secret').value = settings.googleAdsClientSecret || '';
            document.getElementById('google-ads-developer-token').value = settings.googleAdsDeveloperToken || '';
            document.getElementById('google-ads-refresh-token').value = settings.googleAdsRefreshToken || '';
        })
        .catch(error => {
            hideLoader();
            console.error('Error loading API settings:', error);
            showNotification('Failed to load API settings', 'error');
        });
}

function saveAPISettings() {
    const formData = new FormData(document.getElementById('api-form'));
    const settings = Object.fromEntries(formData);

    showLoader();
    fetch('/api/api-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings),
    })
    .then(response => response.json())
    .then(result => {
        hideLoader();
        showNotification('API settings saved successfully', 'success');
    })
    .catch(error => {
        hideLoader();
        console.error('Error saving API settings:', error);
        showNotification('Failed to save API settings', 'error');
    });
}

function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

function showNotification(message, type) {
    // Implement this function to show notifications
    alert(message);
}