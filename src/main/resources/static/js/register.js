document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
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

async function handleRegisterSubmit(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerText = ''; // Clear previous errors

    const user = { username, email, password };

    try {
        const response = await fetch('http://localhost:8087/api/users', { // Corrected API URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get raw error message
            throw new Error(errorText || "Registration failed. Please try again.");
        }

        // Assuming successful registration returns the created user object, though not strictly needed here
        // const registeredUser = await response.json();
        // console.log("User registered:", registeredUser);

        displayMessageBox("Registration successful! Please login.", () => {
            window.location.href = 'login.html';
        });

    } catch (error) {
        console.error("Registration error:", error);
        errorMessageElement.innerText = error.message; // Display error on the page
        displayMessageBox("Registration failed: " + error.message); // Also show in message box
    }
}
