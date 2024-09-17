document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupBtn = document.getElementById('signup-btn');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });

    signupBtn.addEventListener('click', function() {
        window.location.href = '/signup';
    });
});

function login(username, password) {
    console.log('Attempting login with:', { username, password });
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        console.log('Login response status:', response.status);
        if (!response.ok) {
            return response.json().then(err => Promise.reject(err));
        }
        return response.json();
    })
    .then(data => {
        console.log('Login successful, received data:', data);
        if (data.token) {
            localStorage.setItem('userId',data.userId)
            localStorage.setItem('token', data.token);
            window.location.href = '/dashboard';
        } else {
            showError(data.message || 'Login failed');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showError('An error occurred during login: ' + error.message);
    });
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}