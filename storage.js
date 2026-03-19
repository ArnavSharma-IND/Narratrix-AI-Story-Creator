/* storage.js — localStorage wrapper for Narratrix */

const Storage = (() => {
  const KEY = 'narratrix_save';

  const defaultState = () => ({
    character: null,
    currentScene: null,
    chatHistory: [],
    storyHistory: [],
    chapter: 1,
    emotion: 'Neutral',
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Narratrix: failed to load save.', e);
      return null;
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Narratrix: failed to save state.', e);
    }
  }

  function clear() {
    localStorage.removeItem(KEY);
  }

  function hasSave() {
    return !!localStorage.getItem(KEY);
  }

  return { load, save, clear, hasSave, defaultState };
})();
