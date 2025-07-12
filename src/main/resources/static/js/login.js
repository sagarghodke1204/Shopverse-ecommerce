document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

// --- Message Box Function (consistent across pages) ---
function displayMessageBox(message, onConfirm = null, showCancel = false) {
    const messageBox = document.createElement('div');
    messageBox.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50';
    messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
            <p class="text-lg font-semibold text-gray-800 mb-4">${message}</p>
            <div class="flex justify-center space-x-4">
                <button id="msg-box-ok" class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200">OK</button>
                ${showCancel ? `<button id="msg-box-cancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200">Cancel</button>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(messageBox);

    document.getElementById('msg-box-ok').onclick = () => {
        messageBox.remove();
        if (onConfirm) {
            onConfirm();
        }
    };

    if (showCancel) {
        document.getElementById('msg-box-cancel').onclick = () => {
            messageBox.remove();
        };
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerText = ''; // Clear previous errors

    try {
        const response = await fetch('http://localhost:8087/api/users/login', { // Corrected API URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.text(); // Get raw error message
            throw new Error(errorData || "Invalid email or password. Please try again.");
        }

        const user = await response.json();

        localStorage.setItem("loggedInUser", JSON.stringify(user));
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("username", user.username);

        displayMessageBox("Login successful!", () => {
            window.location.href = "account.html";
        });

    } catch (error) {
        console.error("Login error:", error);
        errorMessageElement.innerText = error.message; // Display error on the page
        displayMessageBox("Login failed: " + error.message); // Also show in message box
    }
}
