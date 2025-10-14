document.getElementById('send-jasmine').addEventListener('click', () => sendMessage('jasmine'));
document.getElementById('send-doraemon').addEventListener('click', () => sendMessage('doraemon'));
document.getElementById('send-peter').addEventListener('click', () => sendMessage('peter'));

document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        // Default to Peter Parker if no specific button is clicked
        sendMessage('peter');  
    }
});

document.getElementById('clear-button').addEventListener('click', () => clearChat());

function sendMessage(character) {
    const userInput = document.getElementById('user-input').value.trim();

    if (userInput) {
        addMessage(`You: ${userInput}`, 'user-message');
        fetchResponse(character, userInput);
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

async function fetchResponse(character, userMessage) {
    try {
        const response = await fetch('http://localhost:5000/chat', {  // Multi-character chatbot API
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ character: character, message: userMessage }),
        });

        const data = await response.json();
        addMessage(`${character.toUpperCase()}: ${data.response}`, 'bot-message');
    } catch (error) {
        addMessage('Error connecting to the bot.', 'bot-message');
    }
}

function clearChat() {
    document.getElementById('messages').innerHTML = '';
    document.getElementById('user-input').value = '';
    addMessage("Chat cleared! Let's start again.", 'bot-message');
}
