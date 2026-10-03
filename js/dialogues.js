/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Professor Vance Dialogue Tree & Avatar Branching Scripts
 */

const DIALOGUES = {
  // 1. Initial Lobby Meeting & Room 1 Challenge Briefing
  lobby_intro: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Innovation',
    lines: [
      'Welcome, Entrepreneur! Your journey begins here. See that door ahead? That is Room 1, and that’s where your journey will begin. But the door is locked, and you’ll need to find its key.',
      'To unlock the key, you must complete the Flower Painting hanging in this room. Three pieces of the painting are missing. They are hidden somewhere inside this room. Find the three Knowledge Boxes to discover the missing pieces and complete the painting.',
      'Once you complete the painting, the key will be yours. Good luck, Entrepreneur. Your journey starts now!'
    ],
    buttonText: 'Close Chat ✕'
  },

  // 2. Room 1 Mission Briefing
  room1_briefing: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Entrepreneurial Innovation',
    lines: [
      'Welcome to Room 1 — Introduction to deAsra inspireLIFE.',
      'Somewhere inside this room are three hidden Knowledge Boxes.',
      'Each Knowledge Box contains a vital entrepreneurial insight and quiz. Completing each will grant you a missing piece of the mysterious wall painting.',
      'Find all three pieces, restore the painting, and the Golden Escape Key will reveal itself.',
      'Remember: Explore every wall, inspect every detail, and trust your instincts. Good luck!'
    ],
    buttonText: 'Begin Escape Challenge'
  },

  // 3. Room 1 Completed Celebration & 4 Mastery Doors Unlocked
  room1_completed: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Entrepreneurial Innovation',
    lines: [
      'Extraordinary work, Entrepreneur! You solved every mechanism in the Study and claimed the Golden Escape Key!',
      'Look ahead in this Grand Corridor — all four Specialized Mastery Chambers are now officially unlocked for you!',
      'Room 101 (Mindset Room), Room 102 (Financial Vault), Room 103 (Personal Branding), and Room 104 (Idea Generation).',
      'You can choose and enter any of these four chambers in whatever order you wish to complete your entrepreneurial mastery. Click any door to step inside!'
    ],
    buttonText: 'Choose Your Chamber →'
  },

  // Room 2 Briefing
  room2_briefing: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Entrepreneurial Innovation',
    lines: [
      'Welcome to the Entrepreneurial Mindset chamber.',
      'Here, failure is not a dead end — it is the raw material of breakthrough innovation.',
      'Analyze the opportunity boards and unlock Knowledge Box 04 to claim the Mindset Key.'
    ],
    buttonText: 'Explore Chamber'
  },

  // Room 3 Briefing
  room3_briefing: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Entrepreneurial Innovation',
    lines: [
      'Welcome to the Personal Finance Management vault.',
      'An entrepreneur who cannot master cash flow cannot sustain a vision.',
      'Balance the 50/30/20 budget matrix to unlock Knowledge Box 05 and claim the Vault Key.'
    ],
    buttonText: 'Enter Vault'
  },

  // Room 4 Briefing
  room4_briefing: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Entrepreneurial Innovation',
    lines: [
      'Welcome to the Personal Branding studio.',
      'Your reputation and core identity are your most valuable currency.',
      'Align your core strengths on the portfolio wall and unlock Knowledge Box 06.'
    ],
    buttonText: 'Enter Studio'
  },

  // Room 5 Briefing
  room5_briefing: {
    npcName: 'Professor Vance',
    npcRole: 'Director of Entrepreneurial Innovation',
    lines: [
      'Welcome to the Problem Solving & Idea Generation lab.',
      'This is where real-world friction turns into scalable, high-impact business concepts.',
      'Connect the problem-to-solution matrix and claim the Master Innovation Key!'
    ],
    buttonText: 'Enter Lab'
  }
};

window.DIALOGUES = DIALOGUES;
