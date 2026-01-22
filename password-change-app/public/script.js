// Password toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle the icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Form validation
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm && errorMessage) {
        loginForm.addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();

            if (username === '') {
                e.preventDefault(); // Prevent form submission
                errorMessage.textContent = 'Username is required.';
                errorMessage.style.display = 'block';
                return false;
            } else {
                errorMessage.style.display = 'none';
            }
        });
    }

    // Existing modal functionality (keeping for compatibility)
    const changePasswordLink = document.getElementById('changePasswordLink');
    const passwordModal = document.getElementById('passwordModal');
    const closeBtn = document.getElementsByClassName('close')[0];

    if (changePasswordLink && passwordModal) {
        changePasswordLink.onclick = function() {
            passwordModal.style.display = 'block';
        }
    }

    if (closeBtn && passwordModal) {
        closeBtn.onclick = function() {
            passwordModal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
        if (event.target == passwordModal) {
            passwordModal.style.display = 'none';
        }
    }

    // Password form submission (existing functionality)
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const messageDiv = document.getElementById('message');

            if (newPassword !== confirmPassword) {
                messageDiv.textContent = 'Passwords do not match!';
                messageDiv.style.color = 'red';
                return;
            }

            // Here you would typically send the data to your backend
            // For now, just show a success message
            messageDiv.textContent = 'Password changed successfully!';
            messageDiv.style.color = 'green';

            // Reset form
            passwordForm.reset();
        });
    }
});
