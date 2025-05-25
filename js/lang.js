// Список поддерживаемых языков
const supportedLangs = ['ru', 'uk', 'de', 'en', 'fr'];
const defaultLang = 'en';

function detectLang() {
  // 1. Проверяем localStorage (ручной выбор)
  let lang = localStorage.getItem('lang');
  if (lang && supportedLangs.includes(lang)) return lang;

  // 2. Автоматический выбор по языку браузера
  const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().substr(0,2);
  if (supportedLangs.includes(navLang)) return navLang;

  // 3. Если не найден — английский
  return defaultLang;
}

let translations = {};
let translationsEn = {};

function setLang(lang) {
  // Если не поддерживается — fallback на английский
  if (!supportedLangs.includes(lang)) lang = defaultLang;

  // Обновляем селектор языка
  document.getElementById('language-select').value = lang;

  // Грузим английский — всегда как fallback
  fetch('lang/en.json')
    .then(resp => resp.json())
    .then(enData => {
      translationsEn = enData;
      // Грузим основной язык
      if (lang !== 'en') {
        fetch(`lang/${lang}.json`)
          .then(resp => resp.json())
          .then(data => {
            translations = data;
            applyTranslations();
          })
          .catch(() => {
            translations = {};
            applyTranslations();
          });
      } else {
        translations = enData;
        applyTranslations();
      }
    });
  // Сохраняем выбор пользователя
  localStorage.setItem('lang', lang);
}

function translate(key) {
  // Берём из текущего языка, иначе fallback на английский
  return translations[key] || translationsEn[key] || '';
}

function applyTranslations() {
  // Все элементы с data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    // Если у элемента есть data-i18n-html — вставляем как HTML, иначе как текст
    if (el.hasAttribute('data-i18n-html') || /<.+>/.test(translate(key))) {
      el.innerHTML = translate(key);
    } else {
      el.textContent = translate(key);
    }
  });
}

// Обработка смены языка вручную
document.addEventListener('DOMContentLoaded', function() {
  const langSel = document.getElementById('language-select');
  // инициализация языка
  setLang(detectLang());
  if (langSel) {
    langSel.addEventListener('change', function() {
      setLang(this.value);
    });
  }
});
