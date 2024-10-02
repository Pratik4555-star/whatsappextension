const languages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese (Simplified)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'ur': 'Urdu',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'pl': 'Polish',
    'sv': 'Swedish',
    'fi': 'Finnish',
    'da': 'Danish',
    'no': 'Norwegian',
    'he': 'Hebrew',
    'id': 'Indonesian',
    'ms': 'Malay',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'fa': 'Persian',
    'sw': 'Swahili',
    'ta': 'Tamil',
    'te': 'Telugu'
};

function populateLanguageDropdown() {
    const targetLanguage = document.getElementById('targetLanguage');
    for (const [code, name] of Object.entries(languages)) {
        const option = new Option(name, code);
        targetLanguage.add(option);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateLanguageDropdown();

    chrome.storage.sync.get(['targetLanguage', 'autoTranslate'], (result) => {
        document.getElementById('targetLanguage').value = result.targetLanguage || 'en';
        document.getElementById('autoTranslate').checked = result.autoTranslate || false;
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
        const targetLanguage = document.getElementById('targetLanguage').value;
        const autoTranslate = document.getElementById('autoTranslate').checked;
        chrome.storage.sync.set({ targetLanguage, autoTranslate }, () => {
            console.log('Settings saved');
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "updateSettings",
                    targetLanguage,
                    autoTranslate
                });
            });
        });
    });
});