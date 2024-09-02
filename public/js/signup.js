document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    const loginBtn = document.getElementById('login-btn');

    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        signup(username, email, password);
    });

    loginBtn.addEventListener('click', function() {
        window.location.href = '/login';
    });
});

function signup(username, email, password) {
    fetch('/api/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            alert('Sign up successful!');
            window.location.href = '/dashboard'; // ou toute autre page après l'inscription
        } else {
            alert('Sign up failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during sign up');
    });
}