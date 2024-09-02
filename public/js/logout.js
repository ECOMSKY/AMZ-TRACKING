document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            window.location.href = '/login';
        });
    }
});