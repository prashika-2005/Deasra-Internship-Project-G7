/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Room Progression & Specialized Room Mini-Games Controller
 */

class RoomController {
  constructor() {
    this.activeKnowledgeBox = null;
    this.currentQuizQuestionIndex = 0;
    this.currentQuizScore = 0;
    this.videoProgressInterval = null;
  }

  // ==========================================
  // KNOWLEDGE BOX DISCOVERY & REWARD FLOW (NO VIDEO/QUIZ)
  // ==========================================
  startKnowledgeBox(kbId, onCompleteCallback) {
    const data = window.LEARNING_CONTENT[kbId];
    if (!data) return;

    this.activeKnowledgeBox = data;
    this.activeKbCallback = onCompleteCallback || null;

    const titleEl = document.getElementById('kb-modal-title');
    const subtitleEl = document.getElementById('kb-intro-subtitle');
    const introView = document.getElementById('kb-intro-view');
    const rewardView = document.getElementById('kb-reward-view');

    if (titleEl) titleEl.textContent = 'YOU DISCOVERED A KNOWLEDGE CHEST!';
    if (subtitleEl) subtitleEl.textContent = data.boxName + ' • ' + data.videoTitle;

    const subtextEl = document.getElementById('kb-placeholder-subtext');
    if (subtextEl) {
      subtextEl.textContent = `( Placeholder: ${data.videoTitle || 'Video & Assessment Module'} )`;
    }

    if (introView) introView.style.display = 'block';
    if (rewardView) rewardView.style.display = 'none';

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.openModal('kb-modal');
  }

  claimKnowledgeBoxReward() {
    const kb = this.activeKnowledgeBox;
    if (!kb) return;

    const currentRoom = window.gameState.state.rooms[window.gameState.state.currentRoomId];
    if (!currentRoom.kbsFound.includes(kb.id)) {
      currentRoom.kbsFound.push(kb.id);
      currentRoom.quizzesCompleted.push(kb.id);
      currentRoom.quizScores[kb.id] = 100;
      window.gameState.addXP(kb.xpAward || 100);
      window.gameState.addItem(kb.reward);
      if (kb.extraReward) {
        window.gameState.addItem(kb.extraReward);
      }
      window.gameState.updateRoomProgress(window.gameState.state.currentRoomId);
      window.gameState.save();
    }

    const callback = this.activeKbCallback;
    this.activeKbCallback = null;

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.updateHUD();

    if (callback && typeof callback === 'function') {
      if (window.app) window.app.closeModal('kb-modal');
      setTimeout(() => callback(), 200);
    } else {
      const introView = document.getElementById('kb-intro-view');
      const rewardView = document.getElementById('kb-reward-view');
      const rewardTitle = document.getElementById('kb-reward-title');
      const rewardDesc = document.getElementById('kb-reward-desc');
      const rewardIcon = document.getElementById('kb-reward-icon');

      if (introView) introView.style.display = 'none';
      if (rewardView) rewardView.style.display = 'flex';

      if (rewardTitle) rewardTitle.textContent = kb.reward.name;
      if (rewardDesc) rewardDesc.textContent = kb.reward.desc;
      if (rewardIcon) rewardIcon.textContent = kb.reward.icon;
    }
  }

  // ==========================================
  // ROOM 1 ESCAPE & 4 MASTERY DOORS UNLOCK
  // ==========================================
  escapeRoom1() {
    const room1 = window.gameState.state.rooms[1];
    if (!room1.keyAcquired) {
      if (window.app) {
        window.app.showToast('🚪 Exit door is locked! You need to find the exit door key first.', 'error');
      }
      return;
    }

    room1.escaped = true;
    room1.status = 'completed';
    room1.progress = 100;
    window.gameState.unlockSpecializedRooms();
    window.gameState.save();

    if (window.soundEngine) {
      window.soundEngine.playEscapeFanfare();
    }

    // Open Grand 4-Door Mastery Corridor View & Trigger Professor Vance Dialogue
    if (window.app) {
      this.openMasteryCorridor();
      setTimeout(() => {
        window.app.startDialogue('room1_completed');
      }, 400);
    }
  }

  openMasteryCorridor() {
    this.updateCorridorDoorStatuses();
    if (window.app) {
      window.app.openModal('mastery-corridor-modal');
    }
  }

  updateCorridorDoorStatuses() {
    const rooms = window.gameState?.state?.rooms;
    if (!rooms) return;

    const doorMap = {
      101: 2, // Mindset Room
      102: 3, // Financial Vault
      103: 4, // Personal Branding
      104: 5  // Problem Solving & Ideation
    };

    Object.entries(doorMap).forEach(([doorNum, roomId]) => {
      const room = rooms[roomId];
      const pill = document.getElementById(`status-door-${doorNum}`);
      if (pill && room) {
        if (room.status === 'completed') {
          pill.textContent = 'COMPLETED ✓';
          pill.className = 'door-status-pill completed';
        } else {
          pill.textContent = 'STATUS: ENTER';
          pill.className = 'door-status-pill enter';
        }
      }
    });
  }

  // ==========================================
  // SPECIALIZED ROOMS (2 - 5) CONTROLLERS
  // ==========================================
  enterSpecializedRoom(roomId) {
    const room = window.gameState.state.rooms[roomId] || {};
    window.gameState.state.currentRoomId = roomId;

    if (window.app) {
      window.app.showToast(`🚪 ${room.name || 'Mastery Chamber'} UI Preview`, 'success');
      window.app.openSpecializedRoomModal(roomId);
    }
  }

  solveSpecializedRoom(roomId) {
    const room = window.gameState.state.rooms[roomId];
    if (!room) return;

    room.escaped = true;
    room.status = 'completed';
    room.progress = 100;
    window.gameState.addXP(300);

    // Check if all 5 rooms are completed
    const allDone = [1, 2, 3, 4, 5].every(id => window.gameState.state.rooms[id].status === 'completed');
    if (allDone) {
      window.gameState.unlockBadge('entrepreneur_master');
    }
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playEscapeFanfare();
    if (window.app) {
      window.app.closeModal(`room-${roomId}-modal`);
      window.app.showToast(`🎉 Mastered ${room.name}!`, 'reward');
      this.openMasteryCorridor();
    }
  }
}

window.roomController = new RoomController();
