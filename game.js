let scene, camera, renderer, controls;
let gameRunning = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

function startLobby() {
    document.getElementById('mode-select-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'block';
}

function launchGame() {
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';

    init3DWorld();
    gameRunning = true;
}

function init3DWorld() {
    // 1. Cena e Câmara
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070b);
    scene.fog = new THREE.FogExp2(0x05070b, 0.035);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    // 2. Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 3. Controlos de Câmara (PointerLock)
    controls = new THREE.PointerLockControls(camera, document.body);
    controls.lock();
    scene.add(controls.getObject());

    // 4. Iluminação Clara (Previne Tela Preta)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 30, 10);
    scene.add(dirLight);

    // 5. Chão e Objetos do Cenário
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Caixa de teste 3D à frente
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x00ffcc })
    );
    box.position.set(0, 1, -8);
    scene.add(box);

    // 6. Ouvintes de Teclado
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW') moveForward = true;
        if (e.code === 'KeyA') moveLeft = true;
        if (e.code === 'KeyS') moveBackward = true;
        if (e.code === 'KeyD') moveRight = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW') moveForward = false;
        if (e.code === 'KeyA') moveLeft = false;
        if (e.code === 'KeyS') moveBackward = false;
        if (e.code === 'KeyD') moveRight = false;
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (!gameRunning) return;

    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);

    prevTime = time;
    renderer.render(scene, camera);
}
