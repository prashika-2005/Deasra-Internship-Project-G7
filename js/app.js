/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Main Application Orchestrator & Event Router
 * 4-Wall Photorealistic Victorian Chamber Edition
 */

class App {
  constructor() {
    this.currentDialogueScript = null;
    this.currentDialogueLineIdx = 0;
    this.typewriterInterval = null;
    this.lampOn = true;
  }

  init() {
    // 1. Initialize Vintage Room Engine
    if (window.vintageRoomEngine) {
      window.vintageRoomEngine.init();
    }

    // 2. Setup HUD & UI Listeners
    this.setupEventListeners();
    this.updateHUD();
    if (window.puzzleManager?.syncVaultUI) {
      window.puzzleManager.syncVaultUI();
    }

    // 3. Start directly inside Room 1 (Study Room)
    this.startDirectInRoom1();
  }

  startDirectInRoom1() {
    const landing = document.getElementById('game-title-landing');
    if (landing) landing.style.display = 'none';

    this.closeModal('avatar-selection-screen');
    this.closeModal('building-lobby-screen');

    // Register player state
    window.gameState.state.player.registered = true;
    window.gameState.save();

    // Set Room 1 Wall 1 Active
    if (window.vintageRoomEngine) {
      window.vintageRoomEngine.setWall(1);
    }

    // Intro toast for Financial Vault
    setTimeout(() => {
      this.showToast('💰 FINANCIAL VAULT: "Every financial decision leaves a trail. Follow the clues & unlock your way out."', 'reward');
    }, 600);
  }

  openPaintingClue() {
    this.openModal('painting-clue-modal');
  }

  openSuitcasePuzzle() {
    if (window.puzzleManager) {
      window.puzzleManager.openSuitcaseModal();
    } else {
      this.openModal('suitcase-modal');
    }
  }

  openSafeModal() {
    if (window.puzzleManager) {
      window.puzzleManager.openSafeModal();
    } else {
      this.openModal('safe-modal');
    }
  }

  beginGameFromLanding() {
    const landing = document.getElementById('game-title-landing');
    if (window.soundEngine) {
      window.soundEngine.playSuccess();
    }

    // 1. Instantly open Avatar Selection Screen underneath so Room 1 is never glimpsed
    this.openModal('avatar-selection-screen');

    // 2. Smoothly fade out the title cover
    if (landing) {
      landing.classList.add('fade-out');
      setTimeout(() => {
        landing.style.display = 'none';
      }, 700);
    }
  }

  setupEventListeners() {
    // Wall Navigation buttons (syncs with vintageRoomEngine)
    document.getElementById('btn-prev-wall')?.addEventListener('click', () => {
      window.vintageRoomEngine.prevWall();
    });

    document.getElementById('btn-next-wall')?.addEventListener('click', () => {
      window.vintageRoomEngine.nextWall();
    });

    // Bottom HUD Action Buttons
    document.getElementById('hud-btn-hint')?.addEventListener('click', () => {
      window.profileReportManager.getHint();
    });

    document.getElementById('hud-btn-inventory')?.addEventListener('click', () => {
      this.openInventory();
    });

    document.getElementById('hud-btn-map')?.addEventListener('click', () => {
      this.openBuildingMap();
    });

    document.getElementById('hud-btn-profile')?.addEventListener('click', () => {
      window.profileReportManager.renderProfile();
    });

    document.getElementById('hud-btn-report')?.addEventListener('click', () => {
      window.profileReportManager.renderReport();
    });

    document.getElementById('hud-btn-audio')?.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      const icon = document.getElementById('audio-btn-icon');
      if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
      this.showToast(isMuted ? 'Audio Muted' : 'Audio Unmuted', 'success');
    });

    // Close buttons for modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  updateHUD() {
    const state = window.gameState.state;
    const currentWall = window.vintageRoomEngine ? window.vintageRoomEngine.currentWall : 1;

    // Update Wall Indicator Dots
    document.querySelectorAll('.wall-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === currentWall);
    });

    const wallNames = {
      1: 'Wall 1: Entrance & Wall Clock',
      2: 'Wall 2: Notice Board & Study Desk',
      3: 'Wall 3: Exit Door & Flower Painting',
      4: 'Wall 4: Library Bookshelf & Secret Book'
    };
    const wallLabel = document.getElementById('wall-name-label');
    if (wallLabel) wallLabel.textContent = wallNames[currentWall] || `Wall ${currentWall}`;

    // Update XP & Inventory Count
    const xpVal = document.getElementById('hud-xp-val');
    if (xpVal) xpVal.textContent = state.player.xp;
    const settingsXpVal = document.getElementById('settings-xp-val');
    if (settingsXpVal) settingsXpVal.textContent = state.player.xp;

    const invCount = document.getElementById('hud-inv-count');
    if (invCount) {
      const displayItems = state.inventory.filter(i => i.type !== 'painting_piece' && !i.id?.startsWith('painting_piece_'));
      invCount.textContent = displayItems.length;
    }

    // Update Current Objective Banner
    const objText = document.getElementById('hud-objective-text');
    if (objText) objText.textContent = this.getCurrentObjective();

    if (window.vintageRoomEngine) {
      window.vintageRoomEngine.updateRoomVisuals();
    }
  }

  getCurrentObjective() {
    const state = window.gameState ? window.gameState.state : null;
    if (!state) return '1. Find the hidden pattern.';

    const r1 = state.rooms ? state.rooms[1] : null;
    if (!r1) return '1. Find the hidden pattern.';

    const hasItem = (id) => window.gameState && window.gameState.hasItem ? window.gameState.hasItem(id) : false;

    // Financial Vault Completed
    if (r1.escaped) {
      return 'Financial Vault Escaped! Explore specialized rooms via Building Map!';
    }

    // Step 18: Unlock the door and escape the Financial Vault.
    if (r1.keyAcquired) {
      return '18. Unlock the door and escape the Financial Vault.';
    }

    // Step 17: Collect the escape key.
    if (r1.budgetSubmitted || r1.paintingCompleted || r1.keyRevealed) {
      return '17. Collect the escape key.';
    }

    // Step 16: Submit your final budget.
    if (r1.budgetFitting) {
      return '16. Submit your final budget.';
    }

    // Step 15: Make sure your budget fits your available money.
    if (r1.lifestyleBalanced) {
      return '15. Make sure your budget fits your available money.';
    }

    // Step 14: Balance your lifestyle spending.
    if (r1.essentialsSet) {
      return '14. Balance your lifestyle spending.';
    }

    // Step 13: Start with your essential expenses.
    if (r1.budgetStarted) {
      return '13. Start with your essential expenses.';
    }

    // Step 12: Open the Digital Personal Money Management Terminal.
    if (r1.lockerOpened || r1.vaultSafeUnlocked) {
      return '10. Access the Digital Money Management Terminal & submit your budget.';
    }

    // Step 9: Unlock the main safe.
    if (r1.handlePlaced || r1.handlesPlaced || (r1.safeHandle1Installed && r1.safeHandle2Installed)) {
      return '9. Unlock the main safe.';
    }

    // Step 8: Follow the dial movement clue.
    if (r1.drawerUnlocked || r1.safeDialCollected) {
      return '8. Follow the dial movement clue.';
    }

    // Step 7: Find the safe and assemble what you need.
    if (r1.receiptInspected || hasItem('atm_receipt')) {
      return '7. Find the safe and assemble what you need.';
    }

    // Step 6: Use the receipt clue to unlock the drawer.
    if (r1.atmUnlocked || r1.atmSolved) {
      return '6. Use the receipt clue to unlock the drawer.';
    }

    // Step 5: Check the ATM receipt carefully.
    if (r1.atmCardInserted || r1.atmInserted) {
      return '5. Check the ATM receipt carefully.';
    }

    // Step 4: Follow the clue to discover the PIN.
    if (r1.atmCardCollected || hasItem('atm_card')) {
      return '4. Follow the clue to discover the PIN.';
    }

    // Step 3: Find the ATM and use the card.
    if (r1.suitcaseUnlocked || r1.suitcaseOpened) {
      return '3. Find the ATM and use the card.';
    }

    // Step 2: Unlock the suitcase.
    if (r1.scratchCompleted) {
      return '2. Unlock the suitcase.';
    }

    // Step 1: Find the hidden pattern.
    return '1. Find the hidden pattern.';
  }

  updateSettingsModalState() {
    const state = window.gameState ? window.gameState.state : { player: { xp: 0 } };
    const settingsXpVal = document.getElementById('settings-xp-val');
    if (settingsXpVal) settingsXpVal.textContent = state.player.xp;

    const isMuted = window.soundEngine ? window.soundEngine.isMuted : false;
    const icon = document.getElementById('settings-audio-icon');
    const status = document.getElementById('settings-audio-status');
    if (icon) icon.textContent = isMuted ? '🔇' : '🔊';
    if (status) {
      status.textContent = isMuted ? 'MUTED' : 'ENABLED';
      status.style.color = isMuted ? '#ff6b6b' : '#4cd964';
    }
  }

  toggleAudioInSettings() {
    if (!window.soundEngine) return;
    const isMuted = window.soundEngine.toggleMute();
    const topIcon = document.getElementById('audio-btn-icon');
    if (topIcon) topIcon.textContent = isMuted ? '🔇' : '🔊';
    this.updateSettingsModalState();
    this.showToast(isMuted ? 'Audio Muted' : 'Audio Unmuted', 'success');
  }

  showToast(message, type = 'normal') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span style="font-size:18px;">${type === 'reward' ? '🎁' : type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    if (window.soundEngine && type === 'error') {
      window.soundEngine.playError();
    }

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      if (window.soundEngine) window.soundEngine.playClick();
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // ==========================================
  // PROFESSOR VANCE DIALOGUE CONTROLLER
  // ==========================================
  startDialogue(dialogueKey, onComplete = null) {
    const diag = window.DIALOGUES[dialogueKey];
    if (!diag) return;

    this.currentDialogueScript = diag;
    this.currentDialogueLineIdx = 0;

    const overlay = document.getElementById('dialogue-overlay');
    const nameEl = document.getElementById('diag-npc-name');
    const roleEl = document.getElementById('diag-npc-role');
    const continueBtn = document.getElementById('diag-continue-btn');

    if (nameEl) nameEl.textContent = diag.npcName;
    if (roleEl) roleEl.textContent = diag.npcRole;

    overlay.classList.add('active');

    const nextLine = () => {
      if (this.currentDialogueLineIdx < diag.lines.length) {
        let line = diag.lines[this.currentDialogueLineIdx];
        if (this.currentDialogueLineIdx === 0 && diag.avatarBranch) {
          const avatarId = window.gameState.state.player.avatarId;
          line = diag.avatarBranch[avatarId] || line;
        }

        this.typewriterEffect(line);
        this.currentDialogueLineIdx++;

        if (this.currentDialogueLineIdx >= diag.lines.length) {
          if (continueBtn) continueBtn.textContent = diag.buttonText || 'Continue';
        } else {
          if (continueBtn) continueBtn.textContent = 'Next →';
        }
      } else {
        overlay.classList.remove('active');
        if (onComplete) onComplete();
      }
    };

    continueBtn.onclick = () => {
      if (window.soundEngine) window.soundEngine.playClick();
      nextLine();
    };

    nextLine();
  }

  typewriterEffect(text) {
    const textEl = document.getElementById('diag-text');
    if (!textEl) return;
    if (this.typewriterInterval) clearInterval(this.typewriterInterval);

    textEl.textContent = '';
    let i = 0;
    this.typewriterInterval = setInterval(() => {
      if (i < text.length) {
        textEl.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(this.typewriterInterval);
      }
    }, 20);
  }

  // ==========================================
  // VOXEL CHARACTER SELECTION & ONBOARDING
  // ==========================================
  chooseVoxelAvatar(avatarId, avatarName) {
    const avatars = {
      creator: { name: 'The Creator', title: 'Creative • Innovative • Imaginative', desc: 'You see possibilities where others see limitations.', icon: '💡' },
      leader: { name: 'The Leader', title: 'Confident • Decisive • Influential', desc: 'You inspire people and turn ideas into action.', icon: '👑' },
      explorer: { name: 'The Explorer', title: 'Adventurous • Curious • Bold', desc: 'You are always ready to discover what’s next.', icon: '🧭' },
      strategist: { name: 'The Strategist', title: 'Smart • Analytical • Logical', desc: 'You think ahead and find the smartest path.', icon: '♟️' }
    };

    const sel = avatars[avatarId] || avatars.creator;

    // Highlight selected card
    document.querySelectorAll('.avatar-char-card').forEach(card => {
      card.classList.toggle('selected', card.id === `avatar-card-${avatarId}`);
    });

    // Update bottom button text
    const btnText = document.getElementById('avatar-btn-text');
    if (btnText) {
      btnText.textContent = `SELECT AVATAR (${sel.name.toUpperCase()}) →`;
    }

    window.gameState.state.player.avatarId = avatarId;
    window.gameState.state.player.avatarName = sel.name;
    window.gameState.state.player.avatarTitle = sel.title;
    window.gameState.state.player.avatarDesc = sel.desc;
    window.gameState.state.player.avatarIcon = sel.icon;

    if (window.soundEngine) window.soundEngine.playClick();
  }

  confirmVoxelAvatar() {
    const player = window.gameState.state.player;
    if (!player.avatarId) {
      player.avatarId = 'creator';
      player.avatarName = 'The Creator';
      player.avatarTitle = 'Creative • Innovative • Imaginative';
      player.avatarIcon = '💡';
    }

    player.registered = true;
    window.gameState.save();

    if (window.soundEngine) {
      window.soundEngine.playSuccess();
    }

    // Update Lobby Top Avatar Tag
    const tag = document.getElementById('lobby-avatar-name-tag');
    if (tag) {
      tag.textContent = player.avatarName.toUpperCase();
    }

    // 1. Open Building Lobby Concourse first
    this.openModal('building-lobby-screen');

    // 2. Close avatar selection modal
    this.closeModal('avatar-selection-screen');
    this.showToast(`✨ Character Selected: ${player.avatarName}`, 'reward');

    // 3. Immediately launch Professor Vance Welcome Dialogue in the Lobby
    setTimeout(() => {
      this.startDialogue('lobby_intro');
    }, 200);
  }

  enterRoom1FromLobby() {
    if (window.soundEngine) {
      window.soundEngine.playSuccess();
    }
    this.closeModal('building-lobby-screen');
    window.vintageRoomEngine.setWall(1);
    this.showToast('🚪 Stepping through Room 1 Entrance into the Study...', 'success');
  }

  // ==========================================
  // BUILDING MAP & PARCHMENT BLUEPRINT UI
  // ==========================================
  openBuildingMap() {
    if (window.soundEngine) {
      window.soundEngine.playClick();
    }
    this.openModal('map-modal');
  }

  selectMapRoom(zoneId) {
    if (window.soundEngine) {
      window.soundEngine.playClick();
    }

    switch (zoneId) {
      case 'entrance':
        this.closeModal('map-modal');
        this.openModal('building-lobby-screen');
        this.showToast('🏛️ Entrance Lobby & Professor Vance Concourse', 'success');
        break;

      case 'room1':
        this.closeModal('map-modal');
        this.closeModal('building-lobby-screen');
        window.vintageRoomEngine.setWall(1);
        this.showToast('🚪 Inside Room 1: Introduction to deAsra inspireLIFE', 'success');
        break;

      case 'lobby':
        this.closeModal('map-modal');
        window.roomController.openMasteryCorridor();
        break;

      case 'mindset':
        this.closeModal('map-modal');
        window.roomController.enterSpecializedRoom(2);
        break;

      case 'finance':
        this.closeModal('map-modal');
        window.roomController.enterSpecializedRoom(3);
        break;

      case 'branding':
        this.closeModal('map-modal');
        window.roomController.enterSpecializedRoom(4);
        break;

      case 'ideas':
        this.closeModal('map-modal');
        window.roomController.enterSpecializedRoom(5);
        break;

      default:
        this.closeModal('map-modal');
        break;
    }
  }

  // ==========================================
  // INVENTORY DRAWER
  // ==========================================
  openInventory() {
    const inv = window.gameState.state.inventory.filter(i => i.type !== 'painting_piece' && !i.id?.startsWith('painting_piece_'));
    const grid = document.getElementById('inventory-items-grid');
    if (!grid) return;

    grid.innerHTML = '';
    if (inv.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:24px;">No clues or items collected yet. Explore the room!</div>`;
    } else {
      inv.forEach(item => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot-card has-item';
        slot.innerHTML = `
          <div class="inv-item-icon">${item.icon}</div>
          <div class="inv-item-name">${item.name}</div>
          <div style="font-size:9px;color:var(--text-muted);">${(item.type || '').replace('_', ' ')}</div>
        `;
        slot.onclick = () => {
          if (item.id === 'atm_receipt') {
            this.closeModal('inventory-modal');
            this.openReceiptModal();
          } else if (item.id === 'locker_key') {
            this.closeModal('inventory-modal');
            this.openLockerKeyInspectModal();
          } else {
            this.showToast(`${item.name}: ${item.desc}`, 'reward');
          }
        };
        grid.appendChild(slot);
      });
    }

    this.openModal('inventory-modal');
  }

  openLockerKeyInspectModal() {
    this.openModal('locker-key-inspect-modal');
  }

  // ==========================================
  // ROOM 1 INTERACTIVE PUZZLE TRIGGERS
  // ==========================================
  openScratchPuzzle() {
    this.openModal('scratch-modal');
    setTimeout(() => {
      if (window.puzzleManager) window.puzzleManager.initScratchCard();
    }, 60);
  }

  openKeypadPuzzle() {
    if (window.puzzleManager) {
      window.puzzleManager.openDrawerModal();
    } else {
      this.openModal('keypad-modal');
    }
  }

  pullRedBook() {
    window.puzzleManager.pullRedBook();
  }

  openSafeModal() {
    if (window.puzzleManager) window.puzzleManager.openSafeModal();
    else this.openModal('safe-modal');
  }

  openHandle1Modal() {
    if (window.puzzleManager) window.puzzleManager.openHandle1Modal();
    else this.openModal('handle1-zoom-modal');
  }

  openHandle2Modal() {
    if (window.puzzleManager) window.puzzleManager.openHandle2Modal();
    else this.openModal('handle2-zoom-modal');
  }

  openLockerRoomModal() {
    if (window.puzzleManager) window.puzzleManager.clickLocker07();
    else this.openModal('digital-budget-terminal-modal');
  }

  openClockPuzzle() {
    window.puzzleManager.initClockModalEvents();
    this.openModal('clock-modal');
  }

  inspectPortraits() {
    this.openModal('portraits-modal');
  }

  inspectFloorNote() {
    this.showToast('📜 Blueprint Clue: "The 3 painting fragments are locked in Drawer 01, the Library Safe, and the Wall Clock!"', 'reward');
  }

  toggleLamp() {
    this.lampOn = !this.lampOn;
    if (window.soundEngine) window.soundEngine.playClick();
    this.showToast(this.lampOn ? "💡 The banker's lamp casts warm illumination across the desk." : "💡 Desk lamp toggled.", 'normal');
  }

  openPaintingPuzzle() {
    if (window.puzzleManager) {
      window.puzzleManager.syncPaintingUI();
    }
    this.openModal('painting-modal');
  }

  openNoticeBoard() {
    this.openModal('notice-board-modal');
  }

  openStickyNoteZoom() {
    this.openModal('sticky-note-zoom-modal');
  }

  openATMPuzzle() {
    if (window.puzzleManager) {
      window.puzzleManager.openATMPuzzle();
    } else {
      this.openModal('atm-modal');
    }
  }

  openPinNoteModal() {
    this.openNoticeBoard();
  }

  inspectCounter(type) {
    if (window.puzzleManager) {
      window.puzzleManager.inspectCounter(type);
    } else {
      this.openModal('counter-modal');
    }
  }

  openReceiptModal() {
    if (window.puzzleManager) {
      window.puzzleManager.openReceiptModal();
    } else {
      this.openModal('receipt-modal');
    }
  }

  openKnowledgeBox(kbId) {
    window.roomController.startKnowledgeBox(kbId);
  }

  attemptEscape() {
    window.roomController.escapeRoom1();
  }

  openSpecializedRoomModal(roomId) {
    this.openModal(`room-${roomId}-modal`);
  }

  openLearningReport() {
    window.profileReportManager.renderReport();
  }

  restartGame() {
    if (window.soundEngine) {
      window.soundEngine.playClick();
    }
    if (confirm('Start a completely fresh escape run from the beginning? All puzzles will be reset to unsolved.')) {
      window.gameState.reset();
      window.location.reload();
    }
  }
}

window.app = new App();
window.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
