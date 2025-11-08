// Notes App JavaScript

let notes = [];
let currentNoteId = null;
let searchTerm = '';

// DOM Elements
const notesGrid = document.getElementById('notesGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const newNoteButton = document.getElementById('newNoteButton');
const modalOverlay = document.getElementById('modalOverlay');
const closeButton = document.getElementById('closeButton');
const cancelButton = document.getElementById('cancelButton');
const saveButton = document.getElementById('saveButton');
const deleteButton = document.getElementById('deleteButton');
const noteTitleInput = document.getElementById('noteTitleInput');
const noteContentInput = document.getElementById('noteContentInput');
const modalTitle = document.getElementById('modalTitle');

// Load notes from localStorage
function loadNotes() {
    const savedNotes = localStorage.getItem('jjnNotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
    } else {
        notes = [];
    }
    renderNotes();
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('jjnNotes', JSON.stringify(notes));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) {
        return 'Just now';
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Filter notes by search term
function filterNotes() {
    if (!searchTerm.trim()) {
        return notes;
    }
    const term = searchTerm.toLowerCase();
    return notes.filter(note => 
        note.title.toLowerCase().includes(term) || 
        note.content.toLowerCase().includes(term)
    );
}

// Render notes
function renderNotes() {
    const filteredNotes = filterNotes();
    
    if (filteredNotes.length === 0) {
        notesGrid.style.display = 'none';
        emptyState.classList.add('show');
    } else {
        notesGrid.style.display = 'grid';
        emptyState.classList.remove('show');
    }
    
    // Sort notes by date (newest first)
    const sortedNotes = [...filteredNotes].sort((a, b) => b.timestamp - a.timestamp);
    
    notesGrid.innerHTML = sortedNotes.map(note => `
        <div class="note-card" data-id="${note.id}">
            <div class="note-card-title">${escapeHtml(note.title || 'Untitled')}</div>
            <div class="note-card-content">${escapeHtml(note.content || '')}</div>
            <div class="note-card-date">${formatDate(note.timestamp)}</div>
        </div>
    `).join('');
    
    // Add click listeners
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            openNote(id);
        });
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Open note for editing
function openNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    
    currentNoteId = id;
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    modalTitle.textContent = 'Edit Note';
    deleteButton.style.display = 'block';
    showModal();
}

// Create new note
function createNewNote() {
    currentNoteId = null;
    noteTitleInput.value = '';
    noteContentInput.value = '';
    modalTitle.textContent = 'New Note';
    deleteButton.style.display = 'none';
    showModal();
    noteTitleInput.focus();
}

// Save note
function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (!title && !content) {
        alert('Please enter a title or content for your note.');
        return;
    }
    
    if (currentNoteId) {
        // Update existing note
        const note = notes.find(n => n.id === currentNoteId);
        if (note) {
            note.title = title || 'Untitled';
            note.content = content;
            note.timestamp = Date.now();
        }
    } else {
        // Create new note
        const newNote = {
            id: generateId(),
            title: title || 'Untitled',
            content: content,
            timestamp: Date.now()
        };
        notes.push(newNote);
    }
    
    saveNotes();
    renderNotes();
    hideModal();
}

// Delete note
function deleteNote() {
    if (!currentNoteId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        notes = notes.filter(n => n.id !== currentNoteId);
        saveNotes();
        renderNotes();
        hideModal();
    }
}

// Show modal
function showModal() {
    modalOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Hide modal
function hideModal() {
    modalOverlay.classList.remove('show');
    document.body.style.overflow = '';
    currentNoteId = null;
}

// Event Listeners
newNoteButton.addEventListener('click', createNewNote);

closeButton.addEventListener('click', hideModal);
cancelButton.addEventListener('click', hideModal);

saveButton.addEventListener('click', saveNote);
deleteButton.addEventListener('click', deleteNote);

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        hideModal();
    }
});

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    renderNotes();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        createNewNote();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
        hideModal();
    }
    
    // Ctrl/Cmd + S to save (when modal is open)
    if ((e.ctrlKey || e.metaKey) && e.key === 's' && modalOverlay.classList.contains('show')) {
        e.preventDefault();
        saveNote();
    }
});

// Initialize
loadNotes();

