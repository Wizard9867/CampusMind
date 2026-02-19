document.addEventListener("DOMContentLoaded", function () {

    const KEY = "studentCollections";
    let currentCollectionIndex = null;

    function getData() {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    }

    function saveData(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    /* ================= RENDER ================= */

    function renderCollections() {

        const grid = document.getElementById("collectionsGrid");
        if (!grid) return;

        const data = getData();

        grid.innerHTML = `
            <div class="collection-card create-card" onclick="openCreateModal()">
                + Create New Collection
            </div>
        `;

        data.forEach((collection, index) => {

            let resourcesHTML = "";

            collection.resources.forEach((res, i) => {
                resourcesHTML += `
                    <div class="card" style="margin-top:10px;">
                        <strong>${res.title}</strong><br>
                        <small>${res.fileName}</small><br>
                        <small>${res.date}</small>
                    </div>
                `;
            });

            grid.innerHTML += `
                <div class="collection-card">
                    <h3>${collection.title}</h3>
                    <p>${collection.desc}</p>
                    <small>${collection.date}</small>
                    <br><br>

                    <button class="primary-btn"
                        onclick="openUploadModal(${index})">
                        Upload Resource
                    </button>

                    <button class="secondary-btn"
                        onclick="deleteCollection(${index})">
                        Delete
                    </button>

                    ${resourcesHTML}
                </div>
            `;
        });
    }

    /* ================= CREATE COLLECTION ================= */

    window.openCreateModal = function () {
        document.getElementById("createModal").style.display = "flex";
    };

    window.closeCreateModal = function () {
        document.getElementById("createModal").style.display = "none";
    };

    window.saveCollection = function () {

        const title = document.getElementById("collectionTitle").value;
        const desc = document.getElementById("collectionDesc").value;

        if (!title) return;

        const data = getData();

        data.push({
            title: title,
            desc: desc,
            date: new Date().toLocaleDateString(),
            resources: []
        });

        saveData(data);
        closeCreateModal();
        renderCollections();
    };

    /* ================= UPLOAD RESOURCE ================= */

    window.openUploadModal = function (index) {
        currentCollectionIndex = index;
        document.getElementById("uploadModal").style.display = "flex";
    };

    window.closeUploadModal = function () {
        document.getElementById("uploadModal").style.display = "none";
    };

    window.saveResource = function () {

        const title = document.getElementById("resourceTitle").value;
        const fileInput = document.getElementById("resourceFile");

        if (!title || fileInput.files.length === 0) return;

        const file = fileInput.files[0];

        const data = getData();

        data[currentCollectionIndex].resources.push({
            title: title,
            fileName: file.name,
            date: new Date().toLocaleDateString()
        });

        saveData(data);
        closeUploadModal();
        renderCollections();
    };

    /* ================= DELETE COLLECTION ================= */

    window.deleteCollection = function (index) {

        const data = getData();
        data.splice(index, 1);
        saveData(data);
        renderCollections();
    };

    renderCollections();
});
/* ================= SEARCH ================= */

window.searchResources = function () {

    const query = document.getElementById("searchInput").value.toLowerCase();
    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;

    const sampleData = [
        { title: "AI Lecture 1", topic: "AI", type: "PDF" },
        { title: "Linear Algebra Notes", topic: "Math", type: "PDF" },
        { title: "Physics Lab Demo", topic: "Physics", type: "Video" },
        { title: "Machine Learning PPT", topic: "AI", type: "PPT" }
    ];

    const checkboxes = document.querySelectorAll(".filter-panel input[type='checkbox']");
    const selectedFilters = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    let filtered = sampleData.filter(item =>
        item.title.toLowerCase().includes(query)
    );

    if (selectedFilters.length > 0) {
        filtered = filtered.filter(item =>
            selectedFilters.includes(item.topic) ||
            selectedFilters.includes(item.type)
        );
    }

    resultsContainer.innerHTML = "";

    filtered.forEach(item => {
        resultsContainer.innerHTML += `
            <div class="card">
                <h3>${item.title}</h3>
                <p>${item.topic} | ${item.type}</p>
                <br>
                <button class="primary-btn">View</button>
            </div>
        `;
    });
};
/* ================= PROFILE ================= */

const PROFILE_KEY = "studentProfile";

function getProfile() {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {
        name: "Alex Johnson",
        email: "alex@email.com",
        phone: "+91 9876543210",
        gpa: "3.8",
        credits: "72"
    };
}

function saveProfileData(data) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
}

function renderProfile() {
    const data = getProfile();

    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const phoneEl = document.getElementById("profilePhone");
    const gpaEl = document.getElementById("profileGPA");
    const creditsEl = document.getElementById("profileCredits");

    if (!nameEl) return;

    nameEl.innerText = data.name;
    emailEl.innerText = data.email;
    phoneEl.innerText = data.phone;
    gpaEl.innerText = data.gpa;
    creditsEl.innerText = data.credits;
}

window.openEditModal = function () {
    const data = getProfile();

    document.getElementById("editName").value = data.name;
    document.getElementById("editEmail").value = data.email;
    document.getElementById("editPhone").value = data.phone;
    document.getElementById("editGPA").value = data.gpa;
    document.getElementById("editCredits").value = data.credits;

    document.getElementById("editModal").style.display = "flex";
};

window.closeEditModal = function () {
    document.getElementById("editModal").style.display = "none";
};

window.saveProfile = function () {
    const updated = {
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        phone: document.getElementById("editPhone").value,
        gpa: document.getElementById("editGPA").value,
        credits: document.getElementById("editCredits").value
    };

    saveProfileData(updated);
    closeEditModal();
    renderProfile();
};

renderProfile();

/* ================= CHART ================= */

function renderChart() {

    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Study Hours',
                data: [12, 19, 8, 15, 22, 30],
                borderColor: '#9d4edd',
                backgroundColor: 'rgba(157, 78, 221, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: { color: 'white' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

renderChart();

