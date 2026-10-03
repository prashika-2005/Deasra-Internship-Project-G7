/**
 * ESCAPE ROOM: 4-Wall Rotating Room Engine
 * 3D Panoramic Wall Rotation & Navigation Controller
 */

class VintageRoomEngine {
  constructor() {
    this.currentWall = 1;
    this.totalWalls = 4;
    this.isTransitioning = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
  }

  init() {
    this.bindNavigation();
    this.checkUnlockedWalls();
    this.setWall(1);
  }

  checkUnlockedWalls() {
    const room1 = window.gameState?.state?.rooms?.[1];
    if (room1 && room1.vaultSafeUnlocked) {
      this.totalWalls = 5;
      const dot5 = document.getElementById('w5-nav-dot');
      if (dot5) dot5.style.display = 'inline-block';
      this.initLockerGrid();
    }
  }

  unlockWall5() {
    this.totalWalls = 5;
    const dot5 = document.getElementById('w5-nav-dot');
    if (dot5) dot5.style.display = 'inline-block';
    this.initLockerGrid();
    this.setWall(5, 'right');
  }

  initLockerGrid() {
    const container = document.getElementById('w5-locker-grid-container');
    if (!container || container.children.length > 0) return;

    const lockerNumbers = [
      ["7500", "7510", "7510", "7520", "7530", "7540", "7540", "7550"],
      ["7501", "7511", "7511", "7521", "7532", "7541", "7551", "7559"],
      ["7502", "7512", "7512", "7523", "7533", "7544", "7554", "7559"],
      ["7503", "7513", "7513", "7324", "7534", "7843", "7555", "7556"],
      ["7508", "7515", "7516", "7526", "7536", "7546", "7556", "7557"],
      ["7509", "7517", "7517", "7327", "7537", "7347", "7557", "7558"],
      ["7509", "7519", "7518", "7529", "7539", "7849", "7558", "7559"]
    ];

    // Exact percentage coordinates for handles across 8 cols x 7 rows on Wall 5
    const colLefts = [18.4, 26.7, 35.0, 43.3, 51.6, 59.9, 68.2, 76.5];
    const rowTops  = [27.8, 36.5, 45.2, 53.9, 62.6, 71.3, 80.0];

    lockerNumbers.forEach((row, rIdx) => {
      row.forEach((num, cIdx) => {
        const dot = document.createElement('div');
        dot.className = 'locker-handle-dot';
        dot.style.top = `${rowTops[rIdx]}%`;
        dot.style.left = `${colLefts[cIdx]}%`;
        dot.title = `LOCKER NO. ${num}`;
        dot.dataset.lockerNum = num;

        // Locker 7533 (Row 2, Col 4) matches the brass key tag #7533!
        const isTarget = (num === '7533' || (rIdx === 2 && cIdx === 4));
        if (isTarget) {
          dot.classList.add('target-locker-dot');
          dot.title = "LOCKER NO. 7533 • Digital Money Terminal";
        }

        dot.onclick = (e) => {
          e.stopPropagation();
          if (isTarget) {
            if (window.puzzleManager) window.puzzleManager.clickLocker07();
            else if (window.app) window.app.openModal('digital-budget-terminal-modal');
          } else {
            if (window.soundEngine && window.soundEngine.playLockClick) window.soundEngine.playLockClick();
            if (window.app) window.app.showToast('You need the key.', 'normal');
          }
        };

        container.appendChild(dot);
      });
    });
  }

  bindNavigation() {
    // Left & Right Wall Navigation Buttons
    const leftBtn = document.getElementById('btn-room-left-wall');
    const rightBtn = document.getElementById('btn-room-right-wall');

    if (leftBtn) {
      leftBtn.onclick = () => this.prevWall();
    }
    if (rightBtn) {
      rightBtn.onclick = () => this.nextWall();
    }

    // Keyboard Arrow & WASD Navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.prevWall();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.nextWall();
    });

    // Touch Swipe Navigation
    const stage = document.querySelector('.walls-master-stage');
    if (stage) {

      stage.addEventListener('touchstart', (e) => {
        this.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      stage.addEventListener('touchend', (e) => {
        this.touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe();
      }, { passive: true });
    }
  }

  handleSwipe() {
    const diff = this.touchEndX - this.touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        this.nextWall(); // Swipe Left -> Rotate to Next Wall
      } else {
        this.prevWall(); // Swipe Right -> Rotate to Prev Wall
      }
    }
  }

  setWall(wallNum, forceDirection = null) {
    if (this.isTransitioning) return;

    // Dynamically re-check if Wall 5 should be unlocked
    this.checkUnlockedWalls();

    let targetWall = wallNum;
    if (targetWall < 1) targetWall = this.totalWalls;
    if (targetWall > this.totalWalls) targetWall = 1;

    const fromWall = this.currentWall;
    const toWall = targetWall;

    if (fromWall === toWall && document.getElementById(`wall-view-${toWall}`)?.classList.contains('active')) {
      return;
    }

    // Determine 3D pan direction ('right' or 'left')
    let direction = forceDirection;
    if (!direction) {
      if ((fromWall === this.totalWalls && toWall === 1) || (toWall > fromWall && !(fromWall === 1 && toWall === this.totalWalls))) {
        direction = 'right';
      } else {
        direction = 'left';
      }
    }

    this.isTransitioning = true;
    this.currentWall = toWall;

    const oldView = document.getElementById(`wall-view-${fromWall}`);
    const newView = document.getElementById(`wall-view-${toWall}`);

    if (window.soundEngine) {
      window.soundEngine.playWhoosh();
    }

    // Update bottom wall indicator dots
    document.querySelectorAll('.wall-nav-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx + 1 === this.currentWall);
    });

    if (oldView && newView && fromWall !== toWall) {
      // Clear non-involved views
      for (let i = 1; i <= this.totalWalls; i++) {
        if (i !== fromWall && i !== toWall) {
          const v = document.getElementById(`wall-view-${i}`);
          if (v) v.className = 'wall-scene';
        }
      }

      const enterClass = direction === 'right' ? 'slide-enter-from-right' : 'slide-enter-from-left';
      const exitClass = direction === 'right' ? 'slide-exit-left' : 'slide-exit-right';

      // Position new wall off-screen without animation first
      newView.style.transition = 'none';
      newView.className = `wall-scene ${enterClass}`;
      void newView.offsetWidth; // Force layout recalculation

      // Restore transition styles
      newView.style.transition = '';
      oldView.style.transition = '';

      // Execute smooth 3D panoramic transition
      requestAnimationFrame(() => {
        oldView.className = `wall-scene ${exitClass}`;
        newView.className = 'wall-scene active';
      });

      setTimeout(() => {
        oldView.className = 'wall-scene';
        newView.className = 'wall-scene active';
        this.isTransitioning = false;
      }, 540);
    } else if (newView) {
      newView.className = 'wall-scene active';
      this.isTransitioning = false;
    } else {
      this.isTransitioning = false;
    }

    if (window.app) window.app.updateHUD();
  }

  nextWall() {
    this.setWall(this.currentWall + 1, 'right');
  }

  prevWall() {
    this.setWall(this.currentWall - 1, 'left');
  }

  updateRoomVisuals() {}
}

window.vintageRoomEngine = new VintageRoomEngine();
