/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Interactive Puzzle Mechanics Controller
 */

class PuzzleManager {
  constructor() {
    this.scratchCanvas = null;
    this.scratchCtx = null;
    this.isScratching = false;
    this.scratchedPercent = 0;
    this.keypadInput = '';
    this.arrowInput = [];
    this.targetArrowSequence = ['left', 'up', 'up-right'];
    this.atmPinInput = '';
  }

  // ==========================================
  // PUZZLE 1: TABLE FRAME SCRATCH MINI-GAME
  // ==========================================
  initScratchCard() {
    this.scratchCanvas = document.getElementById('scratch-canvas-el');
    if (!this.scratchCanvas) return;
    this.scratchCtx = this.scratchCanvas.getContext('2d');

    const parent = this.scratchCanvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const width = this.scratchCanvas.width = Math.round(rect.width) || 160;
    const height = this.scratchCanvas.height = Math.round(rect.height) || 140;

    // Reset composite operation to normal draw
    this.scratchCtx.globalCompositeOperation = 'source-over';

    // 1. Draw opaque antique golden-bronze wax parchment coating
    const grad = this.scratchCtx.createRadialGradient(width / 2, height / 2, 5, width / 2, height / 2, width);
    grad.addColorStop(0, '#cca872');
    grad.addColorStop(0.4, '#b38c53');
    grad.addColorStop(0.85, '#8c6530');
    grad.addColorStop(1, '#6b491e');
    this.scratchCtx.fillStyle = grad;
    this.scratchCtx.fillRect(0, 0, width, height);

    // 2. Antique double border lines
    this.scratchCtx.strokeStyle = '#4a2f14';
    this.scratchCtx.lineWidth = 2;
    this.scratchCtx.strokeRect(4, 4, width - 8, height - 8);
    this.scratchCtx.strokeStyle = 'rgba(255, 235, 180, 0.45)';
    this.scratchCtx.lineWidth = 1;
    this.scratchCtx.strokeRect(7, 7, width - 14, height - 14);

    // 3. Top filigree ornament
    this.scratchCtx.fillStyle = '#2c1507';
    this.scratchCtx.font = 'bold 9px "Cinzel", Georgia, serif';
    this.scratchCtx.textAlign = 'center';
    this.scratchCtx.fillText('⚜ ──── ❖ ──── ⚜', width / 2, height * 0.32);

    // 4. Center bold headline
    this.scratchCtx.font = '900 15px "Cinzel", Georgia, serif';
    this.scratchCtx.fillStyle = '#180a03';
    this.scratchCtx.fillText('SCRATCH ME', width / 2, height * 0.53);

    // 5. Bottom filigree
    this.scratchCtx.font = 'bold 9px "Cinzel", Georgia, serif';
    this.scratchCtx.fillStyle = '#2c1507';
    this.scratchCtx.fillText('─ ❖ ─', width / 2, height * 0.72);

    // Track scratching points
    let lastX = null;
    let lastY = null;
    this.isScratching = false;

    const erasePoint = (x, y) => {
      this.scratchCtx.globalCompositeOperation = 'destination-out';
      this.scratchCtx.beginPath();
      this.scratchCtx.arc(x, y, 18, 0, Math.PI * 2);
      this.scratchCtx.fill();
    };

    const eraseLine = (x1, y1, x2, y2) => {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.max(1, Math.ceil(dist / 4));
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        erasePoint(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t);
      }
    };

    const getPos = (e) => {
      const r = this.scratchCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * (this.scratchCanvas.width / r.width),
        y: (clientY - r.top) * (this.scratchCanvas.height / r.height)
      };
    };

    const onStart = (e) => {
      e.preventDefault();
      this.isScratching = true;
      const p = getPos(e);
      lastX = p.x;
      lastY = p.y;
      erasePoint(p.x, p.y);
      if (window.soundEngine) window.soundEngine.playScratch();
      this.checkScratchProgress();
    };

    const onMove = (e) => {
      if (!this.isScratching) return;
      e.preventDefault();
      const p = getPos(e);
      if (lastX !== null && lastY !== null) {
        eraseLine(lastX, lastY, p.x, p.y);
      } else {
        erasePoint(p.x, p.y);
      }
      lastX = p.x;
      lastY = p.y;

      if (window.soundEngine && Math.random() > 0.6) {
        window.soundEngine.playScratch();
      }
      this.checkScratchProgress();
    };

    const onEnd = () => {
      this.isScratching = false;
      lastX = null;
      lastY = null;
    };

    this.scratchCanvas.onmousedown = onStart;
    this.scratchCanvas.onmousemove = onMove;
    window.onmouseup = onEnd;

    this.scratchCanvas.ontouchstart = onStart;
    this.scratchCanvas.ontouchmove = onMove;
    window.ontouchend = onEnd;
  }

  checkScratchProgress() {
    if (!this.scratchCtx || !this.scratchCanvas) return;
    const room1 = window.gameState?.state?.rooms?.[1];

    // Calculate transparency
    const imgData = this.scratchCtx.getImageData(0, 0, this.scratchCanvas.width, this.scratchCanvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] === 0) transparentPixels++;
    }

    const percent = (transparentPixels / (imgData.data.length / 4)) * 100;
    if (percent > 38 && room1 && !room1.scratchCompleted) {
      room1.scratchCompleted = true;
      window.gameState.addXP(50);
      window.gameState.save();
      if (window.soundEngine) window.soundEngine.playSuccess();
      if (window.app) {
        window.app.showToast('Passcode Discovered: 29! Enter it into Drawer 01.', 'success');
      }
    }
  }

  // ==========================================
  // FINANCIAL VAULT: DRAWER PIN PUZZLE (PIN: 4629 FROM ATM RECEIPT)
  // ==========================================
  openDrawerModal() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const lockedView = document.getElementById('drawer-locked-view');
    const openedView = document.getElementById('drawer-opened-view');
    const subtitle = document.getElementById('drawer-modal-subtitle');
    const title = document.getElementById('drawer-modal-title');

    if (room1.drawerUnlocked) {
      if (lockedView) lockedView.style.display = 'none';
      if (openedView) openedView.style.display = 'block';
      if (subtitle) subtitle.textContent = 'WALL 2 • HEAVY DARK-METAL DRAWER';
      if (title) title.textContent = 'DRAWER UNLOCKED';
      this.updateDrawerItemsUI();
      this.checkDrawerCompletion();
    } else {
      if (lockedView) lockedView.style.display = 'block';
      if (openedView) openedView.style.display = 'none';
      if (subtitle) subtitle.textContent = 'WALL 2 • HEAVY DARK-METAL DRAWER';
      if (title) title.textContent = 'LOCKED DRAWER';
      this.clearKeypad();
    }

    if (window.app) window.app.openModal('keypad-modal');
  }

  pressKeypad(digit) {
    if (this.keypadInput.length >= 4) return;
    this.keypadInput += digit;
    this.updateKeypadDisplay();
    if (window.soundEngine) window.soundEngine.playClick();

    if (this.keypadInput.length === 4) {
      setTimeout(() => this.validateKeypad(), 300);
    }
  }

  clearKeypad() {
    this.keypadInput = '';
    this.updateKeypadDisplay();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  updateKeypadDisplay() {
    const display = document.getElementById('keypad-display-text');
    if (display) {
      if (this.keypadInput.length === 0) {
        display.textContent = '____';
      } else {
        display.textContent = '•'.repeat(this.keypadInput.length).padEnd(4, '_');
      }
    }
  }

  validateKeypad() {
    if (this.keypadInput === '4629') {
      const room1 = window.gameState.state.rooms[1];
      room1.drawerUnlocked = true;
      window.gameState.addXP(100);
      window.gameState.save();

      if (window.soundEngine) {
        window.soundEngine.playDrawerOpen();
        setTimeout(() => window.soundEngine.playSuccess(), 400);
      }

      if (window.app) {
        window.app.showToast('PIN ACCEPTED! Drawer Unlocked!', 'success');
      }

      // Show Knowledge Box 02 first ("YOU GOT A KNOWLEDGE BOX!").
      // Clicking NEXT will claim reward and transition to 2nd screen (Drawer Opened Interior View)!
      setTimeout(() => {
        if (window.roomController) {
          window.roomController.startKnowledgeBox(2, () => {
            const lockedView = document.getElementById('drawer-locked-view');
            const openedView = document.getElementById('drawer-opened-view');
            const title = document.getElementById('drawer-modal-title');
            if (lockedView) lockedView.style.display = 'none';
            if (openedView) openedView.style.display = 'block';
            if (title) title.textContent = 'DRAWER UNLOCKED';
            this.updateDrawerItemsUI();
            if (window.app) window.app.openModal('keypad-modal');
          });
        }
      }, 500);
    } else {
      const card = document.querySelector('#keypad-modal .modal-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
      }
      if (window.soundEngine) window.soundEngine.playError();
      if (window.app) window.app.showToast('INCORRECT PIN. Check the ATM receipt.', 'error');
      this.clearKeypad();
    }
  }

  collectLockerKey() {
    const room1 = window.gameState.state.rooms[1];
    if (room1.lockerKeyCollected) return;

    room1.lockerKeyCollected = true;
    window.gameState.addItem({
      id: 'locker_key',
      name: 'Locker Key',
      icon: '🗝️',
      desc: 'A metallic key with a distinctive design.'
    });
    window.gameState.addXP(75);
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.showToast('ITEM ACQUIRED: LOCKER KEY 🗝️', 'reward');

    this.updateDrawerItemsUI();
    this.checkDrawerCompletion();
  }

  collectAdditionalCash() {
    const room1 = window.gameState.state.rooms[1];
    if (room1.additionalCashCollected) return;

    room1.additionalCashCollected = true;
    window.gameState.addItem({
      id: 'additional_cash',
      name: 'Additional Cash',
      icon: '💵',
      desc: 'An additional envelope of cash found inside the drawer.'
    });
    window.gameState.addXP(75);
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.showToast('ITEM ACQUIRED: ADDITIONAL CASH 💵', 'reward');

    this.updateDrawerItemsUI();
    this.checkDrawerCompletion();
  }

  updateDrawerItemsUI() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const cardKey = document.getElementById('drawer-item-key');
    const cardCash = document.getElementById('drawer-item-add-cash');
    const cardKb2 = document.getElementById('drawer-item-kb2');
    const statusKey = document.getElementById('status-locker-key');
    const statusCash = document.getElementById('status-additional-cash');
    const statusKb2 = document.getElementById('status-kb2');

    if (room1.lockerKeyCollected) {
      if (cardKey) cardKey.classList.add('collected');
      if (statusKey) statusKey.textContent = '✓ COLLECTED';
    }
    if (room1.additionalCashCollected) {
      if (cardCash) cardCash.classList.add('collected');
      if (statusCash) statusCash.textContent = '✓ COLLECTED';
    }
    if (room1.kbsFound && room1.kbsFound.includes(2)) {
      if (cardKb2) cardKb2.classList.add('collected');
      if (statusKb2) { statusKb2.textContent = '✓ COMPLETED'; statusKb2.style.color = '#2ecc71'; }
    }
  }

  checkDrawerCompletion() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    if (room1.lockerKeyCollected && room1.additionalCashCollected) {
      const noteBanner = document.getElementById('drawer-engraved-note');
      if (noteBanner) noteBanner.style.display = 'block';
    }
  }

  // ==========================================
  // FINANCIAL VAULT: ARROW-PATTERN SUITCASE PUZZLE
  // ==========================================
  openSuitcaseModal() {
    const room1 = window.gameState?.state?.rooms?.[1];
    const lockedView = document.getElementById('suitcase-locked-view');
    const openedView = document.getElementById('suitcase-opened-view');
    const subtitle = document.getElementById('suitcase-status-subtitle');

    if (room1 && room1.suitcaseOpened) {
      if (lockedView) lockedView.style.display = 'none';
      if (openedView) openedView.style.display = 'block';
      if (subtitle) subtitle.textContent = 'UNLOCKED • Suitcase Opened';
      this.updateSuitcaseItemsUI();
    } else {
      if (lockedView) lockedView.style.display = 'block';
      if (openedView) openedView.style.display = 'none';
      if (subtitle) subtitle.textContent = 'LOCKED • The pattern must be matched.';
      this.clearArrowKeys();
    }
    if (window.app) window.app.openModal('suitcase-modal');
  }

  pressArrowKey(dir) {
    if (this.arrowInput.length >= 3) return;
    this.arrowInput.push(dir);
    if (window.soundEngine) window.soundEngine.playClick();
    this.updateArrowDisplay();

    if (this.arrowInput.length === 3) {
      setTimeout(() => this.validateArrowPattern(), 300);
    }
  }

  clearArrowKeys() {
    this.arrowInput = [];
    this.updateArrowDisplay();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  updateArrowDisplay() {
    const symbols = {
      'up-left': '↖',
      'up': '⬆',
      'up-right': '↗',
      'right': '➡',
      'down-right': '↘',
      'down': '⬇',
      'down-left': '↙',
      'left': '⬅'
    };
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`arrow-slot-${i}`);
      if (slot) {
        if (i < this.arrowInput.length) {
          slot.textContent = symbols[this.arrowInput[i]] || '_';
          slot.classList.add('filled');
        } else {
          slot.textContent = '_';
          slot.classList.remove('filled');
        }
      }
    }
  }

  validateArrowPattern() {
    const isCorrect = this.arrowInput.length === 3 &&
      this.arrowInput[0] === 'left' &&
      this.arrowInput[1] === 'up' &&
      this.arrowInput[2] === 'up-right';

    const subtitle = document.getElementById('suitcase-status-subtitle');

    if (isCorrect) {
      const room1 = window.gameState.state.rooms[1];
      room1.suitcaseUnlocked = true;
      room1.suitcaseOpened = true;
      window.gameState.addXP(100);
      window.gameState.save();

      if (subtitle) subtitle.textContent = 'PATTERN MATCHED!';

      if (window.soundEngine) {
        if (window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
        setTimeout(() => window.soundEngine.playSuccess(), 400);
      }

      if (window.app) {
        window.app.showToast('PATTERN MATCHED! Suitcase Unlocked!', 'success');
        window.app.closeModal('suitcase-modal');
      }

      // Show Knowledge Box 01 first ("YOU DISCOVERED A KNOWLEDGE CHEST!").
      // Clicking NEXT will claim reward and transition to 2nd screen (Suitcase Opened Interior View)!
      setTimeout(() => {
        if (window.roomController) {
          window.roomController.startKnowledgeBox(1, () => {
            const lockedView = document.getElementById('suitcase-locked-view');
            const openedView = document.getElementById('suitcase-opened-view');
            if (lockedView) lockedView.style.display = 'none';
            if (openedView) openedView.style.display = 'block';
            this.updateSuitcaseItemsUI();
            if (window.app) window.app.openModal('suitcase-modal');
          });
        }
      }, 400);

    } else {
      const card = document.querySelector('#suitcase-modal .modal-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
      }
      if (subtitle) subtitle.textContent = 'Incorrect Pattern';
      if (window.soundEngine) window.soundEngine.playError();
      if (window.app) window.app.showToast('Incorrect Pattern. Observe the tree direction clue.', 'error');
      setTimeout(() => this.clearArrowKeys(), 600);
    }
  }

  collectSuitcaseItem(itemId) {
    const room1 = window.gameState.state.rooms[1];
    if (itemId === 'atm_card') {
      if (!room1.atmCardCollected) {
        room1.atmCardCollected = true;
        window.gameState.addItem({ id: 'atm_card', name: 'ATM Card', icon: '💳' });
        if (window.app) window.app.showToast('ITEM ACQUIRED: ATM CARD', 'reward');
        this.updateSuitcaseItemsUI();
      }
    } else if (itemId === 'main_safe_handle') {
      if (!room1.safeHandleCollected) {
        room1.safeHandleCollected = true;
        window.gameState.addItem({ id: 'main_safe_handle', name: 'Main Safe Handle', icon: '⚙️' });
        if (window.app) window.app.showToast('ITEM ACQUIRED: MAIN SAFE HANDLE ⚙️', 'reward');
        this.updateSuitcaseItemsUI();

        // Subtle glow connection to main vault on Wall 4
        const vaultDot = document.getElementById('w4-sticky-note-dot');
        if (vaultDot) {
          vaultDot.classList.add('subtle-pulse-glow');
          setTimeout(() => vaultDot.classList.remove('subtle-pulse-glow'), 2500);
        }
      }
    }
  }

  updateSuitcaseItemsUI() {
    const room1 = window.gameState?.state?.rooms?.[1];
    const statusAtm = document.getElementById('status-atm-card');
    const statusHandle = document.getElementById('status-main-safe-handle');
    const statusKb1 = document.getElementById('status-kb1');
    const cardAtm = document.getElementById('suitcase-item-card-atm');
    const cardHandle = document.getElementById('suitcase-item-card-handle');
    const cardKb1 = document.getElementById('suitcase-item-card-kb1');

    if (room1?.atmCardCollected) {
      if (statusAtm) statusAtm.textContent = '✓ COLLECTED';
      if (cardAtm) cardAtm.classList.add('collected');
    }
    if (room1?.safeHandleCollected) {
      if (statusHandle) statusHandle.textContent = '✓ COLLECTED';
      if (cardHandle) cardHandle.classList.add('collected');
    }
    if (room1?.kbsFound?.includes(1)) {
      if (statusKb1) { statusKb1.textContent = '✓ COMPLETED'; statusKb1.style.color = '#2ecc71'; }
      if (cardKb1) cardKb1.classList.add('collected');
    }
  }

  // ==========================================
  // FINANCIAL VAULT: ATM MACHINE PUZZLE (PIN 7358)
  // ==========================================
  openATMPuzzle() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const hasCard = window.gameState?.hasItem('atm_card') || room1.atmCardCollected;

    const initialPanel = document.getElementById('atm-state-initial');
    const processingPanel = document.getElementById('atm-state-processing');
    const pinRequiredPanel = document.getElementById('atm-state-pin-required');
    const grantedPanel = document.getElementById('atm-state-granted');
    const completedPanel = document.getElementById('atm-state-completed');

    const statusBadge = document.getElementById('atm-status-tag');
    const keypadSec = document.getElementById('atm-keypad-section');
    const compartmentSec = document.getElementById('atm-lower-compartment');
    const slotLight = document.getElementById('atm-slot-light');
    const insertBtn = document.getElementById('btn-insert-atm-card');

    // Hide all state panels first
    if (initialPanel) initialPanel.style.display = 'none';
    if (processingPanel) processingPanel.style.display = 'none';
    if (pinRequiredPanel) pinRequiredPanel.style.display = 'none';
    if (grantedPanel) grantedPanel.style.display = 'none';
    if (completedPanel) completedPanel.style.display = 'none';

    if (room1.cashCollected && room1.safeDialCollected && room1.receiptCollected) {
      // Completed state
      if (completedPanel) completedPanel.style.display = 'flex';
      if (statusBadge) {
        statusBadge.textContent = 'COMPLETED';
        statusBadge.className = 'atm-status-badge active';
      }
      if (keypadSec) keypadSec.style.display = 'none';
      if (compartmentSec) compartmentSec.style.display = 'block';
      if (slotLight) slotLight.className = 'card-slot-light active';
      if (insertBtn) insertBtn.style.display = 'none';
      this.updateDispensedItemsUI();

    } else if (room1.atmUnlocked) {
      // Unlocked state (Access granted & Dispenser open)
      if (grantedPanel) grantedPanel.style.display = 'flex';
      if (statusBadge) {
        statusBadge.textContent = 'UNLOCKED';
        statusBadge.className = 'atm-status-badge active';
      }
      if (keypadSec) keypadSec.style.display = 'none';
      if (compartmentSec) compartmentSec.style.display = 'block';
      if (slotLight) slotLight.className = 'card-slot-light active';
      if (insertBtn) insertBtn.style.display = 'none';
      this.updateDispensedItemsUI();

    } else if (room1.atmCardInserted) {
      // Card inserted state -> Keypad active
      if (pinRequiredPanel) pinRequiredPanel.style.display = 'flex';
      if (statusBadge) {
        statusBadge.textContent = 'CARD INSERTED';
        statusBadge.className = 'atm-status-badge active';
      }
      if (keypadSec) keypadSec.style.display = 'block';
      if (compartmentSec) compartmentSec.style.display = 'none';
      if (slotLight) slotLight.className = 'card-slot-light active';
      if (insertBtn) insertBtn.style.display = 'none';
      this.updateATMPinDisplay();

    } else {
      // Initial state -> Insert card required
      if (initialPanel) initialPanel.style.display = 'flex';
      if (statusBadge) {
        statusBadge.textContent = 'LOCKED';
        statusBadge.className = 'atm-status-badge';
      }
      if (keypadSec) keypadSec.style.display = 'none';
      if (compartmentSec) compartmentSec.style.display = 'none';
      if (slotLight) slotLight.className = 'card-slot-light';

      if (insertBtn) {
        insertBtn.style.display = 'block';
        if (hasCard) {
          insertBtn.disabled = false;
          insertBtn.innerHTML = '💳 INSERT ATM CARD FROM INVENTORY →';
        } else {
          insertBtn.disabled = true;
          insertBtn.innerHTML = '🔒 ATM CARD REQUIRED (FIND IN SUITCASE)';
        }
      }
    }

    if (window.app) window.app.openModal('atm-modal');
  }

  insertATMCard() {
    const room1 = window.gameState?.state?.rooms?.[1];
    const hasCard = window.gameState?.hasItem('atm_card') || room1?.atmCardCollected;

    if (!hasCard) {
      if (window.app) window.app.showToast('ATM Card required! Collect it from the Suitcase on Wall 2.', 'error');
      return;
    }

    if (room1) {
      room1.atmCardInserted = true;
      window.gameState.save();
    }

    const animCard = document.getElementById('atm-anim-card');
    const initialPanel = document.getElementById('atm-state-initial');
    const processingPanel = document.getElementById('atm-state-processing');
    const pinRequiredPanel = document.getElementById('atm-state-pin-required');
    const insertBtn = document.getElementById('btn-insert-atm-card');
    const statusBadge = document.getElementById('atm-status-tag');
    const slotLight = document.getElementById('atm-slot-light');
    const keypadSec = document.getElementById('atm-keypad-section');

    if (insertBtn) insertBtn.style.display = 'none';

    // Play card animation & sound
    if (animCard) animCard.style.display = 'block';
    if (window.soundEngine) {
      if (window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
    }

    // Step 1: Processing
    if (initialPanel) initialPanel.style.display = 'none';
    if (processingPanel) processingPanel.style.display = 'flex';
    if (statusBadge) {
      statusBadge.textContent = 'PROCESSING...';
      statusBadge.className = 'atm-status-badge active';
    }

    setTimeout(() => {
      if (animCard) animCard.style.display = 'none';
      if (processingPanel) processingPanel.style.display = 'none';
      if (pinRequiredPanel) pinRequiredPanel.style.display = 'flex';
      if (keypadSec) keypadSec.style.display = 'block';
      if (slotLight) slotLight.className = 'card-slot-light active';
      if (statusBadge) statusBadge.textContent = 'ENTER PIN';

      if (window.soundEngine) window.soundEngine.playClick();
      if (window.app) window.app.showToast('CARD DETECTED! Find the 4-digit PIN in the room.', 'reward');

      this.clearATMKeypad();
    }, 1400);
  }

  pressATMKeypad(digit) {
    if (this.atmPinInput.length >= 4) return;
    this.atmPinInput += digit;
    if (window.soundEngine) window.soundEngine.playClick();
    this.updateATMPinDisplay();

    if (this.atmPinInput.length === 4) {
      setTimeout(() => this.validateATMPin(), 350);
    }
  }

  clearATMKeypad() {
    this.atmPinInput = '';
    this.updateATMPinDisplay();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  updateATMPinDisplay() {
    const display = document.getElementById('atm-pin-digits');
    if (display) {
      if (this.atmPinInput.length === 0) {
        display.textContent = '____';
      } else {
        display.textContent = '•'.repeat(this.atmPinInput.length).padEnd(4, '_');
      }
    }
  }

  validateATMPin() {
    if (this.atmPinInput === '7358') {
      const room1 = window.gameState.state.rooms[1];
      room1.atmUnlocked = true;
      window.gameState.addXP(150);
      window.gameState.save();

      const pinRequiredPanel = document.getElementById('atm-state-pin-required');
      const grantedPanel = document.getElementById('atm-state-granted');
      const statusBadge = document.getElementById('atm-status-tag');
      const keypadSec = document.getElementById('atm-keypad-section');
      const compartmentSec = document.getElementById('atm-lower-compartment');

      if (pinRequiredPanel) pinRequiredPanel.style.display = 'none';
      if (grantedPanel) grantedPanel.style.display = 'flex';
      if (statusBadge) {
        statusBadge.textContent = 'ACCESS GRANTED';
        statusBadge.className = 'atm-status-badge active';
      }

      if (window.soundEngine) {
        window.soundEngine.playSuccess();
        setTimeout(() => {
          if (window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
        }, 500);
      }

      if (window.app) window.app.showToast('PIN ACCEPTED! ACCESS GRANTED!', 'success');

      setTimeout(() => {
        if (keypadSec) keypadSec.style.display = 'none';
        if (compartmentSec) compartmentSec.style.display = 'block';
        this.updateDispensedItemsUI();
      }, 800);

    } else {
      const card = document.querySelector('#atm-modal .modal-card');
      if (card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
      }
      if (window.soundEngine) window.soundEngine.playError();
      if (window.app) window.app.showToast('Incorrect PIN! Match the clue note to the 4 Financial Counters.', 'error');
      this.clearATMKeypad();
    }
  }

  collectCash() {
    const room1 = window.gameState.state.rooms[1];
    if (room1.cashCollected) return;

    room1.cashCollected = true;
    window.gameState.addItem({
      id: 'cash',
      name: 'Cash Bundle',
      icon: '💵',
      desc: 'A stack of currency dispensed from the Financial Vault ATM.'
    });
    window.gameState.addXP(75);
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.showToast('ITEM ACQUIRED: CASH 💵', 'reward');

    this.updateDispensedItemsUI();
    this.checkATMCompletion();
  }

  collectSafeDial() {
    const room1 = window.gameState.state.rooms[1];
    if (room1.safeDialCollected) return;

    room1.safeDialCollected = true;
    window.gameState.addItem({
      id: 'safe_dial',
      name: 'Safe Dial',
      icon: '⚙️',
      desc: 'A heavy metallic Safe Dial matching the Main Safe combination lock.'
    });
    window.gameState.addXP(75);
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.showToast('ITEM ACQUIRED: SAFE DIAL ⚙️', 'reward');

    this.updateDispensedItemsUI();
    this.checkATMCompletion();
  }

  collectReceipt() {
    const room1 = window.gameState.state.rooms[1];
    if (room1.receiptCollected) return;

    room1.receiptCollected = true;
    window.gameState.addItem({
      id: 'atm_receipt',
      name: 'ATM Receipt (#481)',
      icon: '🧾',
      desc: 'ATM Transaction Receipt with Receipt No. #481 printed at the top.'
    });
    window.gameState.addXP(75);
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.showToast('ITEM ACQUIRED: ATM RECEIPT (#481) 🧾', 'reward');

    this.updateDispensedItemsUI();
    this.checkATMCompletion();

    setTimeout(() => {
      this.openReceiptModal();
    }, 400);
  }

  openReceiptModal() {
    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app) window.app.openModal('receipt-modal');
  }

  updateDispensedItemsUI() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const itemCash = document.getElementById('atm-item-cash');
    const itemDial = document.getElementById('atm-item-safe-dial');
    const itemReceipt = document.getElementById('atm-item-receipt');
    const textCash = document.getElementById('cash-status-text');
    const textDial = document.getElementById('dial-status-text');
    const textReceipt = document.getElementById('receipt-status-text');

    if (room1.cashCollected) {
      if (itemCash) itemCash.classList.add('collected');
      if (textCash) textCash.textContent = '✓ COLLECTED';
    }
    if (room1.safeDialCollected) {
      if (itemDial) itemDial.classList.add('collected');
      if (textDial) textDial.textContent = '✓ COLLECTED';
    }
    if (room1.receiptCollected) {
      if (itemReceipt) itemReceipt.classList.add('collected');
      if (textReceipt) textReceipt.textContent = '✓ COLLECTED';
    }
  }

  checkATMCompletion() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    if (room1.cashCollected && room1.safeDialCollected && room1.receiptCollected) {
      const grantedPanel = document.getElementById('atm-state-granted');
      const completedPanel = document.getElementById('atm-state-completed');
      const statusBadge = document.getElementById('atm-status-tag');

      if (grantedPanel) grantedPanel.style.display = 'none';
      if (completedPanel) completedPanel.style.display = 'flex';
      if (statusBadge) {
        statusBadge.textContent = 'TRANSACTION COMPLETE';
        statusBadge.className = 'atm-status-badge active';
      }

      if (window.app) {
        setTimeout(() => {
          window.app.showToast('🎉 RECEIPT ACQUIRED! Passcode 481 unlocks Drawer 01 Keypad!', 'reward');
        }, 500);
      }
    }
  }

  openPinNoteModal() {
    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app) window.app.openNoticeBoard();
  }

  inspectCounter(type) {
    const counters = {
      deposit: { name: 'DEPOSIT', number: '7', clue: 'Money coming in (Line 1)', icon: '📈' },
      withdrawal: { name: 'WITHDRAWAL', number: '3', clue: 'Money going out (Line 2)', icon: '📉' },
      transfer: { name: 'TRANSFER', number: '8', clue: 'Money moving away (Line 3)', icon: '💸' },
      savings: { name: 'SAVINGS', number: '5', clue: 'Money kept aside (Line 4)', icon: '🏦' }
    };

    const sel = counters[type] || counters.deposit;

    const titleEl = document.getElementById('counter-modal-title');
    const iconEl = document.getElementById('counter-modal-icon');
    const nameEl = document.getElementById('counter-modal-name');
    const numEl = document.getElementById('counter-modal-number');
    const clueEl = document.getElementById('counter-modal-clue');

    if (titleEl) titleEl.textContent = sel.name;
    if (iconEl) iconEl.textContent = sel.icon;
    if (nameEl) nameEl.textContent = sel.name;
    if (numEl) numEl.textContent = sel.number;
    if (clueEl) clueEl.textContent = sel.clue;

    if (window.soundEngine) window.soundEngine.playClick();
    if (window.app) window.app.openModal('counter-modal');
  }

  // ==========================================
  syncVaultUI() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const isInstalled1 = room1.safeHandle1Installed || room1.safeHandleInstalled;
    const angle1 = room1.handle1Angle || 0;

    const w3Wheel = document.getElementById('w3-installed-handle1-container');
    if (w3Wheel) {
      w3Wheel.style.display = isInstalled1 ? 'block' : 'none';
      w3Wheel.style.transform = `translate(-50%, -50%) rotate(${angle1}deg)`;
    }

    const w3Badge1 = document.getElementById('w3-handle1-degree-badge');
    if (w3Badge1) {
      w3Badge1.style.display = isInstalled1 ? 'block' : 'none';
      w3Badge1.textContent = `${angle1}°`;
    }

    const modalWheel = document.getElementById('safe-modal-handle1-container');
    if (modalWheel) {
      modalWheel.style.display = isInstalled1 ? 'block' : 'none';
      modalWheel.style.transform = `translate(-50%, -50%) rotate(${angle1}deg)`;
    }

    const modalBadge1 = document.getElementById('safe-modal-handle1-degree-badge');
    if (modalBadge1) {
      modalBadge1.style.display = isInstalled1 ? 'block' : 'none';
      modalBadge1.textContent = `${angle1}°`;
    }

    const zoomWheel = document.getElementById('handle1-placed-wheel-img');
    if (zoomWheel) {
      zoomWheel.style.display = isInstalled1 ? 'block' : 'none';
      zoomWheel.style.transform = `translate(-50%, -50%) rotate(${angle1}deg)`;
    }

    const zoomBadge1 = document.getElementById('handle1-zoom-degree-badge');
    if (zoomBadge1) {
      zoomBadge1.style.display = isInstalled1 ? 'block' : 'none';
      zoomBadge1.textContent = `${angle1}°`;
    }

    const isInstalled2 = room1.safeHandle2Installed;
    const angle2 = room1.handle2Angle || 0;

    const w3Wheel2 = document.getElementById('w3-installed-handle2-container');
    if (w3Wheel2) {
      w3Wheel2.style.display = isInstalled2 ? 'block' : 'none';
      w3Wheel2.style.transform = `translate(-50%, -50%) rotate(${angle2}deg)`;
    }

    const modalWheel2 = document.getElementById('safe-modal-handle2-container');
    if (modalWheel2) {
      modalWheel2.style.display = isInstalled2 ? 'block' : 'none';
      modalWheel2.style.transform = `translate(-50%, -50%) rotate(${angle2}deg)`;
    }

    const zoomWheel2 = document.getElementById('handle2-placed-wheel-img');
    if (zoomWheel2) {
      zoomWheel2.style.display = isInstalled2 ? 'block' : 'none';
      zoomWheel2.style.transform = `translate(-50%, -50%) rotate(${angle2}deg)`;
    }

    const safeSubtitle = document.getElementById('safe-modal-subtitle');
    if (safeSubtitle) {
      if (room1.vaultSafeUnlocked) {
        safeSubtitle.textContent = '🔓 VAULT SAFE UNLOCKED! Locker Room is open and accessible.';
        safeSubtitle.style.color = '#2ecc71';
      } else {
        safeSubtitle.textContent = `Vault Safe Combination: Handle 1 [${angle1}° / Target 60°] • Handle 2 [${angle2}° / Target 120°]`;
      }
    }
  }

  rotateHandle(handleNum) {
    const room1 = window.gameState.state.rooms[1];

    if (handleNum === 1) {
      const isInstalled1 = room1.safeHandle1Installed || room1.safeHandleInstalled;
      if (!isInstalled1) {
        this.installHandle(1);
        return;
      }
      room1.handle1Angle = ((room1.handle1Angle || 0) + 30) % 360;
      if (window.soundEngine) window.soundEngine.playClick();
      if (window.app) window.app.showToast(`🔄 Handle 1 Rotated to ${room1.handle1Angle}°`, 'normal');
      window.gameState.save();
      this.syncVaultUI();
      this.openHandle1Modal();
      this.checkVaultSafeCombination();

    } else if (handleNum === 2) {
      const isInstalled2 = room1.safeHandle2Installed;
      if (!isInstalled2) {
        this.installHandle(2);
        return;
      }
      room1.handle2Angle = ((room1.handle2Angle || 0) + 30) % 360;
      if (window.soundEngine) window.soundEngine.playClick();
      if (window.app) window.app.showToast(`🔄 Handle 2 Rotated to ${room1.handle2Angle}°`, 'normal');
      window.gameState.save();
      this.syncVaultUI();
      this.openHandle2Modal();
      this.checkVaultSafeCombination();
    }
  }

  checkVaultSafeCombination() {
    const room1 = window.gameState.state.rooms[1];
    const isInstalled1 = room1.safeHandle1Installed || room1.safeHandleInstalled;
    const isInstalled2 = room1.safeHandle2Installed;
    const angle1 = room1.handle1Angle || 0;
    const angle2 = room1.handle2Angle || 0;

    if (isInstalled1 && isInstalled2 && angle1 === 60 && angle2 === 120) {
      if (!room1.vaultSafeUnlocked) {
        room1.vaultSafeUnlocked = true;
        window.gameState.addXP(250);
        window.gameState.save();

        if (window.soundEngine) {
          if (window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
          setTimeout(() => window.soundEngine.playSuccess(), 350);
        }

        if (window.app) {
          window.app.showToast('🔓 VAULT SAFE UNLOCKED! (Handle 1: 60°, Handle 2: 120°) — WALL 5 UNLOCKED!', 'success');
        }

        this.syncVaultUI();

        const goToWall5 = () => {
          if (window.app) {
            window.app.closeModal('safe-modal');
            window.app.closeModal('handle1-zoom-modal');
            window.app.closeModal('handle2-zoom-modal');
          }
          if (window.vintageRoomEngine) {
            window.vintageRoomEngine.unlockWall5();
          }
          if (window.app) {
            window.app.showToast('🔍 Wall 5 Unlocked! Click Locker No. 7533 on Wall 5 to open the Budget Allocation Terminal.', 'info');
          }
        };

        // Show Knowledge Box 03 first ("YOU GOT A KNOWLEDGE BOX!").
        // Clicking NEXT will unlock and switch view to Wall 5 (Locker Room)!
        setTimeout(() => {
          if (window.roomController) {
            window.roomController.startKnowledgeBox(3, goToWall5);
          } else {
            goToWall5();
          }
        }, 500);
      }
    }
  }

  openLockerRoomModal() {
    this.syncVaultUI();
    if (window.app) {
      window.app.closeModal('safe-modal');
      window.app.closeModal('handle1-zoom-modal');
      window.app.closeModal('handle2-zoom-modal');
    }
    if (window.vintageRoomEngine) {
      window.vintageRoomEngine.unlockWall5();
    }
  }

  collectVaultCash() {
    const room1 = window.gameState?.state?.rooms?.[1];
    if (!room1) return;
    if (room1.vaultCashCollected) {
      if (window.app) window.app.showToast('Reserve cash already collected! +$10,000 in funds.', 'normal');
      return;
    }
    room1.vaultCashCollected = true;
    window.gameState.addXP(250);
    window.gameState.save();

    const cashStatus = document.getElementById('locker-cash-status-text');
    if (cashStatus) {
      cashStatus.textContent = '✓ COLLECTED (+$10,000)';
      cashStatus.style.color = '#2ecc71';
    }

    if (window.soundEngine) window.soundEngine.playSuccess();
    if (window.app) window.app.showToast('💵 VAULT RESERVE CASH COLLECTED! +$10,000 added to budget funds!', 'reward');
  }

  openSafeModal() {
    this.syncVaultUI();
    const room1 = window.gameState.state.rooms[1];
    if (room1.vaultSafeUnlocked) {
      this.openLockerRoomModal();
    } else {
      if (window.app) window.app.openModal('safe-modal');
    }
  }

  openHandle1Modal() {
    this.syncVaultUI();
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const btn1 = document.getElementById('btn-place-handle-1');
    const subtitle = document.getElementById('handle1-prompt-subtitle');
    const socketGlow = document.getElementById('handle1-center-socket-glow');

    if (room1.vaultSafeUnlocked) {
      this.openLockerRoomModal();
      return;
    }

    const hasHandle1 = window.gameState?.hasItem('main_safe_handle') || room1.safeHandle1Installed || room1.safeHandleInstalled;
    const isInstalled1 = room1.safeHandle1Installed || room1.safeHandleInstalled;
    const angle1 = room1.handle1Angle || 0;

    if (socketGlow) {
      socketGlow.style.display = isInstalled1 ? 'none' : 'block';
    }

    if (btn1) {
      if (isInstalled1) {
        btn1.textContent = `🔄 ROTATE HANDLE 1 (30°/CLICK) — CURRENT: ${angle1}°`;
        btn1.disabled = false;
        btn1.onclick = () => this.rotateHandle(1);
        if (subtitle) subtitle.textContent = `Handle 1 Installed! Current Rotation: ${angle1}° (Target: 60°). Click wheel or button to rotate.`;
      } else if (hasHandle1) {
        btn1.textContent = '⚙️ PLACE HANDLE 1 HERE →';
        btn1.disabled = false;
        btn1.onclick = () => this.installHandle(1);
        if (subtitle) subtitle.textContent = 'Place Handle 1 here.';
      } else {
        btn1.textContent = '🔒 HANDLE 1 REQUIRED (FIND IN SUITCASE)';
        btn1.disabled = true;
        btn1.onclick = null;
        if (subtitle) subtitle.textContent = 'Place Handle 1 here. (Main Safe Handle required)';
      }
    }

    if (!isInstalled1 && !hasHandle1 && window.app) {
      window.app.showToast('🔒 You need Handle 1 to place here! Find it in the Suitcase on Wall 2.', 'error');
    }

    if (window.app) window.app.openModal('handle1-zoom-modal');
  }

  openHandle2Modal() {
    this.syncVaultUI();
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const btn2 = document.getElementById('btn-place-handle-2');
    const subtitle = document.getElementById('handle2-prompt-subtitle');
    const socketGlow = document.getElementById('handle2-center-socket-glow');

    if (room1.vaultSafeUnlocked) {
      this.openLockerRoomModal();
      return;
    }

    const hasHandle2 = window.gameState?.hasItem('safe_dial') || room1.safeHandle2Installed;
    const isInstalled2 = room1.safeHandle2Installed;
    const angle2 = room1.handle2Angle || 0;

    if (socketGlow) {
      socketGlow.style.display = isInstalled2 ? 'none' : 'block';
    }

    if (btn2) {
      if (isInstalled2) {
        btn2.textContent = `🔄 ROTATE HANDLE 2 (30°/CLICK) — CURRENT: ${angle2}°`;
        btn2.disabled = false;
        btn2.onclick = () => this.rotateHandle(2);
        if (subtitle) subtitle.textContent = `Handle 2 Installed! Current Rotation: ${angle2}° (Target: 120°). Click wheel or button to rotate.`;
      } else if (hasHandle2) {
        btn2.textContent = '⚙️ PLACE HANDLE 2 HERE →';
        btn2.disabled = false;
        btn2.onclick = () => this.installHandle(2);
        if (subtitle) subtitle.textContent = 'Place Handle 2 here.';
      } else {
        btn2.textContent = '🔒 HANDLE 2 REQUIRED (FIND IN ATM)';
        btn2.disabled = true;
        btn2.onclick = null;
        if (subtitle) subtitle.textContent = 'Place Handle 2 here. (Safe Dial required from ATM)';
      }
    }

    if (!isInstalled2 && !hasHandle2 && window.app) {
      window.app.showToast('🔒 You need Handle 2 (Safe Dial) to place here! Collect it from the ATM on Wall 2.', 'error');
    }

    if (window.app) window.app.openModal('handle2-zoom-modal');
  }

  installHandle(handleNumber) {
    const room1 = window.gameState.state.rooms[1];

    if (handleNumber === 1) {
      if (room1.safeHandle1Installed || room1.safeHandleInstalled) {
        this.rotateHandle(1);
        return;
      }
      const hasHandle = window.gameState?.hasItem('main_safe_handle');
      if (!hasHandle) {
        if (window.app) window.app.showToast('Handle 1 required! Find the Main Safe Handle inside the Suitcase on Wall 2.', 'error');
        return;
      }

      room1.safeHandle1Installed = true;
      room1.safeHandleInstalled = true;
      room1.handle1Angle = 0;
      window.gameState.addXP(100);
      window.gameState.save();

      if (window.soundEngine) {
        if (window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
        setTimeout(() => window.soundEngine.playSuccess(), 300);
      }

      if (window.app) window.app.showToast('HANDLE 1 INSTALLED! Click to rotate in 30° steps (Target: 60°).', 'success');
      this.syncVaultUI();
      this.openHandle1Modal();

    } else if (handleNumber === 2) {
      if (room1.safeHandle2Installed) {
        this.rotateHandle(2);
        return;
      }
      const hasDial = window.gameState?.hasItem('safe_dial');
      if (!hasDial) {
        if (window.app) window.app.showToast('Handle 2 required! Collect the Safe Dial from the ATM on Wall 2.', 'error');
        return;
      }

      room1.safeHandle2Installed = true;
      room1.handle2Angle = 0;
      window.gameState.addXP(100);
      window.gameState.save();

      if (window.soundEngine) {
        if (window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
        setTimeout(() => window.soundEngine.playSuccess(), 300);
      }

      if (window.app) window.app.showToast('HANDLE 2 INSTALLED! Click to rotate in 30° steps (Target: 120°).', 'success');
      this.syncVaultUI();
      this.openHandle2Modal();
    }
  }

  installMainSafeHandle() {
    this.installHandle(1);
  }

  openSafeDialCombination() {
    this.openSafeModal();
  }

  pullRedBook() {
    this.openSafeModal();
  }

  openSafe() {
    this.openSafeModal();
  }

  // ==========================================
  // PUZZLE 3: WALL CLOCK (TIME: 04:00 or 4:00)
  // ==========================================
  initClockModalEvents() {
    const input = document.getElementById('clock-input-val');
    if (input) {
      input.oninput = () => {
        const val = input.value.trim();
        const parts = val.split(':');
        let h = parseInt(parts[0]) || 0;
        let m = parseInt(parts[1]) || 0;
        const hDeg = (h % 12) * 30 + (m / 60) * 30;
        const mDeg = (m % 60) * 6;

        const modalH = document.getElementById('modal-clock-hand-h');
        const modalM = document.getElementById('modal-clock-hand-m');
        const wallH = document.getElementById('wall-1-svg-hour-hand');
        const wallM = document.getElementById('wall-1-svg-min-hand');

        if (modalH) modalH.style.transform = `rotate(${hDeg}deg)`;
        if (modalM) modalM.style.transform = `rotate(${mDeg}deg)`;
        if (wallH) wallH.style.transform = `rotate(${hDeg}deg)`;
        if (wallM) wallM.style.transform = `rotate(${mDeg}deg)`;
      };
    }
  }

  submitClockTime(timeString) {
    const clean = timeString.trim().toLowerCase();
    if (clean === '04:00' || clean === '4:00' || clean === '0400' || clean === '4') {
      const room1 = window.gameState.state.rooms[1];
      room1.clockSolved = true;
      window.gameState.addXP(100);
      window.gameState.save();

      if (window.soundEngine) {
        window.soundEngine.playClockChime();
        setTimeout(() => window.soundEngine.playSuccess(), 600);
      }
      if (window.app) {
        window.app.closeModal('clock-modal');
        window.app.showToast('Clock Hands Align! Secret Compartment Opened!', 'success');
        setTimeout(() => window.app.openKnowledgeBox(3), 700);
      }
      return true;
    } else {
      if (window.soundEngine) window.soundEngine.playError();
      if (window.app) {
        window.app.showToast('Incorrect Time. Re-read the Mysterious Note.', 'error');
      }
      return false;
    }
  }

  // ==========================================
  // FINAL PUZZLE: 3-PIECE PAINTING ASSEMBLY & RESTORATION
  // ==========================================
  syncPaintingUI() {
    const room1 = window.gameState?.state?.rooms?.[1];
    if (!room1) return;
    if (!room1.piecesPlaced) room1.piecesPlaced = [];

    // Sync each of the 3 slots in Modal & Wall 3
    for (let i = 1; i <= 3; i++) {
      const slot = document.getElementById(`painting-slot-${i}`);
      const btn = document.getElementById(`piece-thumb-${i}`);
      const isPlaced = room1.piecesPlaced.includes(i);
      const hasItem = window.gameState.hasItem(`painting_piece_${i}`) || (room1.kbsFound?.includes(i) && !isPlaced);

      if (slot) {
        slot.classList.toggle('filled', isPlaced);
      }

      if (btn) {
        if (isPlaced) {
          btn.classList.add('placed');
          btn.disabled = true;
          btn.innerHTML = `<span>✓</span> Fragment ${i} (Restored)`;
        } else if (hasItem) {
          btn.classList.remove('placed');
          btn.disabled = false;
          btn.innerHTML = `<span>🧩</span> Place Fragment ${i}`;
        } else {
          btn.classList.remove('placed');
          btn.disabled = true;
          btn.innerHTML = `<span>🔒</span> Fragment ${i} (in KB 0${i})`;
        }
      }

      // Sync Wall 3 visual slice
      const wallSlice = document.getElementById(`wall3-slice-${i}`);
      if (wallSlice) {
        wallSlice.classList.toggle('revealed', isPlaced);
      }
    }

    const allPlaced = room1.piecesPlaced.length >= 3;
    const canvasContainer = document.getElementById('wall3-painting-canvas');
    if (canvasContainer) {
      canvasContainer.classList.toggle('completed', allPlaced);
    }

    const keySection = document.getElementById('painting-golden-key-section');
    if (keySection) {
      if (allPlaced && !room1.keyAcquired && !window.gameState.hasItem('golden_escape_key')) {
        keySection.style.display = 'flex';
      } else {
        keySection.style.display = 'none';
      }
    }

    const subtitle = document.getElementById('painting-assembly-subtitle');
    if (subtitle) {
      if (allPlaced) {
        subtitle.textContent = '✨ Masterpiece fully restored! All 3 fragments united.';
      } else {
        subtitle.textContent = `Restoration Progress: ${room1.piecesPlaced.length}/3 fragments placed on canvas.`;
      }
    }
  }

  placePaintingPiece(pieceNumber) {
    const room1 = window.gameState.state.rooms[1];
    if (!room1.piecesPlaced) room1.piecesPlaced = [];

    if (room1.piecesPlaced.includes(pieceNumber)) {
      if (window.app) window.app.showToast(`Fragment ${pieceNumber} is already placed on the canvas.`, 'normal');
      return false;
    }

    const pieceId = `painting_piece_${pieceNumber}`;
    const hasPiece = window.gameState.hasItem(pieceId) || room1.kbsFound?.includes(pieceNumber);
    if (!hasPiece) {
      if (window.app) window.app.showToast(`You have not discovered Painting Fragment ${pieceNumber} yet. Complete Knowledge Box 0${pieceNumber}!`, 'error');
      return false;
    }

    // Place the piece
    room1.piecesPlaced.push(pieceNumber);
    window.gameState.removeItem(pieceId);
    window.gameState.save();

    if (window.soundEngine) window.soundEngine.playClick();

    // Sync UI on both modal and Wall 3
    this.syncPaintingUI();

    if (window.app) {
      window.app.showToast(`Fragment ${pieceNumber} restored on the canvas!`, 'success');
    }

    // Check if all 3 pieces are placed
    if (room1.piecesPlaced.length >= 3) {
      room1.paintingCompleted = true;
      window.gameState.unlockBadge('puzzle_art');
      window.gameState.addXP(200);
      window.gameState.save();

      if (window.soundEngine) {
        setTimeout(() => window.soundEngine.playEscapeFanfare(), 300);
      }

      this.syncPaintingUI();

      if (window.app) {
        setTimeout(() => {
          window.app.showToast('🎉 Masterpiece Fully Restored! Golden Escape Key Revealed!', 'reward');
        }, 500);
      }
    }
    return true;
  }

  // ==========================================
  // LOCKER 07 & DIGITAL PERSONAL MONEY MANAGEMENT TERMINAL
  // ==========================================
  clickLocker07() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};

    room1.lockerLocated = true;
    room1.lockerOpened = true;
    window.gameState.save();

    if (window.soundEngine) {
      if (window.soundEngine.playLockClick) window.soundEngine.playLockClick();
      setTimeout(() => {
        if (window.soundEngine && window.soundEngine.playDrawerOpen) window.soundEngine.playDrawerOpen();
      }, 200);
      setTimeout(() => {
        if (window.soundEngine && window.soundEngine.playSuccess) window.soundEngine.playSuccess();
      }, 500);
    }

    if (window.app) {
      window.app.updateHUD();
      window.app.showToast('🔑 Inserting Key #7533 into Locker No. 7533... *CLICK!* Locker door unlocks & opens.', 'success');
      setTimeout(() => {
        window.app.openModal('digital-budget-terminal-modal');
        this.initBudgetTerminalView();
      }, 650);
    } else {
      this.initBudgetTerminalView();
    }
  }

  initBudgetTerminalView() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const availMoney = room1.availableMoney || 10000;

    const availDisp = document.getElementById('terminal-available-money-disp');
    const summaryAvail = document.getElementById('summary-available-val');
    if (availDisp) availDisp.textContent = `₹${availMoney.toLocaleString()}`;
    if (summaryAvail) summaryAvail.textContent = `₹${availMoney.toLocaleString()}`;

    // Restore saved allocations if present
    if (room1.budgetAllocations) {
      const b = room1.budgetAllocations;
      if (document.getElementById('input-rent')) document.getElementById('input-rent').value = b.rent || '';
      if (document.getElementById('input-groceries')) document.getElementById('input-groceries').value = b.groceries || '';
      if (document.getElementById('input-utilities')) document.getElementById('input-utilities').value = b.utilities || '';
      if (document.getElementById('input-wifi')) document.getElementById('input-wifi').value = b.wifi || '';
      if (document.getElementById('input-emi')) document.getElementById('input-emi').value = b.emi || '';
      if (document.getElementById('input-gym')) document.getElementById('input-gym').value = b.gym || '';
      if (document.getElementById('input-dining')) document.getElementById('input-dining').value = b.dining || '';
      if (document.getElementById('input-hobbies')) document.getElementById('input-hobbies').value = b.hobbies || '';
    }

    this.calculateLiveBudget();

    const successComp = document.getElementById('budget-success-compartment');
    const btnDone = document.getElementById('btn-submit-budget-done');
    const keyStatusBtn = document.getElementById('terminal-key-status-btn');

    if (room1.budgetSubmitted) {
      if (successComp) successComp.style.display = 'block';
      if (btnDone) {
        btnDone.textContent = '✓ BUDGET BALANCED & SUBMITTED';
        btnDone.disabled = true;
        btnDone.style.opacity = '0.6';
      }
    } else {
      if (successComp) successComp.style.display = 'none';
      if (btnDone) {
        btnDone.textContent = '[ DONE ]';
        btnDone.disabled = false;
        btnDone.style.opacity = '1';
      }
    }

    if (room1.keyAcquired && keyStatusBtn) {
      keyStatusBtn.textContent = '✓ ESCAPE KEY ACQUIRED';
      keyStatusBtn.style.background = '#2ecc71';
    }
  }

  calculateLiveBudget() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const availMoney = room1.availableMoney || 10000;

    const rent = parseFloat(document.getElementById('input-rent')?.value) || 0;
    const groceries = parseFloat(document.getElementById('input-groceries')?.value) || 0;
    const utilities = parseFloat(document.getElementById('input-utilities')?.value) || 0;
    const wifi = parseFloat(document.getElementById('input-wifi')?.value) || 0;
    const emi = parseFloat(document.getElementById('input-emi')?.value) || 0;

    const totalSurvival = rent + groceries + utilities + wifi + emi;

    const dispSurvival = document.getElementById('disp-total-survival');
    const summarySurvival = document.getElementById('summary-survival-val');
    if (dispSurvival) dispSurvival.textContent = `₹${totalSurvival.toLocaleString()}`;
    if (summarySurvival) summarySurvival.textContent = `₹${totalSurvival.toLocaleString()}`;

    const gym = parseFloat(document.getElementById('input-gym')?.value) || 0;
    const dining = parseFloat(document.getElementById('input-dining')?.value) || 0;
    const hobbies = parseFloat(document.getElementById('input-hobbies')?.value) || 0;

    const totalThrive = gym + dining + hobbies;

    const dispThrive = document.getElementById('disp-total-thrive');
    const summaryThrive = document.getElementById('summary-thrive-val');
    if (dispThrive) dispThrive.textContent = `₹${totalThrive.toLocaleString()}`;
    if (summaryThrive) summaryThrive.textContent = `₹${totalThrive.toLocaleString()}`;

    const totalAllocated = totalSurvival + totalThrive;
    const remaining = availMoney - totalAllocated;

    const summaryAllocated = document.getElementById('summary-allocated-val');
    const summaryRemaining = document.getElementById('summary-remaining-val');
    const warningBox = document.getElementById('budget-overbudget-warning');

    if (summaryAllocated) summaryAllocated.textContent = `₹${totalAllocated.toLocaleString()}`;
    if (summaryRemaining) {
      summaryRemaining.textContent = `₹${remaining.toLocaleString()}`;
      if (remaining < 0) {
        summaryRemaining.style.color = '#ff6b6b';
      } else {
        summaryRemaining.style.color = '#2ecc71';
      }
    }

    if (warningBox) {
      if (totalAllocated > availMoney) {
        warningBox.style.display = 'block';
      } else {
        warningBox.style.display = 'none';
      }
    }
  }

  submitBudgetDone() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};
    const availMoney = room1.availableMoney || 10000;

    const valRent = document.getElementById('input-rent')?.value?.trim();
    const valGroceries = document.getElementById('input-groceries')?.value?.trim();
    const valUtilities = document.getElementById('input-utilities')?.value?.trim();
    const valWifi = document.getElementById('input-wifi')?.value?.trim();
    const valEmi = document.getElementById('input-emi')?.value?.trim();
    const valGym = document.getElementById('input-gym')?.value?.trim();
    const valDining = document.getElementById('input-dining')?.value?.trim();
    const valHobbies = document.getElementById('input-hobbies')?.value?.trim();

    const rent = parseFloat(valRent) || 0;
    const groceries = parseFloat(valGroceries) || 0;
    const utilities = parseFloat(valUtilities) || 0;
    const wifi = parseFloat(valWifi) || 0;
    const emi = parseFloat(valEmi) || 0;
    const gym = parseFloat(valGym) || 0;
    const dining = parseFloat(valDining) || 0;
    const hobbies = parseFloat(valHobbies) || 0;

    const valMsg = document.getElementById('budget-validation-msg');

    // Rule 4: No negative values
    if (rent < 0 || groceries < 0 || utilities < 0 || wifi < 0 || emi < 0 || gym < 0 || dining < 0 || hobbies < 0) {
      if (valMsg) {
        valMsg.textContent = '⚠️ Please enter valid amounts for all categories.';
        valMsg.style.display = 'block';
      }
      if (window.soundEngine && window.soundEngine.playLockClick) window.soundEngine.playLockClick();
      if (window.app) window.app.showToast('⚠️ Enter a valid amount.', 'error');
      return;
    }

    // Rule 1 & Rule 3: None of the 5 Survival categories can be <= 0 or empty
    const survivalInputs = [
      { val: valRent, num: rent },
      { val: valGroceries, num: groceries },
      { val: valUtilities, num: utilities },
      { val: valWifi, num: wifi },
      { val: valEmi, num: emi }
    ];

    const hasZeroSurvival = survivalInputs.some(item => !item.val || item.num <= 0);

    if (hasZeroSurvival) {
      if (valMsg) {
        valMsg.textContent = '⚠️ Your essential expenses are incomplete. Every Survival category must receive an allocation.';
        valMsg.style.display = 'block';
      }
      if (window.soundEngine && window.soundEngine.playLockClick) window.soundEngine.playLockClick();
      if (window.app) window.app.showToast('⚠️ Survival expenses cannot be zero. Allocate money to every essential category.', 'error');
      return;
    }

    // Rule 2: Total Allocated <= Available Money
    const totalSurvival = rent + groceries + utilities + wifi + emi;
    const totalThrive = gym + dining + hobbies;
    const totalAllocated = totalSurvival + totalThrive;

    if (totalAllocated > availMoney) {
      if (valMsg) {
        valMsg.textContent = '⚠️ Your budget exceeds your available money. Rebalance your expenses.';
        valMsg.style.display = 'block';
      }
      if (window.soundEngine && window.soundEngine.playLockClick) window.soundEngine.playLockClick();
      if (window.app) window.app.showToast('⚠️ Your budget exceeds your available money. Rebalance your expenses.', 'error');
      return;
    }

    // Validation Successful!
    if (valMsg) valMsg.style.display = 'none';

    room1.budgetSubmitted = true;
    room1.budgetAllocations = { rent, groceries, utilities, wifi, emi, gym, dining, hobbies };
    window.gameState.unlockBadge('budget_master');
    window.gameState.addXP(250);
    window.gameState.save();

    if (window.soundEngine) {
      if (window.soundEngine.playEscapeFanfare) window.soundEngine.playEscapeFanfare();
      else if (window.soundEngine.playSuccess) window.soundEngine.playSuccess();
    }

    if (window.app) window.app.updateHUD();

    const successComp = document.getElementById('budget-success-compartment');
    const btnDone = document.getElementById('btn-submit-budget-done');

    if (successComp) successComp.style.display = 'block';
    if (btnDone) {
      btnDone.textContent = '✓ BUDGET BALANCED';
      btnDone.disabled = true;
      btnDone.style.opacity = '0.6';
    }

    if (window.app) {
      window.app.showToast('✅ Budget successfully balanced! Room Escape Key revealed.', 'reward');
    }
  }

  collectRoomEscapeKey() {
    const room1 = window.gameState?.state?.rooms?.[1] || {};

    if (!room1.budgetSubmitted) {
      if (window.app) {
        window.app.showToast('🔒 Golden Escape Key is locked! Complete & submit your Budget Plan in Locker 07 first.', 'error');
      }
      return false;
    }

    if (room1.keyAcquired) {
      if (window.app) window.app.showToast('Golden Escape Key already acquired! Proceed to Wall 3 Exit Door.', 'normal');
      return true;
    }

    room1.keyAcquired = true;
    window.gameState.addItem({
      id: 'golden_escape_key',
      name: 'Golden Escape Key',
      icon: '🗝️',
      type: 'escape_key',
      desc: 'The ornate golden key unlocking the exit door of the inspireLIFE chamber.'
    });
    window.gameState.addXP(100);
    window.gameState.save();

    const keyStatusBtn = document.getElementById('terminal-key-status-btn');
    if (keyStatusBtn) {
      keyStatusBtn.textContent = '✓ ESCAPE KEY ACQUIRED';
      keyStatusBtn.style.background = '#2ecc71';
    }

    const completionSummary = document.getElementById('terminal-completion-summary');
    if (completionSummary) completionSummary.style.display = 'block';

    const lockerKeyStatusText = document.getElementById('locker-key-status-text');
    if (lockerKeyStatusText) {
      lockerKeyStatusText.textContent = '✓ COLLECTED';
      lockerKeyStatusText.style.color = '#2ecc71';
    }

    if (window.soundEngine) {
      if (window.soundEngine.playEscapeFanfare) window.soundEngine.playEscapeFanfare();
      else if (window.soundEngine.playSuccess) window.soundEngine.playSuccess();
    }

    if (window.app) {
      window.app.updateHUD();
      window.app.showToast('🗝️ GOLDEN ESCAPE KEY ACQUIRED! Proceed to Wall 3 Exit Door to Escape!', 'reward');
    }
    return true;
  }

  collectGoldenKey() {
    const success = this.collectRoomEscapeKey();
    if (success && window.app) {
      window.app.closeModal('locker-room-modal');
      window.app.closeModal('digital-budget-terminal-modal');
      if (window.vintageRoomEngine) window.vintageRoomEngine.setWall(3);
    }
  }
}

window.puzzleManager = new PuzzleManager();

