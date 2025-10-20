/**
 * Detecção de idioma do navegador e traduções
 */

export type Language = 'en' | 'pt' | 'es';

export function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('es')) return 'es';
  return 'en';
}

export const translations = {
  en: {
    // Navigation
    back: '← Back',
    home: '🏠 Home',
    
    // Aurora Chat
    auroraGreeting: 'Hi! I\'m Aurora 😊 How can I help you with your tour to Sintra or Cascais?',
    typingPlaceholder: 'Type your message...',
    sendButton: 'Send',
    chatTitle: 'Aurora',
    chatSubtitle: 'Your YYD Tour Expert',
    auroraTyping: 'Aurora is typing...',
    
    // WhatsApp
    whatsappMessage: 'Hello! I would like to know more about YYD tours.',
  },
  pt: {
    // Navigation
    back: '← Voltar',
    home: '🏠 Home',
    
    // Aurora Chat
    auroraGreeting: 'Oi! Sou Aurora 😊 Como posso te ajudar com seu tour em Sintra ou Cascais?',
    typingPlaceholder: 'Digite sua mensagem...',
    sendButton: 'Enviar',
    chatTitle: 'Aurora',
    chatSubtitle: 'Sua Especialista em Tours YYD',
    auroraTyping: 'Aurora está digitando...',
    
    // WhatsApp
    whatsappMessage: 'Olá! Gostaria de falar sobre os tours da YYD.',
  },
  es: {
    // Navigation
    back: '← Volver',
    home: '🏠 Inicio',
    
    // Aurora Chat
    auroraGreeting: '¡Hola! Soy Aurora 😊 ¿Cómo puedo ayudarte con tu tour a Sintra o Cascais?',
    typingPlaceholder: 'Escribe tu mensaje...',
    sendButton: 'Enviar',
    chatTitle: 'Aurora',
    chatSubtitle: 'Tu Experta en Tours YYD',
    auroraTyping: 'Aurora está escribiendo...',
    
    // WhatsApp
    whatsappMessage: '¡Hola! Me gustaría saber más sobre los tours de YYD.',
  },
};

export function getTranslations(lang?: Language) {
  const detectedLang = lang || getBrowserLanguage();
  return translations[detectedLang];
}
