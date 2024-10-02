chrome.runtime.onInstalled.addListener(() => {
    console.log('WhatsApp Web Translator extension installed');
    chrome.storage.sync.set({ targetLanguage: 'en', autoTranslate: false });
});