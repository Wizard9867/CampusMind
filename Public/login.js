let selectedRole = "student";

function setRole(role, button) {
    selectedRole = role;

    document.querySelectorAll(".role-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");
}

async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("https://campusmind-8r5t.onrender.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {

            if (data.role !== selectedRole) {
                document.getElementById("error").innerText = "Role mismatch!";
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            if (data.role === "student") {
                window.location.href = "Students/student-dashboard.html";
            } else if (data.role === "faculty") {
                window.location.href = "facultys/facultydashboard.html";
            } else {
                window.location.href = "admin/admin-dashboard.html";
            }

        } else {
            document.getElementById("error").innerText = data.message;
        }

    } catch (err) {
        document.getElementById("error").innerText = "Server error";
    }
}