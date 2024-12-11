// static/js/main.js

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').checked = savedTheme === 'dark';
    updateThemeIcon(savedTheme === 'dark');
}

function updateThemeIcon(isDark) {
    const toggleText = document.querySelector('.toggle-text');
    toggleText.textContent = isDark ? '🌙' : '🌞';
}

// Chat Functions
function addMessage(text, isUser = false) {
    const chatHistory = document.getElementById('chat-history');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.textContent = text;
    chatHistory.appendChild(messageDiv);

    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function generateResponse() {
    const prompt = document.getElementById('prompt').value;
    if (!prompt.trim()) return;

    addMessage(prompt, true);

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.textContent = 'Generating response...';
    document.getElementById('chat-history').appendChild(loadingDiv);

    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: prompt,
            model: 'llama2'
        })
    })
    .then(response => response.json())
    .then(data => {
        loadingDiv.remove();
        addMessage(data.response);
    })
    .catch(error => {
        loadingDiv.remove();
        addMessage('Error: ' + error);
    });

    document.getElementById('prompt').value = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();

    // Theme toggle listener
    document.getElementById('theme-toggle').addEventListener('change', function(e) {
        const newTheme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(e.target.checked);
    });

    // Sidebar toggle listener
    document.getElementById('toggle-sidebar').addEventListener('click', function() {
        document.body.classList.toggle('sidebar-open');
    });

    // Enter key handler for chat
    document.getElementById('prompt').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateResponse();
        }
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (document.body.classList.contains('sidebar-open') &&
            !event.target.closest('.sidebar') &&
            !event.target.closest('.toggle-btn')) {
            document.body.classList.remove('sidebar-open');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const settingsItem = document.getElementById('settings-item');
    const settingsHeader = settingsItem.querySelector('.settings-header');

    settingsHeader.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent sidebar from closing
        settingsItem.classList.toggle('open');
        const submenu = settingsItem.querySelector('.settings-submenu');
        submenu.classList.toggle('hidden');
    });

    // Prevent submenu from closing when clicking inside it
    settingsItem.querySelector('.settings-submenu').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Close settings when clicking outside
    document.addEventListener('click', function(event) {
        if (!settingsItem.contains(event.target)) {
            settingsItem.classList.remove('open');
            settingsItem.querySelector('.settings-submenu').classList.add('hidden');
        }
    });

    // Your existing theme toggle code remains the same
    initializeTheme();

    document.getElementById('theme-toggle').addEventListener('change', function(e) {
        const newTheme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(e.target.checked);
    });
});