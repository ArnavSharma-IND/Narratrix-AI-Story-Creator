/* app.js — Main controller for Narratrix */

(function () {
  'use strict';

  // ── State ──
  let state = Storage.defaultState();

  // ── DOM refs ──
  const $ = id => document.getElementById(id);

  const screenCreate = $('screen-create');
  const screenStory  = $('screen-story');

  // Create form
  const formCreate      = $('form-create');
  const inputName       = $('char-name');
  const selectPersonal  = $('char-personality');
  const genreGrid       = $('genre-grid');
  const savedNotice     = $('saved-notice');
  const btnResume       = $('btn-resume');
  const btnNewStory     = $('btn-new-story');

  // Header
  const hdrName         = $('hdr-name');
  const hdrGenre        = $('hdr-genre');
  const hdrEmotion      = $('hdr-emotion');

  // Story
  const chapterLabel    = $('chapter-label');
  const storyText       = $('story-text');
  const storyDialogue   = $('story-dialogue');
  const choicesList     = $('choices-list');
  const btnGenerate     = $('btn-generate');
  const btnEmotion      = $('btn-emotion');
  const btnReset        = $('btn-reset');
  const storyPanel      = $('story-panel');

  // Chat
  const chatPanel       = $('chat-panel');
  const chatMessages    = $('chat-messages');
  const chatInput       = $('chat-input');
  const btnChatToggle   = $('btn-chat-toggle');
  const btnChatClose    = $('btn-chat-close');
  const btnSend         = $('btn-send');
  const chatCharName    = $('chat-char-name');

  // History
  const historyBar      = $('history-bar');
  const historyList     = $('history-list');
  const btnHistoryToggle = $('btn-history-toggle');

  let selectedGenre = 'fantasy';

  // ══════════════════════════════════
  //  INIT
  // ══════════════════════════════════
  function init() {
    // Genre buttons
    genreGrid.addEventListener('click', e => {
      const btn = e.target.closest('.genre-btn');
      if (!btn) return;
      genreGrid.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedGenre = btn.dataset.genre;
    });

    // Show saved notice if save exists
    if (Storage.hasSave()) {
      savedNotice.classList.remove('hidden');
    }

    formCreate.addEventListener('submit', handleCreate);
    btnResume.addEventListener('click', handleResume);
    btnNewStory.addEventListener('click', () => {
      Storage.clear();
      savedNotice.classList.add('hidden');
      inputName.value = '';
      inputName.focus();
    });

    btnGenerate.addEventListener('click', handleGenerate);
    btnEmotion.addEventListener('click', handleRandomEmotion);
    btnReset.addEventListener('click', handleReset);

    btnChatToggle.addEventListener('click', openChat);
    btnChatClose.addEventListener('click', closeChat);
    btnSend.addEventListener('click', handleSendChat);
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleSendChat();
    });

    btnHistoryToggle.addEventListener('click', () => {
      historyBar.classList.toggle('expanded');
    });
  }

  // ══════════════════════════════════
  //  CHARACTER CREATE
  // ══════════════════════════════════
  function handleCreate(e) {
    e.preventDefault();
    const name = inputName.value.trim();
    if (!name) { inputName.focus(); return; }

    state = Storage.defaultState();
    state.character = {
      name,
      personality: selectPersonal.value,
      genre: selectedGenre,
    };
    Storage.save(state);
    showStoryScreen();
    handleGenerate();
  }

  function handleResume() {
    const saved = Storage.load();
    if (!saved) return;
    state = saved;
    showStoryScreen();
    if (state.currentScene) {
      renderScene(state.currentScene, false);
    } else {
      handleGenerate();
    }
    renderHistory();
    renderEmotion();
  }

  // ══════════════════════════════════
  //  SCREEN TRANSITIONS
  // ══════════════════════════════════
  function showStoryScreen() {
    screenCreate.classList.remove('active');
    screenStory.classList.add('active');

    const char = state.character;
    hdrName.textContent  = char.name;
    hdrGenre.textContent = formatGenre(char.genre);
    chatCharName.textContent = char.name;

    renderEmotion();
  }

  function showCreateScreen() {
    screenStory.classList.remove('active');
    screenCreate.classList.add('active');
  }

  function formatGenre(g) {
    const map = {
      'fantasy':'Fantasy','sci-fi':'Sci-Fi','horror':'Horror',
      'mystery':'Mystery','romance':'Romance','western':'Western',
    };
    return map[g] || g;
  }

  // ══════════════════════════════════
  //  STORY GENERATION
  // ══════════════════════════════════
  function handleGenerate() {
    const scene = StoryEngine.generateScene(state.character);
    state.currentScene = scene;
    Storage.save(state);
    renderScene(scene, true);
  }

  function renderScene(scene, animate) {
    // Paragraphs
    storyText.innerHTML = scene.paragraphs
      .map(p => `<p>${escHtml(p)}</p>`)
      .join('');

    // Dialogue
    storyDialogue.textContent = scene.dialogue;
    storyDialogue.classList.add('visible');

    // Choices
    choicesList.innerHTML = '';
    scene.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.dataset.num = `0${i + 1}`;
      btn.textContent = choice;
      btn.addEventListener('click', () => handleChoiceClick(choice));
      choicesList.appendChild(btn);
    });

    // Chapter label
    chapterLabel.textContent = `Chapter ${toRoman(state.chapter)}`;

    if (animate) {
      const card = $('story-card');
      card.classList.remove('story-reveal');
      void card.offsetWidth;
      card.classList.add('story-reveal');
    }
  }

  function handleChoiceClick(choice) {
    // Log to history
    state.storyHistory.push({
      chapter: state.chapter,
      choice,
    });
    state.chapter++;
    Storage.save(state);
    renderHistory();

    // Random chance to update emotion on choice
    if (Math.random() > 0.55) {
      const emotion = StoryEngine.randomEmotion();
      state.emotion = `${emotion.emoji} ${emotion.label}`;
      renderEmotion();
      Storage.save(state);
    }

    handleGenerate();
  }

  // ══════════════════════════════════
  //  EMOTION
  // ══════════════════════════════════
  function handleRandomEmotion() {
    const emotion = StoryEngine.randomEmotion();
    state.emotion = `${emotion.emoji} ${emotion.label}`;
    Storage.save(state);
    renderEmotion();
  }

  function renderEmotion() {
    hdrEmotion.textContent = state.emotion || '😐 Neutral';
    hdrEmotion.classList.remove('emotion-flash');
    void hdrEmotion.offsetWidth;
    hdrEmotion.classList.add('emotion-flash');
  }

  // ══════════════════════════════════
  //  HISTORY
  // ══════════════════════════════════
  function renderHistory() {
    historyList.innerHTML = '';
    const entries = state.storyHistory.slice().reverse();
    entries.forEach((entry, i) => {
      const div = document.createElement('div');
      div.className = 'history-entry';
      div.innerHTML = `
        <span class="history-num">${toRoman(entry.chapter)}</span>
        <span class="history-choice">${escHtml(entry.choice)}</span>`;
      historyList.appendChild(div);
    });
  }

  // ══════════════════════════════════
  //  CHAT
  // ══════════════════════════════════
  function openChat() {
    chatPanel.classList.add('open');
    storyPanel.classList.add('chat-open');
    chatInput.focus();
    // Restore chat history
    if (state.chatHistory.length > 0 && chatMessages.querySelectorAll('.chat-msg').length === 0) {
      state.chatHistory.forEach(msg => {
        if (msg.role === 'user') {
          chatMessages.appendChild(ChatEngine.buildUserMsg(msg.text, 'You'));
        } else {
          chatMessages.appendChild(ChatEngine.buildCharMsg(msg.text, state.character.name));
        }
      });
      scrollChat();
    }
  }

  function closeChat() {
    chatPanel.classList.remove('open');
    storyPanel.classList.remove('chat-open');
  }

  function handleSendChat() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    // Remove intro if present
    const intro = chatMessages.querySelector('.chat-intro');
    if (intro) intro.remove();

    // User bubble
    const userBubble = ChatEngine.buildUserMsg(text, 'You');
    chatMessages.appendChild(userBubble);
    scrollChat();

    // Save user message
    state.chatHistory.push({ role: 'user', text });

    // Typing indicator
    const typing = ChatEngine.buildTypingIndicator();
    chatMessages.appendChild(typing);
    scrollChat();

    // Simulated reply delay (450–950ms)
    const delay = 450 + Math.random() * 500;
    setTimeout(() => {
      typing.remove();

      const reply = ChatEngine.pickReply(state.character.personality, text);
      const charBubble = ChatEngine.buildCharMsg(reply, state.character.name);
      chatMessages.appendChild(charBubble);
      scrollChat();

      // Save char message
      state.chatHistory.push({ role: 'char', text: reply });
      Storage.save(state);
    }, delay);
  }

  function scrollChat() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // ══════════════════════════════════
  //  RESET
  // ══════════════════════════════════
  function handleReset() {
    if (!confirm('Start a completely new story? Your current save will be lost.')) return;
    Storage.clear();
    state = Storage.defaultState();
    closeChat();
    historyBar.classList.remove('expanded');
    chatMessages.innerHTML = '<div class="chat-intro"><p>Send a message and your character will reply in their own voice.</p></div>';
    historyList.innerHTML  = '';
    showCreateScreen();
    if (Storage.hasSave()) {
      savedNotice.classList.remove('hidden');
    } else {
      savedNotice.classList.add('hidden');
    }
  }

  // ══════════════════════════════════
  //  UTILITIES
  // ══════════════════════════════════
  function toRoman(n) {
    const val = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const sym  = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let result = '';
    val.forEach((v, i) => { while (n >= v) { result += sym[i]; n -= v; } });
    return result || 'I';
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  // ── Boot ──
  init();
})();
