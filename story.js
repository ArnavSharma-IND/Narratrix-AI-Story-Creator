/* story.js — Scene generation & emotion system for Narratrix */

const StoryEngine = (() => {

  // ── Emotion Pool ──
  const EMOTIONS = [
    { emoji: '😤', label: 'Defiant' },
    { emoji: '😔', label: 'Melancholic' },
    { emoji: '😤', label: 'Determined' },
    { emoji: '😈', label: 'Scheming' },
    { emoji: '🥺', label: 'Vulnerable' },
    { emoji: '😠', label: 'Furious' },
    { emoji: '🤩', label: 'Exhilarated' },
    { emoji: '😰', label: 'Terrified' },
    { emoji: '😏', label: 'Smug' },
    { emoji: '🧘', label: 'Calm' },
    { emoji: '😢', label: 'Grief-Stricken' },
    { emoji: '😎', label: 'Confident' },
    { emoji: '🫡', label: 'Resolute' },
    { emoji: '🤯', label: 'Overwhelmed' },
    { emoji: '🥰', label: 'Tenderhearted' },
    { emoji: '😤', label: 'Indignant' },
    { emoji: '😶', label: 'Haunted' },
  ];

  // ── Scene Templates by Genre ──
  const SCENES = {
    fantasy: {
      openings: [
        "The ancient tower loomed against a violet sky, its stones whispering secrets older than kings.",
        "Mist crept between the gnarled roots of the Elderwood, where no sane traveller dared tread after dusk.",
        "A raven circled the ruined keep three times before landing on {name}'s outstretched arm.",
        "The oracle's words still burned in {name}'s mind as the mountain path narrowed to nothing.",
        "Fireflies scattered as {name} stepped into the moonlit glade where the fey were said to bargain.",
      ],
      middles: [
        "Something shifted in the shadows — not an animal, not the wind. Something with intent.",
        "The map showed a bridge here. The bridge was gone. Only the sigil carved in the cliff remained.",
        "A distant horn echoed three times. Old enough to know better, {name} recognised the warning.",
        "The stranger's coin was warm to the touch, though it had been dropped in the cold river mud.",
        "Every door in the hall was sealed — except one, left deliberately ajar.",
      ],
      dialogues: [
        '"There is no going back from this threshold," the voice said, from everywhere and nowhere.',
        '"You were foretold," she whispered, eyes silver as starlight. "But not in a kind prophecy."',
        '"My lord wants only one thing from you," the messenger said. "Your surrender — or your name."',
        '"The flame remembers what the stone forgets," the hermit muttered without looking up.',
        '"They said you were dead," the knight breathed, sword half-drawn. "They were not entirely wrong."',
      ],
      choices: [
        ["Push open the sealed door", "Study the sigil more carefully", "Retreat and find another way"],
        ["Accept the stranger's offer", "Demand to know their true name", "Walk away without a word"],
        ["Draw your weapon and stand firm", "Attempt to negotiate", "Call the bluff and step forward"],
        ["Follow the raven into the dark", "Light a torch and wait", "Signal for your companions"],
        ["Speak the old oath aloud", "Stay silent and observe", "Ask about the prophecy directly"],
      ],
    },
    'sci-fi': {
      openings: [
        "The colony ship's AI hadn't spoken in six days. Then, at 03:00 ship-time, it said one word: 'Run.'",
        "The signal had come from a planet cartography marked as uninhabited. Cartography was wrong.",
        "{name} pulled the cryo-pod manifest and found a name that shouldn't exist — their own.",
        "The jump drive spat them out three light-years off course, directly above a dying star.",
        "Station Kepler-9 had been dark for eleven years. Its distress beacon activated this morning.",
      ],
      middles: [
        "Radiation readings spiked to fatal — then vanished. The instruments couldn't agree on what they'd seen.",
        "The sector's debris field contained wreckage from ships not yet built.",
        "Corridor C was sealed from the inside, and the seals were not human-made.",
        "The alien structure had exactly one entrance. The scans showed no interior.",
        "Two crew members reported the same dream last night. Verbatim. Word for word.",
      ],
      dialogues: [
        '"That signal has been repeating for two-hundred years," the analyst said. "We just started being able to hear it."',
        '"The xenobiologist said do not open it. She said that three minutes before she stopped responding."',
        '"Command says abort. Command is also eleven months away at max burn," the pilot noted flatly.',
        '"I\'ve run the calculation fourteen times," the AI said. "The answer doesn\'t improve with repetition."',
        '"They didn\'t destroy the last crew," the scanner read. "They archived them."',
      ],
      choices: [
        ["Investigate the source of the signal", "Purge all systems and reboot", "Wake the full crew"],
        ["Suit up and go EVA", "Quarantine Corridor C", "Contact Command and wait"],
        ["Trust the AI's warning", "Override and proceed manually", "Attempt to communicate"],
        ["Turn the ship around", "Push deeper into the debris field", "Launch a probe first"],
        ["Retrieve the archived crew", "Destroy the structure", "Document and retreat"],
      ],
    },
    horror: {
      openings: [
        "The house had been empty for thirty years. The dinner table was set for four.",
        "Everyone in the village swore they had never seen {name} before — despite the photographs.",
        "The static on the radio shaped itself into syllables. Then into a name. Then into a plea.",
        "The journal ended mid-sentence, in the middle of a word. The handwriting was {name}'s own.",
        "Three days of searching, and the hikers were found — in the basement of a house built after they vanished.",
      ],
      middles: [
        "The mirror showed the room correctly. Except for the door, which the mirror showed as open.",
        "The floorboards creaked in a pattern. After a while, {name} recognized it as counting.",
        "The child in the garden was gone. The small handprints in the soil led toward the house.",
        "Every clock in the building had stopped at 3:17. Every clock showed a different 3:17.",
        "The basement smelled of iron and pine. Neither explained the warmth.",
      ],
      dialogues: [
        '"It\'s not the dark that scares me," the old woman said. "It\'s what the dark is full of."',
        '"Don\'t say you don\'t believe me. Everyone who says that doesn\'t say anything afterwards."',
        '"I heard it again last night," she whispered. "It knows my name now. It learned."',
        '"The others left. One by one. They always say goodbye. That\'s how you know."',
        '"Close your eyes. Not because it helps." A pause. "Just so you don\'t have to watch."',
      ],
      choices: [
        ["Open the basement door", "Barricade it shut and leave", "Listen at the door first"],
        ["Follow the handprints", "Get out of the house now", "Search for a weapon"],
        ["Read the journal aloud", "Burn the journal", "Hide it and say nothing"],
        ["Confront whatever is in the mirror", "Cover all the mirrors", "Wake someone else up"],
        ["Stay the night", "Flee immediately", "Call for help — if signal exists"],
      ],
    },
    mystery: {
      openings: [
        "The victim had no enemies — according to everyone who obviously wanted {name} to stop looking.",
        "The alibi was airtight. The evidence was impossible. Both things were true, somehow.",
        "Three witnesses. Three different crimes described. One night. One room.",
        "The letter arrived the day of the murder, postmarked two days after it.",
        "{name} had solved the case the moment they stepped inside — and spent the rest of the day doubting it.",
      ],
      middles: [
        "The financials told one story. The calendar told another. The photographs refused to comment.",
        "One name appeared in every victim's address book, always written in red, always slightly smudged.",
        "The inspector had arrived first — five minutes before the call was made.",
        "The stolen item wasn't valuable. That was the most important clue.",
        "Everyone in the room lied. Only one of them lied about the right thing.",
      ],
      dialogues: [
        '"I didn\'t do it," he said. "But I know who did. And so do you, if you\'re as clever as they say."',
        '"Ask me what I saw," she said. "Don\'t ask me what it means. That\'s your job."',
        '"The victim had one secret," the attorney said smoothly. "So does everyone in this room."',
        '"I could tell you the truth," the suspect offered. "Or I could tell you what happened. Which do you want?"',
        '"The answer is obvious," the inspector murmured. "Which means we\'re meant to find it."',
      ],
      choices: [
        ["Follow the money trail", "Re-interview the first witness", "Examine the crime scene again"],
        ["Confront the suspect directly", "Set a careful trap", "Gather more evidence first"],
        ["Reveal what you know publicly", "Keep your theory private", "Consult a trusted ally"],
        ["Trust your instincts on the alibi", "Verify every detail independently", "Look for the motive"],
        ["Make an accusation", "Present the evidence and wait", "Ask one more question"],
      ],
    },
    romance: {
      openings: [
        "They had been assigned opposite sides of every argument for three years. Today, they finally agreed.",
        "The letter was meant for someone else. {name} had read it anyway. That was the beginning of everything.",
        "It was the third time they'd run into each other this week. The city was not that small.",
        "She said she didn't believe in second chances. He arrived precisely to disprove her.",
        "The train was delayed four hours. By the end, {name} no longer wanted it to leave.",
      ],
      middles: [
        "The silence stretched between them — not uncomfortable, but full of something unsaid.",
        "The small kindness was nothing. It was also, inexplicably, everything.",
        "They had agreed to keep it simple. Simple was becoming increasingly complicated.",
        "The almost-moment passed. Both pretended it hadn't. Neither managed to forget it.",
        "Three sentences in, {name} realized they were no longer talking about the thing they'd started talking about.",
      ],
      dialogues: [
        '"You could have told me," she said quietly. "I would have stayed anyway. That\'s what scares you."',
        '"I\'m not asking for forever," he said. "I\'m asking for tonight. We can argue about tomorrow tomorrow."',
        '"You\'re infuriating," she told him. Then, after a pause: "Also. Don\'t go."',
        '"Tell me something true," she said. "Something you\'ve never said out loud."',
        '"I think," he said carefully, "that I\'ve been making excuses to see you." A pause. "I\'m done making excuses."',
      ],
      choices: [
        ["Say what you're actually thinking", "Change the subject carefully", "Ask a question instead"],
        ["Stay a little longer", "Leave before it gets complicated", "Suggest meeting again"],
        ["Be honest about your feelings", "Keep things light and safe", "Ask how they feel first"],
        ["Take the risk", "Step back and think", "Let them make the next move"],
        ["Say yes", "Say not yet", "Say nothing — and let the moment speak"],
      ],
    },
    western: {
      openings: [
        "The noon train was late. In Redrock, that always meant someone was coming who didn't want to be seen.",
        "The sheriff's star sat on the bar. Nobody asked why. {name} picked it up anyway.",
        "Three men rode into Dustfall at sunset. Only two of them planned to ride out.",
        "The deed was legal. The man who'd signed it was not, by any definition, alive.",
        "{name} had retired from trouble twice before. Trouble had a poor memory.",
      ],
      middles: [
        "The saloon went quiet before the door even opened — the kind of quiet that knows what's coming.",
        "Tracks in the dust: three horses in, two horses out, and something dragged.",
        "The telegraph came through garbled. The one word legible was enough.",
        "Water rights. It was always water rights. And someone was always willing to kill for them.",
        "The stranger's gun was wrong for a traveler. Right for a professional.",
      ],
      dialogues: [
        '"I\'m not looking for trouble," {name} said. The barkeep laughed, short and humourless. "It found you first."',
        '"Walk away," the man said. "I\'ve got no quarrel with you." A beat. "Yet."',
        '"The judge is paid," she said flatly. "The marshal is scared. That leaves you."',
        '"Last man who came asking those questions left feet-first," the old-timer said. "I\'m just saying."',
        '"I know you," the outlaw said slowly. "You\'re not what they said you were." A pause. "You\'re worse."',
      ],
      choices: [
        ["Draw first", "Wait and watch", "Try to talk your way out"],
        ["Take the sheriff's star", "Ride on and leave it alone", "Find out who left it"],
        ["Follow the tracks", "Head to the telegraph office", "Stake out the saloon"],
        ["Side with the ranchers", "Side with the settlers", "Stay neutral — for now"],
        ["Call the bluff", "Back down this time", "Make a counter-offer"],
      ],
    },
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function interpolate(str, character) {
    return str.replace(/\{name\}/g, character.name);
  }

  function generateScene(character) {
    const genre = character.genre || 'fantasy';
    const pool  = SCENES[genre] || SCENES.fantasy;

    const opening  = interpolate(pick(pool.openings), character);
    const middle   = interpolate(pick(pool.middles),  character);
    const dialogue = interpolate(pick(pool.dialogues), character);
    const choiceSet = pick(pool.choices);

    return {
      paragraphs: [opening, middle],
      dialogue,
      choices: choiceSet,
    };
  }

  function randomEmotion() {
    return pick(EMOTIONS);
  }

  return { generateScene, randomEmotion };
})();
