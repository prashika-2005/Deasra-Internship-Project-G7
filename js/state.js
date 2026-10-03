/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Persistent Game State Manager with LocalStorage Support
 */

const STORAGE_KEY = 'ENTREPRENEUR_ESCAPE_GAME_STATE_V1';

class GameState {
  constructor() {
    this.defaultState = {
      player: {
        id: 'ENTR_' + Math.floor(1000 + Math.random() * 9000),
        name: 'Entrepreneur',
        email: 'player@deasra.org',
        avatarId: 'creator',
        avatarName: 'The Creator',
        avatarTitle: 'Creative & Innovative',
        avatarDesc: 'You see possibilities where others see limitations.',
        avatarIcon: '💡',
        xp: 0,
        level: 1,
        registered: false
      },
      currentRoomId: 1,
      currentWall: 1, // 1: Entrance, 2: Desk/Clues, 3: Exit/Painting, 4: Bookshelf
      rooms: {
        1: {
          id: 1,
          name: 'Introduction to deAsra inspireLIFE',
          status: 'available', // available | in_progress | completed
          progress: 0,
          kbsFound: [], // [1, 2, 3]
          quizzesCompleted: [], // [1, 2, 3]
          quizScores: { 1: 0, 2: 0, 3: 0 },
          scratchCompleted: false,
          drawerUnlocked: false,
          redBookPulled: false,
          safeOpened: false,
          clockSolved: false,
          paintingCompleted: false,
          keyAcquired: false,
          escaped: false
        },
        2: {
          id: 2,
          name: 'Entrepreneurial Mindset',
          status: 'locked', // locked | available | in_progress | completed
          progress: 0,
          kbsFound: [],
          quizzesCompleted: [],
          quizScores: { 4: 0 },
          puzzleSolved: false,
          keyAcquired: false,
          escaped: false
        },
        3: {
          id: 3,
          name: 'Personal Finance Management',
          status: 'locked',
          progress: 0,
          kbsFound: [],
          quizzesCompleted: [],
          quizScores: { 5: 0 },
          puzzleSolved: false,
          keyAcquired: false,
          escaped: false
        },
        4: {
          id: 4,
          name: 'Personal Branding',
          status: 'locked',
          progress: 0,
          kbsFound: [],
          quizzesCompleted: [],
          quizScores: { 6: 0 },
          puzzleSolved: false,
          keyAcquired: false,
          escaped: false
        },
        5: {
          id: 5,
          name: 'Problem Solving & Business Idea Generation',
          status: 'locked',
          progress: 0,
          kbsFound: [],
          quizzesCompleted: [],
          quizScores: { 7: 0 },
          puzzleSolved: false,
          keyAcquired: false,
          escaped: false
        }
      },
      inventory: [],
      hintsUsed: 0,
      badges: [
        { id: 'first_clue', name: 'First Discovery', icon: '🔍', desc: 'Discovered your first secret clue', unlocked: false },
        { id: 'kb_master', name: 'Knowledge Seeker', icon: '📚', desc: 'Unlocked 3 Knowledge Boxes', unlocked: false },
        { id: 'puzzle_art', name: 'Art of Innovation', icon: '🖼️', desc: 'Completed the mysterious painting', unlocked: false },
        { id: 'gateway_escape', name: 'Inspire Pioneer', icon: '🏆', desc: 'Escaped Room 1 and unlocked the building', unlocked: false },
        { id: 'entrepreneur_master', name: 'Master Entrepreneur', icon: '👑', desc: 'Completed all specialized training rooms', unlocked: false }
      ],
      settings: {
        audioMuted: false
      }
    };

    // Always start fresh on every launch/run (Zero stale solved states!)
    this.reset();
  }

  load() {
    return JSON.parse(JSON.stringify(this.defaultState));
  }

  save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {}
  }

  reset() {
    this.state = JSON.parse(JSON.stringify(this.defaultState));
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  addXP(amount) {
    this.state.player.xp += amount;
    this.state.player.level = Math.floor(this.state.player.xp / 300) + 1;
    this.save();
    if (window.app) window.app.updateHUD();
    return this.state.player.xp;
  }

  addItem(item) {
    if (!this.state.inventory.some(i => i.id === item.id)) {
      this.state.inventory.push(item);
      this.save();
      if (window.soundEngine) window.soundEngine.playSuccess();
      if (window.app) {
        window.app.showToast(`Collected: ${item.name}`, 'reward');
        window.app.updateHUD();
      }
      return true;
    }
    return false;
  }

  hasItem(itemId) {
    return this.state.inventory.some(i => i.id === itemId);
  }

  removeItem(itemId) {
    this.state.inventory = this.state.inventory.filter(i => i.id !== itemId);
    this.save();
    if (window.app) window.app.updateHUD();
  }

  unlockBadge(badgeId) {
    const badge = this.state.badges.find(b => b.id === badgeId);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      this.addXP(100);
      this.save();
      if (window.app) {
        window.app.showToast(`Badge Unlocked: ${badge.name}!`, 'reward');
      }
    }
  }

  unlockSpecializedRooms() {
    // Room 1 completed -> Unlocks Rooms 2, 3, 4, 5
    [2, 3, 4, 5].forEach(id => {
      if (this.state.rooms[id].status === 'locked') {
        this.state.rooms[id].status = 'available';
      }
    });
    this.unlockBadge('gateway_escape');
    this.save();
  }

  updateRoomProgress(roomId) {
    const room = this.state.rooms[roomId];
    if (!room) return 0;
    if (roomId === 1) {
      let score = 0;
      if (room.scratchCompleted) score += 10;
      if (room.drawerUnlocked) score += 15;
      if (room.kbsFound.includes(1)) score += 15;
      if (room.redBookPulled) score += 10;
      if (room.kbsFound.includes(2)) score += 15;
      if (room.clockSolved) score += 10;
      if (room.kbsFound.includes(3)) score += 15;
      if (room.paintingCompleted) score += 10;
      room.progress = Math.min(100, score);
      if (room.escaped) room.progress = 100;
    } else {
      let score = 0;
      if (room.kbsFound.length > 0) score += 40;
      if (room.quizzesCompleted.length > 0) score += 30;
      if (room.puzzleSolved) score += 20;
      if (room.escaped) score = 100;
      room.progress = Math.min(100, score);
    }
    this.save();
    return room.progress;
  }
}

window.gameState = new GameState();
