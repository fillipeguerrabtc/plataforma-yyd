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
    auroraGreeting: 'Hello! I\'m Aurora, your YYD virtual assistant. How can I help you today? 😊',
    typingPlaceholder: 'Type your message...',
    sendButton: 'Send',
    chatTitle: 'Aurora',
    chatSubtitle: 'YYD Virtual Assistant',
    auroraTyping: 'Aurora is typing...',
    
    // WhatsApp
    whatsappMessage: 'Hello! I would like to know more about YYD tours.',
  },
  pt: {
    // Navigation
    back: '← Voltar',
    home: '🏠 Home',
    
    // Aurora Chat
    auroraGreeting: 'Olá! Sou Aurora, sua assistente virtual da YYD. Como posso ajudar hoje? 😊',
    typingPlaceholder: 'Digite sua mensagem...',
    sendButton: 'Enviar',
    chatTitle: 'Aurora',
    chatSubtitle: 'Assistente Virtual YYD',
    auroraTyping: 'Aurora está digitando...',
    
    // WhatsApp
    whatsappMessage: 'Olá! Gostaria de falar sobre os tours da YYD.',
  },
  es: {
    // Navigation
    back: '← Volver',
    home: '🏠 Inicio',
    
    // Aurora Chat
    auroraGreeting: '¡Hola! Soy Aurora, tu asistente virtual de YYD. ¿Cómo puedo ayudarte hoy? 😊',
    typingPlaceholder: 'Escribe tu mensaje...',
    sendButton: 'Enviar',
    chatTitle: 'Aurora',
    chatSubtitle: 'Asistente Virtual YYD',
    auroraTyping: 'Aurora está escribiendo...',
    
    // WhatsApp
    whatsappMessage: '¡Hola! Me gustaría saber más sobre los tours de YYD.',
  },
};

export function getTranslations(lang?: Language) {
  const detectedLang = lang || getBrowserLanguage();
  return translations[detectedLang];
}
