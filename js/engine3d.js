/**
 * ESCAPE ROOM: THE ENTREPRENEUR'S JOURNEY
 * 3D Escape Room Engine (Three.js WebGL)
 * Aesthetic: Luxurious Dark Mahogany Executive Study & High-Tech Terminal
 */

class EscapeRoom3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.hoveredObject = null;

    // Camera viewpoints for 4 walls
    this.wallAngles = {
      1: { rotY: 0, targetPos: { x: 0, y: 1.6, z: -0.1 } },      // Wall 1: Entrance & Wall Clock
      2: { rotY: -Math.PI / 2, targetPos: { x: 0.1, y: 1.6, z: 0 } }, // Wall 2: Notice Board & Desk
      3: { rotY: Math.PI, targetPos: { x: 0, y: 1.6, z: 0.1 } },    // Wall 3: Painting & Exit Door
      4: { rotY: Math.PI / 2, targetPos: { x: -0.1, y: 1.6, z: 0 } }  // Wall 4: Bookshelf & Safe
    };

    this.currentWall = 1;
    this.targetRotationY = 0;
    this.cameraRotationY = 0;
    this.isTransitioning = false;

    // Interactive 3D Mesh References
    this.meshes = {
      redBook: null,
      safeDoor: null,
      deskDrawer: null,
      scratchFrame: null,
      clockFace: null,
      paintingFrame: null,
      goldenKey: null,
      exitDoor: null,
      noticeBoard: null,
      cyberConsole: null
    };

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0604);
    this.scene.fog = new THREE.FogExp2(0x0c0604, 0.045);

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.6, 0);

    // 2. WebGL Renderer with High-End Shadows
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 3. Build Lighting & Room
    this.setupLighting();
    this.buildRoomArchitecture();
    this.buildFurnitureAndProps();

    // 4. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.onClick(e));

    // 5. Start Render Loop
    this.animate();
  }

  setupLighting() {
    // Warm ambient light for soft shadows
    const ambientLight = new THREE.AmbientLight(0xffa550, 0.45);
    this.scene.add(ambientLight);

    // Main Chandelier Warm Point Light
    const chandelierLight = new THREE.PointLight(0xffd280, 1.8, 14, 1.2);
    chandelierLight.position.set(0, 3.2, 0);
    chandelierLight.castShadow = true;
    chandelierLight.shadow.mapSize.width = 1024;
    chandelierLight.shadow.mapSize.height = 1024;
    this.scene.add(chandelierLight);

    // Desk Banker's Lamp (Amber Glow)
    const deskLamp = new THREE.PointLight(0xff9900, 1.4, 5, 1.5);
    deskLamp.position.set(2.2, 1.2, -0.6);
    this.scene.add(deskLamp);

    // High-Tech Cyber Console Cyan Light
    const cyberLight = new THREE.PointLight(0x00f2fe, 1.5, 4, 1.8);
    cyberLight.position.set(2.4, 1.1, 2.0);
    this.scene.add(cyberLight);

    // Wall Sconces
    [-2.8, 2.8].forEach((x) => {
      const sconce = new THREE.PointLight(0xffaa44, 0.6, 4, 1.5);
      sconce.position.set(x, 2.2, 0);
      this.scene.add(sconce);
    });
  }

  // Procedural Wood & Wall Textures Generator
  generateWoodTexture(color1 = '#361f14', color2 = '#1e0f09') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = color2;
    for (let i = 0; i < 512; i += 4) {
      if (Math.random() > 0.4) {
        ctx.fillRect(0, i, 512, 2);
      }
    }
    // Vertical wainscoting panel lines
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    for (let x = 0; x < 512; x += 64) {
      ctx.fillRect(x, 0, 4, 512);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  // Procedural Persian Rug Texture Generator
  generatePersianRugTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich Red & Gold Oriental Rug Pattern
    ctx.fillStyle = '#660b05'; // Deep Persian Red
    ctx.fillRect(0, 0, 512, 512);

    // Outer Gold Border
    ctx.strokeStyle = '#d4ac0d';
    ctx.lineWidth = 18;
    ctx.strokeRect(15, 15, 482, 482);

    // Inner Navy Border
    ctx.strokeStyle = '#0b132b';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 432, 432);

    // Center Medallion
    ctx.beginPath();
    ctx.ellipse(256, 256, 120, 80, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#0b132b';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f1c40f';
    ctx.stroke();

    // Center Floral Core
    ctx.beginPath();
    ctx.arc(256, 256, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#b7950b';
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  buildRoomArchitecture() {
    const roomSize = 7.5;
    const roomHeight = 4.0;

    const woodTex = this.generateWoodTexture('#3a2014', '#1f0f09');
    woodTex.repeat.set(3, 2);

    const wallMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.65,
      metalness: 0.15
    });

    // Floor (Dark Hardwood)
    const floorTex = this.generateWoodTexture('#24130a', '#140a05');
    floorTex.repeat.set(4, 4);
    const floorGeo = new THREE.PlaneGeometry(roomSize, roomSize);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.4,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Ceiling (Dark Coffered)
    const ceilingGeo = new THREE.PlaneGeometry(roomSize, roomSize);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x120805,
      roughness: 0.9
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = roomHeight;
    ceiling.rotation.x = Math.PI / 2;
    this.scene.add(ceiling);

    // 4 Main Walls
    const half = roomSize / 2;
    const wallConfigs = [
      { pos: [0, roomHeight / 2, -half], rot: [0, 0, 0] },          // Wall 1 (Entrance/Clock)
      { pos: [half, roomHeight / 2, 0], rot: [0, -Math.PI / 2, 0] }, // Wall 2 (Desk/Clues)
      { pos: [0, roomHeight / 2, half], rot: [0, Math.PI, 0] },       // Wall 3 (Exit/Painting)
      { pos: [-half, roomHeight / 2, 0], rot: [0, Math.PI / 2, 0] }   // Wall 4 (Bookshelf/Safe)
    ];

    wallConfigs.forEach((cfg) => {
      const wallGeo = new THREE.PlaneGeometry(roomSize, roomHeight);
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(...cfg.pos);
      wall.rotation.set(...cfg.rot);
      wall.receiveShadow = true;
      this.scene.add(wall);
    });

    // Persian Rug in Center
    const rugTex = this.generatePersianRugTexture();
    const rugGeo = new THREE.PlaneGeometry(3.6, 2.6);
    const rugMat = new THREE.MeshStandardMaterial({
      map: rugTex,
      roughness: 0.85,
      metalness: 0.05
    });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.set(0, 0.015, 0);
    rug.rotation.x = -Math.PI / 2;
    rug.receiveShadow = true;
    this.scene.add(rug);

    // Chandelier Centerpiece
    const chandelierGeo = new THREE.OctahedronGeometry(0.35, 1);
    const chandelierMat = new THREE.MeshStandardMaterial({
      color: 0xffe6aa,
      emissive: 0xffaa33,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.9
    });
    const chandelier = new THREE.Mesh(chandelierGeo, chandelierMat);
    chandelier.position.set(0, 3.4, 0);
    this.scene.add(chandelier);
  }

  buildFurnitureAndProps() {
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x3d2012,
      roughness: 0.5,
      metalness: 0.2
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4ac0d,
      roughness: 0.3,
      metalness: 0.8
    });

    // ==========================================
    // WALL 1: Entrance Door & Vintage Wall Clock
    // ==========================================
    // Entrance Door
    const entryDoorGeo = new THREE.BoxGeometry(1.2, 2.4, 0.08);
    const entryDoorMat = new THREE.MeshStandardMaterial({ color: 0x221109, roughness: 0.6 });
    const entryDoor = new THREE.Mesh(entryDoorGeo, entryDoorMat);
    entryDoor.position.set(-1.4, 1.2, -3.7);
    this.scene.add(entryDoor);

    // Wall Clock (Interactive Target)
    const clockBodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 32);
    const clockBodyMat = new THREE.MeshStandardMaterial({ color: 0x5a351f, roughness: 0.4 });
    const clockBody = new THREE.Mesh(clockBodyGeo, clockBodyMat);
    clockBody.rotation.x = Math.PI / 2;
    clockBody.position.set(1.4, 2.5, -3.7);
    clockBody.castShadow = true;

    // Clock Face Dial
    const clockFaceGeo = new THREE.CircleGeometry(0.34, 32);
    const clockFaceMat = new THREE.MeshStandardMaterial({
      color: 0xfcf3cf,
      roughness: 0.3
    });
    const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
    clockFace.position.set(1.4, 2.5, -3.65);
    this.scene.add(clockBody);
    this.scene.add(clockFace);

    clockFace.userData = {
      id: 'wall_clock',
      prompt: 'Inspect Wall Clock (Enter Time)',
      action: () => window.app && window.app.openClockPuzzle()
    };
    this.interactiveObjects.push(clockFace);
    this.meshes.clockFace = clockFace;

    // ==========================================
    // WALL 2: Notice Board & Executive Desk
    // ==========================================
    // Notice Board
    const boardGeo = new THREE.BoxGeometry(1.8, 1.1, 0.05);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x935116, roughness: 0.9 });
    const noticeBoard = new THREE.Mesh(boardGeo, boardMat);
    noticeBoard.position.set(3.7, 2.4, 0.8);
    noticeBoard.rotation.y = -Math.PI / 2;
    this.scene.add(noticeBoard);

    noticeBoard.userData = {
      id: 'notice_board',
      prompt: 'Read Notice Board Clues',
      action: () => window.app && window.app.openNoticeBoard()
    };
    this.interactiveObjects.push(noticeBoard);
    this.meshes.noticeBoard = noticeBoard;

    // Executive Mahogany Desk
    const deskTopGeo = new THREE.BoxGeometry(2.0, 0.08, 1.1);
    const deskTop = new THREE.Mesh(deskTopGeo, woodMat);
    deskTop.position.set(2.4, 0.85, -0.6);
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    this.scene.add(deskTop);

    // Desk Legs
    [-0.9, 0.9].forEach((dx) => {
      [-0.45, 0.45].forEach((dz) => {
        const legGeo = new THREE.BoxGeometry(0.1, 0.85, 0.1);
        const leg = new THREE.Mesh(legGeo, woodMat);
        leg.position.set(2.4 + dx, 0.425, -0.6 + dz);
        leg.castShadow = true;
        this.scene.add(leg);
      });
    });

    // Desk Drawer (Interactive)
    const drawerGeo = new THREE.BoxGeometry(0.7, 0.22, 0.85);
    const drawerMat = new THREE.MeshStandardMaterial({ color: 0x4a2815, roughness: 0.5 });
    const drawer = new THREE.Mesh(drawerGeo, drawerMat);
    drawer.position.set(2.4, 0.68, -0.6);
    drawer.castShadow = true;
    this.scene.add(drawer);

    drawer.userData = {
      id: 'desk_drawer',
      prompt: 'Inspect Desk Drawer (Enter 2-Digit Passcode)',
      action: () => window.app && window.app.openKeypadPuzzle()
    };
    this.interactiveObjects.push(drawer);
    this.meshes.deskDrawer = drawer;

    // Picture Frame on Desk (Scratch Frame)
    const frameGeo = new THREE.BoxGeometry(0.4, 0.3, 0.04);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xd4ac0d, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(2.2, 0.98, -0.4);
    frame.rotation.y = -0.3;
    frame.rotation.x = -0.2;
    frame.castShadow = true;
    this.scene.add(frame);

    frame.userData = {
      id: 'scratch_frame',
      prompt: 'Scratch Picture Frame Clue',
      action: () => window.app && window.app.openScratchPuzzle()
    };
    this.interactiveObjects.push(frame);
    this.meshes.scratchFrame = frame;

    // ==========================================
    // WALL 3: Exit Door & 3-Piece Painting
    // ==========================================
    // Exit Door (Interactive)
    const exitDoorGeo = new THREE.BoxGeometry(1.3, 2.5, 0.08);
    const exitDoorMat = new THREE.MeshStandardMaterial({
      color: 0x2c170e,
      roughness: 0.5,
      metalness: 0.2
    });
    const exitDoor = new THREE.Mesh(exitDoorGeo, exitDoorMat);
    exitDoor.position.set(-1.2, 1.25, 3.7);
    exitDoor.rotation.y = Math.PI;
    this.scene.add(exitDoor);

    exitDoor.userData = {
      id: 'exit_door',
      prompt: 'Inspect Exit Door (Locked)',
      action: () => window.app && window.app.attemptEscape()
    };
    this.interactiveObjects.push(exitDoor);
    this.meshes.exitDoor = exitDoor;

    // Framed Wall Painting (Interactive 3-Piece Assembler)
    const paintingFrameGeo = new THREE.BoxGeometry(2.0, 1.3, 0.08);
    const paintingFrameMat = new THREE.MeshStandardMaterial({
      color: 0x8a5528,
      roughness: 0.4,
      metalness: 0.3
    });
    const paintingFrame = new THREE.Mesh(paintingFrameGeo, paintingFrameMat);
    paintingFrame.position.set(1.3, 2.2, 3.7);
    paintingFrame.rotation.y = Math.PI;
    this.scene.add(paintingFrame);

    paintingFrame.userData = {
      id: 'painting_canvas',
      prompt: 'Inspect Painting (Assemble 3 Pieces)',
      action: () => window.app && window.app.openPaintingPuzzle()
    };
    this.interactiveObjects.push(paintingFrame);
    this.meshes.paintingFrame = paintingFrame;

    // ==========================================
    // WALL 4: Bookshelf & Interactive Red Book / Safe
    // ==========================================
    const shelfFrameGeo = new THREE.BoxGeometry(0.4, 2.6, 2.4);
    const shelfFrame = new THREE.Mesh(shelfFrameGeo, woodMat);
    shelfFrame.position.set(-3.7, 1.4, 0);
    shelfFrame.castShadow = true;
    this.scene.add(shelfFrame);

    // Red Secret Book on Shelf 2 (Interactive)
    const redBookGeo = new THREE.BoxGeometry(0.24, 0.28, 0.08);
    const redBookMat = new THREE.MeshStandardMaterial({
      color: 0xb03a2e,
      roughness: 0.4,
      emissive: 0x4a120b,
      emissiveIntensity: 0.3
    });
    const redBook = new THREE.Mesh(redBookGeo, redBookMat);
    redBook.position.set(-3.48, 1.45, 0.15);
    redBook.castShadow = true;
    this.scene.add(redBook);

    redBook.userData = {
      id: 'red_book',
      prompt: 'Pull Red Secret Book on Shelf 2',
      action: () => window.app && window.app.pullRedBook()
    };
    this.interactiveObjects.push(redBook);
    this.meshes.redBook = redBook;

    // High-Tech Glowing Cyan Cyber Console (Reference Image Kiosk)
    const consoleStandGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.0, 8);
    const consoleStandMat = new THREE.MeshStandardMaterial({ color: 0x1a0f0a, metalness: 0.7 });
    const consoleStand = new THREE.Mesh(consoleStandGeo, consoleStandMat);
    consoleStand.position.set(2.4, 0.5, 2.2);

    const screenGeo = new THREE.BoxGeometry(0.6, 0.4, 0.05);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x0099cc,
      emissiveIntensity: 0.8
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(2.4, 1.05, 2.2);
    screen.rotation.x = -0.5;
    screen.rotation.y = -Math.PI / 4;

    this.scene.add(consoleStand);
    this.scene.add(screen);

    screen.userData = {
      id: 'cyber_terminal',
      prompt: 'Access Innovation Analytics Terminal',
      action: () => window.app && window.app.openLearningReport()
    };
    this.interactiveObjects.push(screen);
  }

  // Rotate camera to specified wall (1, 2, 3, 4)
  setWall(wallNumber) {
    if (!this.wallAngles[wallNumber]) return;
    this.currentWall = wallNumber;
    this.targetRotationY = this.wallAngles[wallNumber].rotY;
    if (window.soundEngine) window.soundEngine.playClick();
  }

  nextWall() {
    let next = this.currentWall + 1;
    if (next > 4) next = 1;
    this.setWall(next);
  }

  prevWall() {
    let prev = this.currentWall - 1;
    if (prev < 1) prev = 4;
    this.setWall(prev);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycast for interactive highlights
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

    const promptEl = document.getElementById('inspect-prompt');
    const labelEl = document.getElementById('inspect-label');

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      this.hoveredObject = obj;
      if (promptEl && labelEl && obj.userData && obj.userData.prompt) {
        labelEl.textContent = obj.userData.prompt;
        promptEl.classList.add('visible');
      }
      this.canvas.style.cursor = 'pointer';
    } else {
      this.hoveredObject = null;
      if (promptEl) promptEl.classList.remove('visible');
      this.canvas.style.cursor = 'grab';
    }
  }

  onClick(event) {
    if (this.hoveredObject && this.hoveredObject.userData && this.hoveredObject.userData.action) {
      this.hoveredObject.userData.action();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth camera rotation interpolation
    this.cameraRotationY += (this.targetRotationY - this.cameraRotationY) * 0.08;
    this.camera.rotation.y = this.cameraRotationY;

    this.renderer.render(this.scene, this.camera);
  }
}

window.EscapeRoom3D = EscapeRoom3D;
