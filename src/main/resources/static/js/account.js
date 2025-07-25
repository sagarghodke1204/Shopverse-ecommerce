// Global variables for user data
let currentUserId = null;
let userProfile = {
    username: 'Loading...',
    email: 'loading@example.com',
    fullName: 'Loading Name',
    phone: 'N/A'
};
let userOrders = [];
let userAddresses = [];

// DOM elements
const mainContentArea = document.getElementById('main-content-area');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const tabButtons = document.querySelectorAll('.tab-button');

// Helper function to generate a random UUID (for dummy data/client-side additions)
const generateUUID = () => crypto.randomUUID();

// --- User Authentication and Data Fetching (from your backend) ---
async function loadUserDataAndOrders() {
    console.log("loadUserDataAndOrders: Starting...");
    loadingIndicator.classList.remove('hidden'); // Ensure loading indicator is visible
    errorMessage.classList.add('hidden'); // Hide any previous error messages
    mainContentArea.innerHTML = ''; // Clear previous content, will be repopulated by render functions

    try {
        let rawUserId = localStorage.getItem("userId");
        console.log("loadUserDataAndOrders: Retrieved userId from localStorage (raw):", rawUserId);

        // Robust check for userId validity
        if (!rawUserId || String(rawUserId).trim() === "" || String(rawUserId) === "null" || String(rawUserId) === "undefined") {
            console.warn("loadUserDataAndOrders: userId is invalid or missing. Redirecting to login.");
            displayErrorMessage('User not logged in or session expired. Please log in to view your account.');
            setTimeout(() => {
                window.location.replace("login.html"); // Use replace for security
            }, 2000);
            return; // Stop execution
        }

        // Parse userId to a number, as it might be stored as a string
        const userIdAsNumber = parseInt(rawUserId, 10);
        if (isNaN(userIdAsNumber)) {
            console.error("loadUserDataAndOrders: userId from localStorage is not a valid number. Redirecting.");
            displayErrorMessage('Invalid user session. Please log in again.');
            setTimeout(() => {
                window.location.replace("login.html");
            }, 2000);
            return; // Stop execution
        }
        // Update currentUserId to its numeric form for consistent use throughout the script
        currentUserId = userIdAsNumber;
        console.log("loadUserDataAndOrders: Valid userId (parsed as number):", currentUserId);


        // Fetch User Profile
        const userResponse = await fetch(`http://localhost:8087/api/users/${currentUserId}`);
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                 console.error("loadUserDataAndOrders: User not found on backend. Redirecting to login.");
                 displayErrorMessage('User not found. Please log in again.');
            } else {
                const errorText = await userResponse.text();
                console.error(`loadUserDataAndOrders: Failed to fetch user profile: ${userResponse.status} - ${errorText}`);
                displayErrorMessage('Failed to load user profile. Please try again.');
            }
            setTimeout(() => {
                window.location.replace("login.html");
            }, 2000);
            return; // Exit after redirect
        }
        userProfile = await userResponse.json();
        console.log("loadUserDataAndOrders: Fetched user profile:", userProfile);


        // Fetch Orders
        try {
            const ordersResponse = await fetch(`http://localhost:8087/api/orders/user/${currentUserId}`);
            if (!ordersResponse.ok) {
                const errorText = await ordersResponse.text();
                console.warn(`loadUserDataAndOrders: Failed to fetch orders: ${ordersResponse.status} - ${errorText}`);
                userOrders = []; // Ensure it's an empty array on error
            } else {
                userOrders = await ordersResponse.json();
                console.log("loadUserDataAndOrders: Fetched Orders:", userOrders);
            }
        } catch (orderError) {
            console.error("loadUserDataAndOrders: Error fetching orders:", orderError);
            userOrders = []; // Ensure it's an empty array on network error
        }


        // Fetch Addresses (This will call renderAddresses internally)
        await fetchAddresses(); // Call fetchAddresses to populate userAddresses and render

        // Set initial tab based on URL or default to dashboard
        const urlParams = new URLSearchParams(window.location.search);
        const initialTab = urlParams.get('tab') || 'dashboard';

        const initialTabButton = document.getElementById(`tab-${initialTab}`);
        if (initialTabButton) {
            initialTabButton.click(); // Simulate click to activate tab and render content
        } else {
            renderContent('dashboard'); // Fallback
        }
        console.log("loadUserDataAndOrders: Data loaded and initial tab rendered.");

    } catch (error) {
        console.error('loadUserDataAndOrders: Uncaught error during data load:', error);
        displayErrorMessage('An unexpected error occurred. Please try again.');
        setTimeout(() => {
            window.location.replace("login.html"); // Redirect on unexpected errors
        }, 2000);
    } finally {
        loadingIndicator.classList.add('hidden'); // Hide loading indicator
        console.log("loadUserDataAndOrders: Finished.");
    }
}

async function fetchAddresses() {
    console.log("fetchAddresses: Starting...");
    try {
        showLoading(); // Show loading indicator specifically for addresses tab
        // Ensure currentUserId is a number before using it in the URL
        if (typeof currentUserId !== 'number' || isNaN(currentUserId)) {
            console.error("fetchAddresses: currentUserId is not a valid number, cannot fetch addresses.");
            displayErrorMessage('Invalid user ID. Cannot load addresses.');
            return; // Stop execution if userId is invalid
        }
        const response = await fetch(`http://localhost:8087/api/addresses/user/${currentUserId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch addresses: ${response.status} - ${errorText}`);
        }
        userAddresses = await response.json();
        console.log("fetchAddresses: Fetched Addresses:", userAddresses);
        renderAddresses(); // Call renderAddresses to display the fetched data
    } catch (error) {
        console.error('fetchAddresses: Error fetching addresses:', error);
        displayErrorMessage('Failed to load addresses. Please try again.');
    } finally {
        hideLoading();
        console.log("fetchAddresses: Finished.");
    }
}

// --- Dynamic Content Rendering Functions ---

function renderDashboard() {
    mainContentArea.innerHTML = `
        <h2 class="text-2xl font-semibold mb-6">Welcome, ${userProfile.fullName || userProfile.username || 'User'}!</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-2">Orders</h3>
                <p>You have ${userOrders.length} past orders.</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200" onclick="document.getElementById('tab-orders').click()">View Orders</button>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-2">Addresses</h3>
                <p>You have ${userAddresses.length} saved addresses.</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200" onclick="document.getElementById('tab-addresses').click()">Manage Addresses</button>
            </div>
             <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold mb-2">Profile</h3>
                <p>Update your personal information.</p>
                <button class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200" onclick="document.getElementById('tab-profile').click()">Edit Profile</button>
            </div>
        </div>
    `;
}

function renderOrderHistory() {
    mainContentArea.innerHTML = `
        <h2 class="text-2xl font-semibold mb-6">Your Orders</h2>
        <div id="order-list" class="space-y-4">
            ${userOrders.length === 0 ? '<p>No past orders found.</p>' :
                userOrders.map(order => `
                    <div class="bg-white p-4 rounded-lg shadow-md">
                        <div class="flex justify-between items-center mb-2">
                            <p class="font-semibold text-lg">Order ID: ${order.id}</p>
                            <p class="text-gray-600 text-sm">Date: ${new Date(order.createdDate).toLocaleDateString()}</p>
                        </div>
                        <p class="text-right text-xl font-bold text-gray-800 mb-4">Total: ₹${order.total_price ? order.total_price.toFixed(2) : '0.00'}</p>
                        <div class="order-items-list space-y-2 border-t pt-4 mt-4 border-gray-200">
                            ${order.orderItems && order.orderItems.length > 0 ?
                                order.orderItems.map(item => `
                                    <div class="flex items-center space-x-4 bg-gray-50 p-3 rounded-md">
                                        <img src="${item.imageUrl ? item.imageUrl : 'https://placehold.co/64x64/CCCCCC/000000?text=No+Image'}"
                                             alt="${item.productName ? item.productName : 'Product'}"
                                             class="w-16 h-16 object-cover rounded-md border border-gray-200"
                                             onerror="this.onerror=null;this.src='https://placehold.co/64x64/CCCCCC/000000?text=No+Image';">
                                        <div class="flex-grow">
                                            <p class="font-medium text-gray-900">${item.productName ? item.productName : 'Unknown Product'}</p>
                                            <p class="text-sm text-gray-600">Quantity: ${item.quantity}</p>
                                            <p class="text-sm text-gray-600">Price: ₹${item.price ? (item.price * item.quantity).toFixed(2) : '0.00'}</p>
                                        </div>
                                    </div>
                                `).join('')
                                : '<p class="text-gray-600">No items found for this order.</p>'
                            }
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

function renderPersonalInformation() {
    mainContentArea.innerHTML = `
        <h2 class="text-2xl font-semibold mb-6">Personal Information</h2>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                <p class="text-gray-900">${userProfile.username}</p>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Email:</label>
                <p class="text-gray-900">${userProfile.email}</p>
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Full Name:</label>
                <p class="text-gray-900">${userProfile.fullName || 'N/A'}</p>
            </div>
             <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2">Phone:</label>
                <p class="text-gray-900">${userProfile.phone || 'N/A'}</p>
            </div>
            <button class="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200">Edit Profile</button>
        </div>
    `;
}

function renderAddresses() {
    mainContentArea.innerHTML = `
        <h2 class="text-2xl font-semibold mb-6">Your Addresses</h2>
        <div id="address-list" class="space-y-4">
            ${userAddresses.length === 0 ? '<p>No addresses found. Add a new address below.</p>' :
                userAddresses.map(address => `
                    <div class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                        <div>
                            <p class="font-semibold">${address.name || address.fullName || 'Unnamed Address'}</p>
                            <p>${address.street}, ${address.city}, ${address.state} ${address.zipCode}</p>
                            <p>${address.country}</p>
                            ${address.isDefault ? '<span class="text-green-600 text-sm font-medium">Default</span>' : ''}
                        </div>
                        <div>
                            <button class="text-indigo-600 hover:text-indigo-800 mr-2" onclick="editAddress(${address.id})">Edit</button>
                            <button class="text-red-600 hover:text-red-800" onclick="deleteAddress(${address.id})">Delete</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>
        <button id="add-new-address-btn" class="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200 shadow-md">
            Add New Address
        </button>
        <div id="address-form-container" class="mt-6 p-6 bg-white rounded-lg shadow-md hidden">
            <!-- Address form will be loaded here -->
        </div>
    `;

    document.getElementById('add-new-address-btn').onclick = () => renderAddressForm();
    console.log("renderAddresses executed. Addresses count:", userAddresses.length);
}

// --- Address Form Related Functions ---
function renderAddressForm(addressToEdit = null) {
    const addressFormContainer = document.getElementById('address-form-container');
    addressFormContainer.classList.remove('hidden');

    addressFormContainer.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">${addressToEdit ? 'Edit Address' : 'Add New Address'}</h3>
        <form id="address-form" class="space-y-4">
            <input type="hidden" id="address-id" value="${addressToEdit ? addressToEdit.id : ''}">
            <div>
                <label for="address-name" class="block text-sm font-medium text-gray-700">Name (e.g., Home, Work)</label>
                <input type="text" id="address-name" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.name || '' : ''}">
            </div>
            <div>
                <label for="address-fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="address-fullName" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.fullName || '' : ''}" required>
            </div>
            <div>
                <label for="address-street" class="block text-sm font-medium text-gray-700">Street</label>
                <input type="text" id="address-street" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.street : ''}" required>
            </div>
            <div>
                <label for="address-city" class="block text-sm font-medium text-gray-700">City</label>
                <input type="text" id="address-city" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.city : ''}" required>
            </div>
            <div>
                <label for="address-state" class="block text-sm font-medium text-gray-700">State</label>
                <input type="text" id="address-state" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.state : ''}" required>
            </div>
            <div>
                <label for="address-zipCode" class="block text-sm font-medium text-gray-700">Zip Code</label>
                <input type="text" id="address-zipCode" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.zipCode : ''}" required>
            </div>
            <div>
                <label for="address-country" class="block text-sm font-medium text-gray-700">Country</label>
                <input type="text" id="address-country" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="${addressToEdit ? addressToEdit.country : ''}" required>
            </div>
            <div class="flex items-center">
                <input type="checkbox" id="address-isDefault" class="h-4 w-4 text-indigo-600 border-gray-300 rounded" ${addressToEdit && addressToEdit.isDefault ? 'checked' : ''}>
                <label for="address-isDefault" class="ml-2 block text-sm text-gray-900">Set as default address</label>
            </div>
            <div class="flex space-x-4">
                <button type="submit" class="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200">Save Address</button>
                <button type="button" id="cancel-address-form-btn" class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200">Cancel</button>
            </div>
        </form>
    `;

    document.getElementById('address-form').onsubmit = (event) => submitAddressForm(event, addressToEdit != null);
    document.getElementById('cancel-address-form-btn').onclick = () => {
        addressFormContainer.classList.add('hidden');
        renderAddresses();
    };
}


async function submitAddressForm(event, isEdit = false) {
    event.preventDefault();

    const addressFormContainer = document.getElementById('address-form-container');
    const addressId = document.getElementById('address-id').value;
    const name = document.getElementById('address-name').value;
    const fullName = document.getElementById('address-fullName').value;
    const street = document.getElementById('address-street').value;
    const city = document.getElementById('address-city').value;
    const state = document.getElementById('address-state').value;
    const zipCode = document.getElementById('address-zipCode').value;
    const country = document.getElementById('address-country').value;
    const isDefault = document.getElementById('address-isDefault').checked;

    const addressData = {
        id: isEdit ? parseInt(addressId, 10) : null,
        name,
        fullName,
        street,
        city,
        state,
        zipCode,
        country,
        isDefault,
        userId: currentUserId // Ensure currentUserId is the numeric value
    };

    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `http://localhost:8087/api/addresses/${addressId}` : 'http://localhost:8087/api/addresses';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addressData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save address: ${errorText}`);
        }

        displayMessageBox("Address saved successfully!");
        addressFormContainer.classList.add('hidden');
        await fetchAddresses(); // Re-fetch and render addresses to show changes

    } catch (error) {
        console.error('Error submitting address form:', error);
        displayMessageBox("An unexpected error occurred. Please try again.");
    }
}


function editAddress(addressId) {
    console.log("Attempting to edit address ID:", addressId);
    const addressToEdit = userAddresses.find(addr => addr.id === addressId);
    if (addressToEdit) {
        renderAddressForm(addressToEdit);
    } else {
        displayMessageBox("Address not found for editing.");
    }
}

async function deleteAddress(addressId) {
    console.log("Attempting to delete address ID:", addressId);
    // Using displayMessageBox for confirmation instead of native confirm()
    displayMessageBox("Are you sure you want to delete this address?", async () => {
        try {
            const response = await fetch(`http://localhost:8087/api/addresses/${addressId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete address: ${errorText}`);
            }

            displayMessageBox("Address deleted successfully!");
            await fetchAddresses(); // Re-fetch and render addresses after deletion
        } catch (error) {
            console.error('Error deleting address:', error);
            displayMessageBox("An error occurred while deleting the address. Please try again.");
        }
    }, true); // The 'true' argument shows the Cancel button
}

// --- Main Content Renderer ---
const renderFunctions = {
    dashboard: renderDashboard,
    orders: renderOrderHistory,
    profile: renderPersonalInformation,
    addresses: fetchAddresses // Changed to fetchAddresses so it always fetches fresh data
};

function renderContent(tabName) {
    errorMessage.classList.add('hidden');
    // showLoading(); // Show loading when content is rendered, handled by individual fetch functions now
    if (renderFunctions[tabName]) {
        renderFunctions[tabName]();
    } else {
        mainContentArea.innerHTML = `<p class="text-red-600">Content for ${tabName} not found.</p>`;
    }
}

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const tabName = button.id.replace('tab-', '');
        renderContent(tabName);
    });
});

// Initial load when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log("account.js: DOMContentLoaded fired.");
    loadUserDataAndOrders();
});


// Logout function
function logout() {
    localStorage.removeItem("user"); // Clear the main user object
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("username");
    displayMessageBox("You have been logged out.", () => {
        window.location.replace("login.html");
    });
}


// --- Global Message Box (re-usable across pages) ---
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
        document.body.removeChild(messageBox);
        if (onConfirm) onConfirm();
    };

    if (showCancel) {
        document.getElementById('msg-box-cancel').onclick = () => {
            document.body.removeChild(messageBox);
        };
    }
}

// --- Loading and Error Message Helpers ---
function showLoading() {
    mainContentArea.innerHTML = `<div id="loading-indicator" class="flex items-center justify-center min-h-[300px] text-indigo-600 text-lg font-semibold">Loading...</div>`;
}

function hideLoading() {
    // This function is called after content is loaded.
    // The content rendering functions (e.g., renderDashboard, renderAddresses)
    // already overwrite mainContentArea.innerHTML, effectively hiding the loading message.
    // No explicit action needed here unless you have a separate loading overlay.
}

function displayErrorMessage(message) {
    errorMessage.classList.remove('hidden');
    errorMessage.innerHTML = `<p class="text-red-600 font-semibold text-center">${message}</p>`;
    mainContentArea.innerHTML = ''; // Clear main content if an error occurs
}
