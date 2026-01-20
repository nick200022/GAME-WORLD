// Prototipo 3D básico con Three.js: terreno, árboles (placeholder), edificios, carretera, vehículos estáticos.
// Controles touch: joystick en la esquina para mover la cámara/entidad.

let camera, scene, renderer, clock, player;
const canvas = document.getElementById('canvas3d');

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x99d9ff);
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 20, 40);

  // Luz
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  hemi.position.set(0, 50, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(-10, 30, 10);
  scene.add(dir);

  // Suelo
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Añadir edificios simples (cubes), árboles (cylinders + spheres), carretera (dark plane)
  addEnvironment();

  // Jugador (representado por una esfera)
  const playerGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const playerMat = new THREE.MeshStandardMaterial({ color: 0xff5722 });
  player = new THREE.Mesh(playerGeo, playerMat);
  player.position.set(0, 1.2, 0);
  scene.add(player);

  // OrbitControls para desktop; en móvil se usará joystick para mover player
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(player.position);
  controls.enablePan = false;
  controls.minDistance = 10;
  controls.maxDistance = 80;

  // Handle resize
  window.addEventListener('resize', onWindowResize);

  // Mobile joystick rudimentario
  setupMobileControls();
}

function addEnvironment() {
  // Carretera
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(80, 10), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.01, -20);
  scene.add(road);

  // Edificios
  const bMat = new THREE.MeshStandardMaterial({ color: 0x8fa6c6 });
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(4 + Math.random() * 6, 6 + Math.random() * 18, 4 + Math.random() * 6), bMat);
    b.position.set(-30 + i * 12, b.geometry.parameters.height / 2, -10 - Math.random() * 20);
    scene.add(b);
  }

  // Árboles
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b3a1a });
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x1b5e20 });
  for (let i = 0; i < 40; i++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 2.5), trunkMat);
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 8), leavesMat);
    const x = -80 + Math.random() * 160;
    const z = 20 + Math.random() * 120;
    trunk.position.set(x, 1.25, z);
    leaves.position.set(x, 3.2, z);
    scene.add(trunk);
    scene.add(leaves);
  }

  // Vehículos (meshes simples)
  const carMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  for (let i = 0; i < 4; i++) {
    const car = new THREE.Mesh(new THREE.BoxGeometry(3, 1.2, 1.6), carMat);
    car.position.set(-20 + i * 14, 0.6, -20);
    scene.add(car);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Simple movement variables
const move = { x: 0, z: 0 };
const speed = 8;

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  // Move player according to move vector
  player.position.x += move.x * speed * dt;
  player.position.z += move.z * speed * dt;

  // Keep player above ground
  player.position.y = 1.2;

  // Make camera follow player
  camera.position.lerp(new THREE.Vector3(player.position.x, player.position.y + 18, player.position.z + 30), 0.05);
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}

/* ---------- Mobile controls (rudimentario) ---------- */
function setupMobileControls() {
  const joystick = document.getElementById('joystick');
  let active = false;
  let startX = 0, startY = 0;

  const start = (clientX, clientY) => {
    active = true;
    startX = clientX;
    startY = clientY;
    joystick.style.transform = `translate(${startX}px, ${-startY}px)`;
  };

  const moveHandler = (clientX, clientY) => {
    if (!active) return;
    const dx = (clientX - startX);
    const dy = (clientY - startY);
    // Map to -1..1
    const nx = Math.max(-1, Math.min(1, dx / 50));
    const nz = Math.max(-1, Math.min(1, dy / 50));
    move.x = nx;
    move.z = nz;
  };

  const stop = () => {
    active = false;
    move.x = 0;
    move.z = 0;
  };

  joystick.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    start(t.clientX, t.clientY);
  });
  joystick.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    moveHandler(t.clientX, t.clientY);
  });
  joystick.addEventListener('touchend', stop);

  // Desktop fallback (mouse)
  joystick.addEventListener('mousedown', (e) => {
    start(e.clientX, e.clientY);
    const moveMouse = (ev) => moveHandler(ev.clientX, ev.clientY);
    const up = () => { stop(); window.removeEventListener('mousemove', moveMouse); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseup', up);
  });
}
