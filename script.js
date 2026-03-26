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

// Switch tabs
function switchTab(tabName) {
    currentTab = tabName;
    
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
}

// Open modal
function openModal(type) {
    currentEditType = type;
    currentEditId = null;
    
    const modal = document.getElementById('entryModal');
    const now = new Date();
    
    // Set current date and time
    document.getElementById('entryDate').value = now.toISOString().split('T')[0];
    document.getElementById('entryTime').value = now.toTimeString().slice(0, 5);
    
    // Clear textareas
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
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('entryModal').classList.remove('active');
    currentEditId = null;
    currentEditType = null;
}

// Save entry
function saveEntry() {
    const date = document.getElementById('entryDate').value;
    const time = document.getElementById('entryTime').value;
    
    if (!date || !time) {
        alert('Please fill in date and time!');
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
        alert('Please write something!');
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
        }
    } else {
        // Add new entry
        data[currentEditType].push(entry);
    }
    
    // Sort by timestamp (newest first)
    data[currentEditType].sort((a, b) => b.timestamp - a.timestamp);
    
    saveData();
    renderEntries(currentEditType);
    closeModal();
}

// Delete entry
function deleteEntry(type, id) {
    if (confirm('Are you sure you want to delete this entry?')) {
        data[type] = data[type].filter(entry => entry.id !== id);
        saveData();
        renderEntries(type);
    }
}

// Edit entry
function editEntry(type, id) {
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

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Render entries for a specific type
function renderEntries(type) {
    const container = document.getElementById(
        type === 'nightly' ? 'nightlyEntries' :
        type === 'dreams' ? 'dreamEntries' :
        'thoughtEntries'
    );
    
    if (data[type].length === 0) {
        const emptyMessages = {
            nightly: 'No entries yet. Click "New Night Entry" when you can\'t sleep.',
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
                <span class="empty-icon">${emptyIcons[type]}</span>
                <p>${emptyMessages[type]}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data[type].map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <div class="entry-meta">
                    <span>📅 ${formatDate(entry.date)}</span>
                    <span>🕐 ${entry.time}</span>
                </div>
                <div>
                    <button class="delete-btn" onclick="editEntry('${type}',
