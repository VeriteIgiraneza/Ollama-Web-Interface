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
function formatTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function addMessage(text, isUser = false) {
    const chatHistory = document.getElementById('chat-history');

    // Create wrapper div
    const messageWrapper = document.createElement('div');
    messageWrapper.className = 'message-wrapper';

    // Create message div
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.textContent = text;

    // Create timestamp div
    const timestamp = document.createElement('div');
    timestamp.className = 'timestamp';
    timestamp.textContent = formatTimestamp();

    // Add elements to wrapper
    if (isUser) {
        messageWrapper.appendChild(messageDiv);
        messageWrapper.appendChild(timestamp);
    } else {
        messageWrapper.appendChild(timestamp);
        messageWrapper.appendChild(messageDiv);
    }

    chatHistory.appendChild(messageWrapper);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function generateResponse() {
    const prompt = document.getElementById('prompt').value;
    if (!prompt.trim()) return;

    // Record start time
    const startTime = new Date();
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
        // Calculate response time
        const endTime = new Date();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        addMessage(`${data.response}\n\n${responseTime}s`);
    })
    .catch(error => {
        loadingDiv.remove();
        addMessage('Error: ' + error);
    });

    document.getElementById('prompt').value = '';
}

// Chat History Management
let currentChatId = localStorage.getItem('currentChatId') || Date.now().toString();
let allChats = JSON.parse(localStorage.getItem('allChats')) || {};

function saveChat(messageObj) {
    let currentChat = allChats[currentChatId] || [];
    currentChat.push(messageObj);
    allChats[currentChatId] = currentChat;
    localStorage.setItem('allChats', JSON.stringify(allChats));
    localStorage.setItem('currentChatId', currentChatId);
}

function clearAllChats() {
    allChats = {};
    localStorage.setItem('allChats', JSON.stringify(allChats));
    document.getElementById('chat-history').innerHTML = '';
}

function toggleChatHistory() {
    const existingModal = document.querySelector('.chat-modal');
    if (existingModal) {
        existingModal.remove();
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'chat-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'chat-modal-content';

    const header = document.createElement('div');
    header.className = 'chat-modal-header';

    const title = document.createElement('h3');
    title.textContent = 'Chat History';

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear History';
    clearButton.onclick = clearAllChats;

    header.appendChild(title);
    header.appendChild(clearButton);
    modalContent.appendChild(header);

    const messagesList = document.createElement('div');
    messagesList.className = 'chat-messages-list';

    const history = Object.values(allChats).flat();
    history.forEach(message => {
        const messageItem = document.createElement('div');
        messageItem.className = `chat-history-item ${message.role === 'user' ? 'user' : 'ai'}`;

        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = message.text;

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = message.timestamp;

        messageItem.appendChild(messageText);
        messageItem.appendChild(messageTime);
        messagesList.appendChild(messageItem);
    });

    modalContent.appendChild(messagesList);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
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