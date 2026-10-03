/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * Profile, 3-Tier Progressive Hint Engine, Analytics & Certificate Generator
 */

class ProfileReportManager {
  constructor() {}

  // ==========================================
  // PROGRESSIVE 3-TIER HINT SYSTEM
  // ==========================================
  getHint() {
    const state = window.gameState.state;
    const room1 = state.rooms[1];
    let hintLevel = (state.hintsUsed % 3) + 1;
    let hintText = '';

    if (!room1.scratchCompleted) {
      if (hintLevel === 1) hintText = 'Look closely at the executive desk on Wall 2. Something decorative holds a secret.';
      else if (hintLevel === 2) hintText = 'The picture frame on the desk can be scratched to reveal a hidden code.';
      else hintText = 'Scratch the desk frame to find code "29", then enter it into the desk drawer keypad.';
    } else if (!room1.drawerUnlocked) {
      if (hintLevel === 1) hintText = 'Use the number you uncovered from the desk frame.';
      else if (hintLevel === 2) hintText = 'The desk drawer has a 2-digit passcode lock.';
      else hintText = 'Enter "29" into the desk drawer keypad to unlock Knowledge Box 01.';
    } else if (!room1.redBookPulled) {
      if (hintLevel === 1) hintText = 'Inspect the notice board on Wall 2. Clue 2 mentions a specific piece of furniture.';
      else if (hintLevel === 2) hintText = 'Head to the large bookshelf on Wall 4 and look at the second shelf.';
      else hintText = 'Click the distinct RED BOOK on Shelf 2 to reveal the hidden steel safe and Knowledge Box 02.';
    } else if (!room1.clockSolved) {
      if (hintLevel === 1) hintText = 'Inspect the Mysterious Note in your inventory and read the riddle carefully.';
      else if (hintLevel === 2) hintText = 'Look at the vintage Wall Clock on Wall 1.';
      else hintText = 'Enter "4:00" on the Wall Clock to open its hidden compartment for Knowledge Box 03.';
    } else if (!room1.paintingCompleted) {
      if (hintLevel === 1) hintText = 'You have collected painting pieces from the Knowledge Boxes. Where do they belong?';
      else if (hintLevel === 2) hintText = 'Inspect the large Framed Canvas on Wall 3.';
      else hintText = 'Place all 3 painting pieces onto the Wall 3 canvas to reveal the Golden Escape Key.';
    } else if (!room1.escaped) {
      hintText = 'Take the Golden Escape Key and click the Exit Door on Wall 3 to escape!';
    } else {
      hintText = 'Open the Building Map and explore any of the 4 unlocked specialized rooms!';
    }

    state.hintsUsed++;
    window.gameState.save();

    const hintModalText = document.getElementById('hint-content-text');
    const hintLevelBadge = document.getElementById('hint-level-tag');
    if (hintModalText) hintModalText.textContent = hintText;
    if (hintLevelBadge) hintLevelBadge.textContent = `HINT LEVEL ${hintLevel} OF 3`;

    if (window.app) window.app.openModal('hint-modal');
  }

  // ==========================================
  // PLAYER PROFILE MODAL
  // ==========================================
  renderProfile() {
    const player = window.gameState.state.player;
    const badges = window.gameState.state.badges;

    const avatarNameEl = document.getElementById('profile-avatar-name');
    const avatarTitleEl = document.getElementById('profile-avatar-title');
    const avatarDescEl = document.getElementById('profile-avatar-desc');
    const avatarIconEl = document.getElementById('profile-avatar-icon');
    const xpEl = document.getElementById('profile-xp-val');
    const levelEl = document.getElementById('profile-level-val');
    const badgesContainer = document.getElementById('profile-badges-grid');

    if (avatarNameEl) avatarNameEl.textContent = player.name + ` (${player.avatarName})`;
    if (avatarTitleEl) avatarTitleEl.textContent = player.avatarTitle;
    if (avatarDescEl) avatarDescEl.textContent = player.avatarDesc;
    if (avatarIconEl) avatarIconEl.textContent = player.avatarIcon;
    if (xpEl) xpEl.textContent = player.xp;
    if (levelEl) levelEl.textContent = player.level;

    if (badgesContainer) {
      badgesContainer.innerHTML = '';
      badges.forEach(b => {
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${b.unlocked ? 'unlocked' : 'locked'}`;
        badgeCard.style.cssText = `
          background: rgba(18, 9, 6, 0.7);
          border: 1px solid ${b.unlocked ? 'var(--gold-primary)' : 'var(--border-glass)'};
          padding: 12px;
          border-radius: var(--radius-md);
          text-align: center;
          opacity: ${b.unlocked ? '1' : '0.4'};
        `;
        badgeCard.innerHTML = `
          <div style="font-size:32px;margin-bottom:6px;">${b.icon}</div>
          <div style="font-size:12px;font-weight:700;color:#fff;">${b.name}</div>
          <div style="font-size:10px;color:var(--text-muted);">${b.desc}</div>
        `;
        badgesContainer.appendChild(badgeCard);
      });
    }

    if (window.app) window.app.openModal('profile-modal');
  }

  // ==========================================
  // LEARNING ANALYTICS REPORT & CERTIFICATE
  // ==========================================
  renderReport() {
    const state = window.gameState.state;
    const player = state.player;

    const completedRoomsCount = Object.values(state.rooms).filter(r => r.status === 'completed').length;
    const totalRooms = 5;
    const overallProgress = Math.round((completedRoomsCount / totalRooms) * 100);

    // Calculate total Knowledge Boxes found
    let totalKbs = 0;
    Object.values(state.rooms).forEach(r => { totalKbs += r.kbsFound.length; });

    document.getElementById('report-completed-rooms').textContent = `${completedRoomsCount} / ${totalRooms}`;
    document.getElementById('report-overall-pct').textContent = `${overallProgress}%`;
    document.getElementById('report-total-xp').textContent = player.xp;
    document.getElementById('report-kbs-found').textContent = `${totalKbs} / 7`;

    // Student Certificate Preview
    document.getElementById('cert-student-name-text').textContent = player.name;
    document.getElementById('cert-avatar-role-text').textContent = player.avatarTitle;
    document.getElementById('cert-date-text').textContent = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (window.app) window.app.openModal('report-modal');
  }

  printCertificate() {
    window.print();
  }
}

window.profileReportManager = new ProfileReportManager();
