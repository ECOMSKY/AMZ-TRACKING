document.addEventListener('DOMContentLoaded', function() {
    const manualSyncButton = document.getElementById('manual-sync');
    const autoSyncForm = document.getElementById('auto-sync-form');
    const syncStatus = document.getElementById('sync-status');
    const lastSyncTime = document.getElementById('last-sync-time');

    loadSyncSettings();

    manualSyncButton.addEventListener('click', function() {
        syncConversions();
    });

    autoSyncForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSyncSettings();
    });
});

function loadSyncSettings() {
    console.log('Fetching sync settings...');
    fetch('/api/sync-settings')
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(settings => {
            console.log('Received settings:', settings);
            document.getElementById('sync-interval').value = settings.syncInterval || '';
            document.getElementById('last-sync-time').textContent = settings.lastSyncTime ? new Date(settings.lastSyncTime).toLocaleString() : 'Never';
        })
        .catch(error => {
            console.error('Error loading sync settings:', error);
            showNotification('Failed to load sync settings', 'error');
        });
}

function saveSyncSettings() {
    const syncInterval = document.getElementById('sync-interval').value;
    
    fetch('/api/sync-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syncInterval }),
    })
    .then(response => response.json())
    .then(result => {
        showNotification('Sync settings saved successfully', 'success');
    })
    .catch(error => {
        console.error('Error saving sync settings:', error);
        showNotification('Failed to save sync settings', 'error');
    });
}

function syncConversions() {
    console.log('Starting manual sync...');
    const syncStatus = document.getElementById('sync-status');
    syncStatus.textContent = 'Syncing...';

    fetch('/api/sync-conversions', { method: 'POST' })
        .then(response => response.json())
        .then(result => {
            console.log('Sync result:', result);
            syncStatus.textContent = 'Sync completed successfully';
            document.getElementById('last-sync-time').textContent = new Date().toLocaleString();
        })
        .catch(error => {
            console.error('Error syncing conversions:', error);
            syncStatus.textContent = 'Sync failed';
        });
}

function showNotification(message, type) {
    // Implement this function to show notifications
    alert(message);
}