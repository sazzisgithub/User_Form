const form = document.getElementById('userForm');
const userList = document.getElementById('userList');
const getUsersBtn = document.getElementById('getUsersBtn');

// Properly select input elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");

// RENDER JSON FUNCTION
function showJSON(obj, title = 'Response Data') {
    userList.innerHTML = `
        <h3>${title}</h3>
        <pre class="json-box">${JSON.stringify(obj, null, 2)}</pre>
    `;
}

function showErrorText(text) {
    userList.innerHTML = `<p class="error">${text}</p>`;
}

// ---------------- FORM SUBMIT ----------------
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        age: parseInt(ageInput.value),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
    };

    console.log("Sending data:", data);

    try {
        const res = await fetch('http://127.0.0.1:8000/api/submit/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const body = await res.json();
        showJSON(body, 'Submission Response');

        if (res.ok) {
            alert("Form submitted successfully!");
            form.reset();
        }
    } catch (err) {
        showErrorText("Network error! Check your server.");
    }
});

// ---------------- SEARCH USER BY ID ----------------
async function searchUserById() {
    const userId = document.getElementById('searchUserId').value.trim();
    if (!userId) {
        alert("Enter a User ID");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${userId}/`);
        const body = await res.json();

        if (res.ok) {
            showJSON(body, `User Details (ID: ${userId})`);
        } else {
            showJSON(body, "Error");
        }
    } catch (err) {
        showErrorText("Failed to fetch user");
    }
}

// --- helper to call verify/reject endpoints ---
async function postVerificationAction(userId, action, payload) {
    // action = 'verify' or 'reject'
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${userId}/${action}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const body = await res.json();
        return { ok: res.ok, body };
    } catch (err) {
        return { ok: false, body: { error: 'Network error' } };
    }
}

// --- called when Verify button clicked ---
async function verifyUser(userId) {
    const verifier = prompt("Enter your name (verifier):");
    if (!verifier) {
        alert("Verification cancelled (verifier required).");
        return;
    }

    const { ok, body } = await postVerificationAction(userId, 'verify', { verifier });

    if (ok) {
        alert(`User ${userId} verified by ${verifier}.`);
        getAllUsers();

    } else {
        showJSON(body, 'Verification Error');
    }
}
// --- called when Reject button clicked ---
async function rejectUser(userId) {
    const verifier = prompt("Enter your name (verifier):");
    if (!verifier) {
        alert("Rejection cancelled (verifier required).");
        return;
    }
    const reason = prompt("Optional reason for rejection (press OK to skip):", "");

    const { ok, body } = await postVerificationAction(userId, 'reject', { verifier, reason });

    if (ok) {
        alert(`User ${userId} rejected by ${verifier}.`);
        getAllUsers();
    } else {
        showJSON(body, 'Rejection Error');
    }
}

// --- modify the existing Get All Users rendering to include buttons ---
async function getAllUsers() {
    try {
        const res = await fetch('http://127.0.0.1:8000/api/users/');
        const users = await res.json();

        if (!users.length) {
            userList.innerHTML = "<p>No users found.</p>";
            return;
        }

        userList.innerHTML = "<h3>All Users</h3>" + users
            .map(u => `
                <div style="background:#fff;padding:10px;margin:5px;border-radius:5px;">
                    <b>${u.name}</b> (${u.age})<br>
                    <b>UserID:</b> ${u.userId}<br>
                    Email: ${u.email}<br>
                    Phone: ${u.phone}<br>
                    Address: ${u.address}<br>
                    <div style="margin-top:8px; display: flex; display-direction: row;">
                        <button onclick="verifyUser('${u.userId}')" style="background: #28a745; padding:6px 12px;margin-right:6px;">Verify</button>
                        <button onclick="rejectUser('${u.userId}')" style="background: #0508c7ff; padding:6px 12px; margin-right:6px;">Reject</button>
                        <button onclick="deleteUser('${u.userId}')" style="background: #df0707ff; padding:6px 12px; color:white;">Delete</button>
                    </div>
                </div>
            `)
            .join("");

    } catch (err) {
        showErrorText("Failed to load users");
    }
}

async function deleteUser(userId) {
    if (!confirm(`Are you sure you want to delete ${userId}?`)) return;

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/user/${userId}/delete/`, {
            method: "DELETE"
        });

        const msg = await res.json();

        if (res.ok) {
            alert("User deleted successfully!");
            getAllUsers();
        } else {
            showJSON(msg, "Delete Error");
        }
    } catch (err) {
        showErrorText("Delete failed. Server error.");
    }
}

const filterSelect = document.getElementById("filterSelect");
const applyFilterBtn = document.getElementById("applyFilterBtn");

applyFilterBtn.addEventListener("click", async () => {
    const selected = filterSelect.value;

    if (!selected) {
        alert("Please select a filter.");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/users/?type=${selected}`);
        const data = await res.json();

        let titleText = "";

        if (selected === "user") titleText = "All Users";
        if (selected === "verified") titleText = "Verified Users";
        if (selected === "rejected") titleText = "Rejected Users";

        renderFilteredUsers(data, titleText);

    } catch (error) {
        console.error("Error:", error);
        showErrorText("Failed to apply filter.");
    }
});


function renderFilteredUsers(items, title) {
    console.log("FILTER DATA:", items);


    if (!items.length) {
        userList.innerHTML = `<p>No ${title} users found.</p>`;
        return;
    }

    userList.innerHTML = `<h3>${title}</h3>` + items.map(v => {
        const u = v.user || v; // for ALL USERS v = user directly
        const verification = v.verification || v; 
        return `
        <div style="background:#fff;padding:10px;margin:5px;border-radius:5px;">
            <b>${u.name}</b> (${u.age})<br>
            <b>UserID:</b> ${u.userId}<br>
            Email: ${u.email}<br>
            Phone: ${u.phone}<br>
            Address: ${u.address}<br>
            
            ${verification.verifier ? `Verified/Rejected By: ${verification.verifier}<br>` : ""}
            ${verification.status ? `Status: ${verification.status}<br>` : ""}
            ${verification.reason ? `Reason: ${verification.reason}<br>` : ""}
            ${verification.timestamp ? `Date: ${new Date(verification.timestamp).toLocaleString()}<br>` : ""}


            <!-- SAME BUTTONS LIKE ALL USERS -->
            <div style="margin-top:8px; display: flex; display-direction: row;">
                <button onclick="verifyUser('${u.userId}')" 
                    style="background: #28a745; padding:6px 12px;margin-right:6px;">Verify</button>

                <button onclick="rejectUser('${u.userId}')" 
                    style="background: #0508c7; padding:6px 12px;margin-right:6px;">Reject</button>

                <button onclick="deleteUser('${u.userId}')" 
                    style="background: #df0707; padding:6px 12px;color:white;">Delete</button>
            </div>
        </div>
        `;
    }).join("");
}
