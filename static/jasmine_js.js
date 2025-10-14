document.getElementById('send-button').addEventListener('click', () => {
    sendMessage();
});

document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('clear-button').addEventListener('click', () => {
    clearChat();
});

function sendMessage() {
    const userInput = document.getElementById('user-input').value;
    if (userInput.trim()) {
        addMessage(userInput, 'user-message');
        fetchResponse(userInput);
        document.getElementById('user-input').value = '';
    }
}

function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    messageDiv.className = `message ${className}`;
    document.getElementById('messages').appendChild(messageDiv);
    document.getElementById('chatbox').scrollTop = document.getElementById('chatbox').scrollHeight;
}

async function fetchResponse(userMessage) {
    try {
        const response = await fetch('http://localhost:5000/chat', {  // Jasmine's Flask API
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await response.json();
        addMessage(data.response, 'bot-message');
    } catch (error) {
        addMessage('Error connecting to the bot.', 'bot-message');
    }
}

function clearChat() {
    document.getElementById('messages').innerHTML = '';
    document.getElementById('user-input').value = '';
    addMessage("Chat cleared! Let's start again.", 'bot-message');
}
