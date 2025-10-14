document.getElementById('send-button').addEventListener('click', sendMessage);

// Send message on Enter key press
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('clear-button').addEventListener('click', clearChat);

function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput === '') return;

    addMessage(`🧑‍💬 You: ${userInput}`, 'user-message');
    document.getElementById('user-input').value = ''; // Clear input field

    // Show "Peter is typing..." message
    const typingIndicator = addMessage('🕷️ Peter is typing...', 'bot-message');

    fetchResponse(userInput, typingIndicator);
}

async function fetchResponse(userMessage, typingIndicator) {
    try {
        const response = await fetch('http://localhost:5002/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        // Remove "Peter is typing..." before adding the actual response
        typingIndicator.remove();

        // Fix: Remove duplicate "Peter:" if it exists in response
        const botResponse = data.response.replace(/^Peter:\s*/i, '');

        addMessage(`🕷️ Peter: ${botResponse}`, 'bot-message');
    } catch (error) {
        console.error('Error:', error);
        typingIndicator.remove();
        addMessage('❌ Oops! Something went wrong. Try again later.', 'bot-message');
    }
}

function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = text;
    messageDiv.className = `message ${className}`;

    document.getElementById('messages').appendChild(messageDiv);

    // Auto-scroll to the latest message
    const chatbox = document.getElementById('chatbox');
    chatbox.scrollTop = chatbox.scrollHeight;

    return messageDiv; // Return the message element (useful for typing indicator)
}

function clearChat() {
    document.getElementById('messages').innerHTML = ''; // Clear chat messages
    document.getElementById('user-input').value = ''; // Reset input field

    // Show system message after clearing chat
    addMessage("🕷️ Chat cleared! Let's start again.", 'bot-message');
}
