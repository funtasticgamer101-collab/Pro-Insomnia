// State management
let currentTab = 'nightly';
let currentEditId = null;
let currentEditType = null;

const data = {
    nightly: [],
    dreams: [],
    thoughts: []
};

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('insomniaJournal');
    if (saved) {
        const parsed = JSON.parse(saved);
        data.nightly = parsed.nightly || [];
        data.dreams = parsed.dreams || [];
        data.thoughts = parsed.thoughts || [];
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('insomniaJournal', JSON.stringify(data));
}

// Initialize app
function init() {
    loadData();
    setupEventListeners();
    renderAllEntries();
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Add buttons
    document.getElementById('addNightBtn').addEventListener('click', () => openModal('nightly'));
    document.getElementById('addDreamBtn').addEventListener('click', () => openModal('dreams'));
    document.getElementById('addThoughtBtn').addEventListener('click', () => openModal('thoughts'));

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveBtn').addEventListener('click', saveEntry);

    //