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

    // ⭐ FIXED — use correct input references
    const data = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        age: parseInt(ageInput.value),
        phone: phoneInput.value.trim(),
        address: addressInput.value.trim(),
    };

    console.log("Sending data:", data); // Debug

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

// ---------------- GET ALL USERS ----------------
getUsersBtn.addEventListener('click', async () => {
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
                </div>
            `)
            .join("");

    } catch (err) {
        showErrorText("Failed to load users");
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
