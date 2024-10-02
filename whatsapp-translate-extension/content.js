// content.js
let targetLanguage = 'en';
let autoTranslate = false;

chrome.storage.sync.get(['targetLanguage', 'autoTranslate'], (result) => {
    targetLanguage = result.targetLanguage || 'en';
    autoTranslate = result.autoTranslate || false;
    initializeTranslation();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateSettings") {
        targetLanguage = request.targetLanguage;
        autoTranslate = request.autoTranslate;
        translateAllMessages();
    }
});

async function translateText(text, targetLang) {
    try {
        const response = await fetch("https://libretranslate.de/translate", {
            method: "POST",
            body: JSON.stringify({
                q: text,
                source: "auto",
                target: targetLang
            }),
            headers: { "Content-Type": "application/json" }
        });

        const result = await response.json();
        return result.translatedText;
    } catch (error) {
        console.error('Translation error:', error);
        return 'Translation error';
    }
}

async function translateMessage(messageElement) {
    if (messageElement.hasAttribute('data-translated')) return;

    const textElement = messageElement.querySelector('span.selectable-text');
    if (textElement) {
        const originalText = textElement.textContent;
        const translatedText = await translateText(originalText, targetLanguage);

        const translatedElement = document.createElement('div');
        translatedElement.className = 'translated-text';
        translatedElement.textContent = translatedText;

        messageElement.appendChild(translatedElement);
        messageElement.setAttribute('data-translated', 'true');
    }
}

function translateAllMessages() {
    const messages = document.querySelectorAll('div.message-in, div.message-out');
    messages.forEach(translateMessage);
}

function initializeTranslation() {
    translateAllMessages();

    // Create a mutation observer to watch for new messages
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE &&
                        (node.classList.contains('message-in') || node.classList.contains('message-out'))) {
                        if (autoTranslate) {
                            translateMessage(node);
                        }
                    }
                });
            }
        });
    });

    // Start observing the chat container
    const chatContainer = document.querySelector('div.two > div > div > div.copyable-area');
    if (chatContainer) {
        observer.observe(chatContainer, { childList: true, subtree: true });
    }
}

// Add custom styles
const style = document.createElement('style');
style.textContent = `
  .translated-text {
    font-style: italic;
    color: #888;
    margin-top: 5px;
    padding: 5px;
    background-color: #f0f0f0;
    border-radius: 5px;
  }
`;
document.head.appendChild(style);

// Initialize translation when the page is fully loaded
window.addEventListener('load', initializeTranslation);

// Re-run translation when chat changes (e.g., user switches to a different chat)
setInterval(() => {
    const chatTitle = document.querySelector('div.chat-title');
    if (chatTitle && chatTitle.textContent !== window.lastChatTitle) {
        window.lastChatTitle = chatTitle.textContent;
        setTimeout(translateAllMessages, 1000); // Wait a bit for messages to load
    }
}, 1000);