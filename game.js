let scene, camera, renderer, controls;
let gameRunning = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

let currentTier = 24;
let currentPage = 1;
const totalTiers = 100;
const tiersPerPage = 7;
const maxPages = 13;

window.addEventListener('DOMContentLoaded', () => {
    renderBattlePassPage();
    renderLockerGrid();
});

function startLobby() {
    document.getElementById('mode-select-screen').style.display = 'none';
    document.getElementById('lobby-screen').style.display = 'block';
}

function switchTab(tabName, event) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => c.classList.remove('active-content'));

    const tabs = document.querySelectorAll('.nav-tabs .tab');
    tabs.forEach(t => t.classList.remove('active'));

    if (tabName === 'lobby') {
        document.getElementById('content-lobby').classList.add('active-content');
    } else if (tabName === 'battlepass') {
        document.getElementById('content-battlepass').classList.add('active-content');
        renderBattlePassPage();
    } else if (tabName === 'arsenal') {
        document.getElementById('content-arsenal').classList.add('active-content');
        renderLockerGrid();
    } else if (tabName === 'missions') {
        document.getElementById('content-missions').classList.add('active-content');
    } else if (tabName === 'shop') {
        document.getElementById('content-shop').classList.add('active-content');
    } else if (tabName === 'career') {
        document.getElementById('content-career').classList.add('active-content');
    } else if (tabName === 'store') {
        document.getElementById('content-store').classList.add('active-content');
    }

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Renderizar o Locker igual à imagem de referência
function renderLockerGrid() {
    const container = document.getElementById('locker-grid-container');
    container.innerHTML = '';

    // Slot inicial de remover/vazio
    let html = `
        <div class="locker-slot" onclick="selectLockerItem('Nenhum', 'Nenhuma skin equipada.', '👕', 'DEFAULT')">
            <span class="locker-slot-icon">❌</span>
        </div>
        <div class="locker-slot" onclick="selectLockerItem('Random Outfit', 'Equipa uma skin aleatória a cada partida.', '🎽', 'RANDOM')">
            <span class="locker-slot-icon">🎽</span>
        </div>
    `;

    // Lista de itens simulando o inventário do Locker com os números de temporada (4, 5, 6, 8, 9, etc.)
    const lockerItems = [
        { name: "THE VISITOR", desc: "Intentions unknown.<br>[Selectable Styles]", icon: "🤖", season: 4, rarity: "LEGENDARY | OUTFIT" },
        { name: "VALOR", desc: "Rise above the storm.", icon: "🦸‍♀️", season: 4, rarity: "EPIC | OUTFIT" },
        { name: "OMEGA", desc: "There is no stopping them.", icon: "🦾", season: 4, rarity: "LEGENDARY | OUTFIT" },
        { name: "CARBIDE", desc: "A hero for the ages.", icon: "🛡️", season: 4, rarity: "LEGENDARY | OUTFIT" },
        { name: "RAGNAROK", desc: "The harbinger of fate.", icon: "💀", season: 5, rarity: "LEGENDARY | OUTFIT" },
        { name: "DRIFT", desc: "Journey into the unknown.", icon: "🦊", season: 5, rarity: "EPIC | OUTFIT" },
        { name: "MARSHMELLO", desc: "Keep it lit.", icon: "🤍", season: 7, rarity: "ICON SERIES | OUTFIT" },
        { name: "SKULL TROOPER", desc: "The original spooky icon.", icon: "☠️", season: 1, rarity: "EPIC | OUTFIT" },
        { name: "SPARKLE SPECIALIST", desc: "Show them how it's done.", icon: "🪩", season: 2, rarity: "EPIC | OUTFIT" },
        { name: "DIRE", desc: "Out for blood.", icon: "🐺", season: 6, rarity: "LEGENDARY | OUTFIT" },
        { name: "CALAMITY", desc: "Sundance and justice.", icon: "🤠", season: 6, rarity: "EPIC | OUTFIT" },
        { name: "ICE KING", desc: "Long live the king.", icon: "👑", season: 7, rarity: "LEGENDARY | OUTFIT" },
        { name: "LUX", desc: "Shine bright.", icon: "💎", season: 8, rarity: "EPIC | OUTFIT" },
        { name: "BLACK KNIGHT", desc: "The legend of Wailing Woods.", icon: "⚔️", season: 2, rarity: "LEGENDARY | OUTFIT" },
        { name: "PEELY", desc: "A ripe acquisition.", icon: "🍌", season: 8, rarity: "EPIC | OUTFIT" }
    ];

    lockerItems.forEach((item, index) => {
        let isSelected = index === 0 ? 'selected' : '';
        html += `
            <div class="locker-slot ${isSelected}" onclick="selectLockerItem('${item.name}', '${item.desc}', '${item.icon}', '${item.rarity}')">
                <span class="locker-slot-icon">${item.icon}</span>
                <span class="locker-season-badge">${item.season}</span>
                <span class="locker-favorite-star">⭐</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

function selectLockerItem(name, desc, icon, rarity) {
    document.getElementById('locker-item-title').innerText = name;
    document.getElementById('locker-item-desc').innerHTML = desc;
    document.getElementById('locker-preview-avatar').innerText = icon;
    document.getElementById('locker-item-rarity').innerText = rarity;
}

// Renderização do Battle Pass (13 Páginas / 100 Tiers)
function renderBattlePassPage() {
    document.getElementById('current-tier-num').innerText = currentTier;
    document.getElementById('page-indicator-text').innerText = `PAGE ${currentPage} / ${maxPages}`;
    
    const colsHeader = document.getElementById('bp-cols-header');
    const rowsContainer = document.getElementById('bp-rows-container');

    colsHeader.innerHTML = '<div class="col-num-tag">#</div>';
    let freeRowHTML = '<div class="row-tag-name">FREE</div>';
    let paidRowHTML = '<div class="row-tag-name paid-tag">PASTE</div>';

    const startTierIndex = (currentPage - 1) * tiersPerPage + 1;
    const rewardIcons = ['🛡️', '🖼️', '⭐', '🪙', '🔥', '⚔️', '🎨', '👤', '🎁', '⚡'];

    for (let i = 0; i < tiersPerPage; i++) {
        let tierNumber = startTierIndex + i;
        if (tierNumber > totalTiers) break;

        colsHeader.innerHTML += `<div class="col-num-tag">${tierNumber}</div>`;

        let isUnlocked = tierNumber <= currentTier;
        let iconFree = rewardIcons[(tierNumber + 2) % rewardIcons.length];
        let iconPaid = rewardIcons[tierNumber % rewardIcons.length];

        freeRowHTML += `
            <div class="bp-item-slot ${isUnlocked ? 'unlocked' : 'locked'}" onclick="inspectItem('Recompensa Gratuita Tier ${tierNumber}', 'Item gratuito.', '${iconFree}')">
                <span class="item-icon">${iconFree}</span>
                ${isUnlocked ? '<div class="check-mark">✔</div>' : ''}
            </div>
        `;

        paidRowHTML += `
            <div class="bp-item-slot premium ${isUnlocked ? 'unlocked item-selected' : 'locked'}" onclick="inspectItem('GALE FORCE', 'Rise above the storm.<br>Part of the Valiant set.', '${iconPaid}')">
                <span class="item-icon">${iconPaid}</span>
                ${isUnlocked ? '<div class="check-mark">✔</div>' : ''}
            </div>
        `;
    }

    rowsContainer.innerHTML = `
        <div class="bp-row-line">${freeRowHTML}</div>
        <div class="bp-row-line paid-line">${paidRowHTML}</div>
    `;
}

function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > maxPages) currentPage = maxPages;
    renderBattlePassPage();
}

function buyBattlePassTier() {
    let coinsElem = document.getElementById('player-coins');
    let currentCoins = parseInt(coinsElem.innerText);
    if (currentCoins >= 100 && currentTier < totalTiers) {
        currentCoins -= 100;
        coinsElem.innerText = currentCoins;
        currentTier++;
        currentPage = Math.min(Math.ceil(currentTier / tiersPerPage), maxPages);
        renderBattlePassPage();
        alert(`🎉 Subiu para o Tier ${currentTier}!`);
    }
}

function inspectItem(name, desc, icon) {
    document.getElementById('inspect-name').innerText = name;
    document.getElementById('inspect-desc').innerHTML = desc;
    document.getElementById('inspect-icon-display').innerText = icon;
}

function launchGame() {
    document.getElementById('lobby-screen').style.display = 'none';
    document.getElementById('crosshair').style.display = 'block';
    init3DWorld();
    gameRunning = true;
}

function init3DWorld() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070b);
    scene.fog = new THREE.FogExp2(0x05070b, 0.035);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.PointerLockControls(camera, document.body);
    controls.lock();
    scene.add(controls.getObject());

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(10, 30, 10);
    scene.add(dirLight);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 60),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

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
