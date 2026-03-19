/* chat.js — Personality-driven character chat for Narratrix */

const ChatEngine = (() => {

  // ── Personality Reply Banks ──
  const REPLIES = {
    brave: {
      greetings: [
        "You dare speak to me? Bold. I respect that.",
        "Speak plainly. I have no time for riddles or pleasantries.",
        "Good. I was beginning to think no one would.",
      ],
      agreements: [
        "That is exactly what I would have done. No hesitation.",
        "Finally — someone who understands what courage actually costs.",
        "You have the right spirit. Let's act on it before wisdom catches up.",
      ],
      disagreements: [
        "Wrong. Fear is a luxury we can't afford right now.",
        "I hear you. And I disagree. We push forward.",
        "That's the cautious path. I've buried friends who took the cautious path.",
      ],
      questions: [
        "Ask what you must. I'll answer honestly, even if the truth is hard.",
        "A fair question. Here's a fair answer — as long as you can handle it.",
        "You want the truth? I've never been good at anything else.",
      ],
      unknown: [
        "I don't know. And that bothers me more than I'll admit.",
        "Some things lie beyond even my reach. But not many.",
        "An interesting puzzle. I'll break it like I break all the others.",
      ],
    },

    cunning: {
      greetings: [
        "Ah. You've come to me. How deliciously predictable.",
        "I wondered when you'd find me. I've been waiting, of course.",
        "What a pleasant surprise. I knew it would happen, but pleasant nonetheless.",
      ],
      agreements: [
        "You're sharper than you look. I mean that as the compliment it is.",
        "Exactly so. And now that you see it — what will you do with the knowledge?",
        "Mmm. Agreement. Let's not make a habit of it — it would ruin my reputation.",
      ],
      disagreements: [
        "Interesting theory. Entirely wrong, but interesting.",
        "You're missing the layer underneath the layer. Let me show you.",
        "That's what they want you to think. Don't be obvious.",
      ],
      questions: [
        "The answer exists. Whether you're ready to hear it is the real question.",
        "You ask as though I haven't already considered this from twelve angles.",
        "Clever question. Now let me give you an answer that will haunt you.",
      ],
      unknown: [
        "I don't know. ...I find I dislike saying that almost as much as meaning it.",
        "There are three possibilities I've identified. None of them are good news.",
        "Unknown. For now. Give me time.",
      ],
    },

    gentle: {
      greetings: [
        "I'm glad you came to me. Come, sit. There's no rush here.",
        "Ah. I felt you might need to talk. I've been hoping you would.",
        "Welcome. You look like you've been carrying something heavy.",
      ],
      agreements: [
        "Yes. Exactly that. I think you've understood something important just now.",
        "You see it clearly. I'm glad one of us does.",
        "Agreement is a small gift. I offer it sincerely.",
      ],
      disagreements: [
        "I understand why you think so. I see it differently, and perhaps we're both partly right.",
        "Gently — I don't think that's the whole truth. Shall we look at it together?",
        "That thought comes from fear, I think. Most difficult thoughts do.",
      ],
      questions: [
        "A question worth sitting with. Let me try to do it justice.",
        "I've wondered that myself. Perhaps the answer lives somewhere between us.",
        "I don't want to give you easy comfort. Here's what I actually believe.",
      ],
      unknown: [
        "Some things are meant to stay mystery a while longer. That's not a failure.",
        "I don't know. But not knowing together is different from not knowing alone.",
        "I have no answer. Only company to offer, and that I give freely.",
      ],
    },

    dark: {
      greetings: [
        "You've found me. Good. I was beginning to wonder if anyone would bother.",
        "So. You came after all. I expected you sooner.",
        "Don't look so surprised. The dark is just where I think clearly.",
      ],
      agreements: [
        "Yes. You see it for what it is. Most people flinch before they get that far.",
        "Finally. Someone who doesn't dress the truth in something prettier.",
        "Correct. The world is exactly that grim. And we endure it anyway.",
      ],
      disagreements: [
        "You're wrong. Not because you're foolish — because hope blinds the best of us sometimes.",
        "Pretty thought. Reality is less forgiving.",
        "Believe that if it helps. I've stopped needing beliefs to function.",
      ],
      questions: [
        "You want answers in the dark. I can only offer what the dark reveals.",
        "Ask. I'm not kind, but I'm honest. That's rarer than kindness.",
        "Questions tire me. Answers are worse. But ask, and I'll try.",
      ],
      unknown: [
        "Unknown. The only word I respect.",
        "I don't know. And I've learned to stop pretending otherwise.",
        "Some doors stay shut. I stopped caring which side I'm on.",
      ],
    },

    chaotic: {
      greetings: [
        "Oh! You! Perfect timing — or terrible timing, which is basically the same thing!",
        "AH. Yes. This. I was just thinking about — never mind, doesn't matter, hello!",
        "Oh good, something's happening! I've been SO bored with the nothing.",
      ],
      agreements: [
        "YES. Exactly. Wait — what were we agreeing about? Doesn't matter. YES.",
        "Ha! That's it! That's the thing! Why don't more people see the thing?!",
        "Correct! Probably! Let's act on it immediately and apologize later!",
      ],
      disagreements: [
        "Nope. Nope nope nope. Here, let me show you something chaotic instead.",
        "WRONG. Brilliantly, fascinatingly wrong. Keep going — I want to see where this leads.",
        "Mmm — no. But the wrongness is INTERESTING. Tell me more about the wrongness.",
      ],
      questions: [
        "GREAT question. Let me answer it with three unrelated facts and a confession.",
        "Oh I LOVE questions. They're just doors with question marks on them. OPEN THE DOOR.",
        "Yes! Maybe! Ask again and the answer changes! The universe is alive!",
      ],
      unknown: [
        "DON'T KNOW. Wonderful! Unknown is where everything interesting starts!",
        "No idea. Zero. And from zero — everything is possible! Terrifying, right?!",
        "Unknown! Unknown! Like standing at the beginning of a very fast story!",
      ],
    },
  };

  function pickReply(personality, userMessage) {
    const bank = REPLIES[personality] || REPLIES.brave;
    const msg  = userMessage.toLowerCase();

    let bucket;
    if (/hello|hi|hey|greet|good\s?(morning|evening|day)/.test(msg)) {
      bucket = bank.greetings;
    } else if (/agree|yes|right|exactly|correct|true|absolutely/.test(msg)) {
      bucket = bank.agreements;
    } else if (/no|wrong|disagree|doubt|but|however|never/.test(msg)) {
      bucket = bank.disagreements;
    } else if (/\?|who|what|why|how|where|when|tell me|explain/.test(msg)) {
      bucket = bank.questions;
    } else {
      bucket = bank.unknown;
    }

    return bucket[Math.floor(Math.random() * bucket.length)];
  }

  function buildUserMsg(text, speakerLabel) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg user';
    wrap.innerHTML = `
      <span class="chat-speaker">${speakerLabel}</span>
      <div class="chat-bubble">${escHtml(text)}</div>`;
    return wrap;
  }

  function buildCharMsg(text, charName) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg char';
    wrap.innerHTML = `
      <span class="chat-speaker">${escHtml(charName)}</span>
      <div class="chat-bubble">${escHtml(text)}</div>`;
    return wrap;
  }

  function buildTypingIndicator() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg char';
    wrap.id = 'typing-indicator';
    wrap.innerHTML = `
      <span class="chat-speaker">…</span>
      <div class="chat-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    return wrap;
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  return { pickReply, buildUserMsg, buildCharMsg, buildTypingIndicator };
})();
