// ============================================
// STATE MANAGEMENT
// ============================================
let currentTab = 'nightly';
let currentEditId = null;
let currentEditType = null;

const data = {
    nightly: [],
    dreams: [],
    thoughts: []
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌙 Insomnia Journal Loaded');
    
    loadData();
    setupEventListeners();
    renderEntries('nightly');
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js?v=5.0')
            .then(reg => console.log('✅ Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
});

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Add entry buttons
    document.getElementById('addNightBtn').addEventListener('click', () => openModal('nightly'));
    document.getElementById('addDreamBtn').addEventListener('click', () => openModal('dreams'));
    document.getElementById('addThoughtBtn').addEventListener('click', () => openModal('thoughts'));

    // Modal controls
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('saveBtn').addEventListener('click', saveEntry);

    // Modal backdrop click
    document.getElementById('entryModal').addEventListener('click', function(e) {
        if (e.target === this || e.target === document.querySelector('.modal-backdrop')) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ============================================
// DATA MANAGEMENT
// ============================================
function loadData() {
    const saved = localStorage.getItem('insomniaJournal');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            data.nightly = parsed.nightly || [];
            data.dreams = parsed.dreams || [];
            data.thoughts = parsed.thoughts || [];
            console.log('✅ Data loaded from localStorage');
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
}

function saveData() {
    localStorage.setItem('insomniaJournal', JSON.stringify(data));
    console.log('💾 Data saved to localStorage');
}

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabName) {
    currentTab = tabName;
    console.log(`📑 Switched to ${tabName} tab`);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Render entries for this tab
    renderEntries(tabName);
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(type) {
    console.log(`🔓 Opening modal for ${type}`);
    
    currentEditType = type;
    currentEditId = null;
    
    const modal = document.getElementById('entryModal');
    const now = new Date();
    
    // Set current date and time
    document.getElementById('entryDate').value = now.toISOString().split('T')[0];
    document.getElementById('entryTime').value = now.toTimeString().slice(0, 5);
    
    // Clear all textareas
    document.getElementById('entryDetails').value = '';
    document.getElementById('dreamDetails').value = '';
    document.getElementById('thoughtDetails').value = '';
    
    // Show/hide appropriate fields
    document.getElementById('nightlyDetailsGroup').style.display = type === 'nightly' ? 'block' : 'none';
    document.getElementById('dreamDetailsGroup').style.display = type === 'dreams' ? 'block' : 'none';
    document.getElementById('thoughtDetailsGroup').style.display = type === 'thoughts' ? 'block' : 'none';
    
    // Set modal title
    const titles = {
        nightly: '🌃 New Night Entry',
        dreams: '💭 New Dream Entry',
        thoughts: '💜 New Thought Entry'
    };
    document.getElementById('modalTitle').textContent = titles[type];
    
    // Show modal
    modal.classList.add('active');
}

function closeModal() {
    console.log('🔒 Closing modal');
    document.getElementById('entryModal').classList.remove('active');
    currentEditId = null;
    currentEditType = null;
}

// ============================================
// ENTRY MANAGEMENT
// ============================================
function saveEntry() {
    const date = document.getElementById('entryDate').value;
    const time = document.getElementById('entryTime').value;
    
    if (!date || !time) {
        alert('⚠️ Please fill in date and time!');
        return;
    }
    
    let details = '';
    if (currentEditType === 'nightly') {
        details = document.getElementById('entryDetails').value;
    } else if (currentEditType === 'dreams') {
        details = document.getElementById('dreamDetails').value;
    } else if (currentEditType === 'thoughts') {
        details = document.getElementById('thoughtDetails').value;
    }
    
    if (!details.trim()) {
        alert('⚠️ Please write something!');
        return;
    }
    
    const entry = {
        id: currentEditId || Date.now(),
        date,
        time,
        details,
        timestamp: new Date(`${date}T${time}`).getTime()
    };
    
    if (currentEditId) {
        // Update existing entry
        const index = data[currentEditType].findIndex(e => e.id === currentEditId);
        if (index !== -1) {
            data[currentEditType][index] = entry;
            console.log(`✏️ Updated entry ${currentEditId}`);
        }
    } else {
        // Add new entry
        data[currentEditType].push(entry);
        console.log(`✨ Created new ${currentEditType} entry`);
    }
    
    // Sort by timestamp (newest first)
    data[currentEditType].sort((a, b) => b.timestamp - a.timestamp);
    
    saveData();
    renderEntries(currentEditType);
    closeModal();
}

function deleteEntry(type, id) {
    if (confirm('🗑️ Are you sure you want to delete this entry?')) {
        data[type] = data[type].filter(entry => entry.id !== id);
        saveData();
        renderEntries(type);
        console.log(`🗑️ Deleted entry ${id}`);
    }
}

function editEntry(type, id) {
    console.log(`✏️ Editing entry ${id}`);
    
    const entry = data[type].find(e => e.id === id);
    if (!entry) return;
    
    currentEditType = type;
    currentEditId = id;
    
    const modal = document.getElementById('entryModal');
    
    // Set values
    document.getElementById('entryDate').value = entry.date;
    document.getElementById('entryTime').value = entry.time;
    
    // Show/hide appropriate fields and set content
    document.getElementById('nightlyDetailsGroup').style.display = type === 'nightly' ? 'block' : 'none';
    document.getElementById('dreamDetailsGroup').style.display = type === 'dreams' ? 'block' : 'none';
    document.getElementById('thoughtDetailsGroup').style.display = type === 'thoughts' ? 'block' : 'none';
    
    if (type === 'nightly') {
        document.getElementById('entryDetails').value = entry.details;
    } else if (type === 'dreams') {
        document.getElementById('dreamDetails').value = entry.details;
    } else if (type === 'thoughts') {
        document.getElementById('thoughtDetails').value = entry.details;
    }
    
    // Set modal title
    const titles = {
        nightly: '🌃 Edit Night Entry',
        dreams: '💭 Edit Dream Entry',
        thoughts: '💜 Edit Thought Entry'
    };
    document.getElementById('modalTitle').textContent = titles[type];
    
    modal.classList.add('active');
}

// ============================================
// RENDERING
// ============================================
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function renderEntries(type) {
    const container = document.getElementById(
        type === 'nightly' ? 'nightlyEntries' :
        type === 'dreams' ? 'dreamEntries' :
        'thoughtEntries'
    );
    
    if (data[type].length === 0) {
        const emptyMessages = {
            nightly: 'No entries yet. Click "New Entry" when you can\'t sleep.',
            dreams: 'No dream entries yet. Record your dreams here.',
            thoughts: 'No thought entries yet. Share what\'s on your mind.'
        };
        const emptyIcons = {
            nightly: '🌙',
            dreams: '💭',
            thoughts: '💜'
        };
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-illustration">
                    <span class="empty-icon">${emptyIcons[type]}</span>
                    <div class="stars">
                        <span>✨</span>
                        <span>⭐</span>
                        <span>✨</span>
                    </div>
                </div>
                <p class="empty-text">No entries yet</p>
                <p class="empty-subtext">${emptyMessages[type]}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data[type].map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <div class="entry-meta">
                    <span class="entry-date">📅 ${formatDate(entry.date)}</span>
                    <span class="entry-time">🕐 ${entry.time}</span>
                </div>
                <div class="entry-actions">
                    <button class="entry-btn edit-btn" onclick="editEntry('${type}', ${entry.id})" title="Edit">✏️</button>
                    <button class="entry-btn delete-btn" onclick="deleteEntry('${type}', ${entry.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="entry-content">
                <p class="entry-text">${escapeHtml(entry.details)}</p>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('✅ Script loaded successfully');
        
