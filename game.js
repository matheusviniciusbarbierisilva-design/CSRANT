let scene, camera, renderer, controls;
let gameRunning = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// Controlo dos 100 Tiers e Páginas
let currentTier = 24;
let currentPage = 4;
const totalTiers = 100;
const tiersPerPage = 7;
const maxPages = Math.ceil(totalTiers / tiersPerPage);

window.addEventListener('DOMContentLoaded', () => {
    renderBattlePassPage();
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
    } else if (tabName === 'missions') {
        document.getElementById('content-missions').classList.add('active-content');
    } else if (tabName === 'arsenal') {
        document.getElementById('content-arsenal').classList.add('active-content');
    } else if (tabName === 'shop') {
        document.getElementById('content-shop').classList.add('active-content');
    } else if (tabName === 'career') {
        document.getElementById('content-career').classList.add('active-content');
    }

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function toggleModeDropdown() {
    const dropdown = document.getElementById('mode-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

function setGameMode(mode) {
    document.getElementById('current-mode-text').innerText = mode;
    document.getElementById('mode-dropdown').style.display = 'none';
}

window.addEventListener('click', function(e) {
    if (!e.target.closest('.mode-selector-wrapper')) {
        const dropdown = document.getElementById('mode-dropdown');
        if (dropdown) dropdown.style.display = 'none';
    }
});

// Renderização dinâmica das páginas (até ao nível 100)
function renderBattlePassPage() {
    document.getElementById('current-tier-num').innerText = currentTier;
    document.getElementById('lobby-tier-display').innerText = currentTier;
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
        if (tierNumber > totalTiers) tierNumber = totalTiers;

        colsHeader.innerHTML += `<div class="col-num-tag">${tierNumber}</div>`;

        let isUnlocked = tierNumber <= currentTier;
        let iconFree = rewardIcons[(tierNumber + 1) % rewardIcons.length];
        let iconPaid = rewardIcons[tierNumber % rewardIcons.length];
        let nameFreeItem = `Recompensa Gratuita Tier ${tierNumber}`;
        let namePaidItem = `Recompensa Premium Tier ${tierNumber}`;

        freeRowHTML += `
            <div class="bp-item-slot ${isUnlocked ? 'unlocked' : 'locked'}" onclick="inspectItem('${nameFreeItem}', 'Recompensa gratuita correspondente ao tier ${tierNumber}.')">
                <span class="item-icon">${iconFree}</span>
                ${isUnlocked ? '<div class="check-mark">✔</div>' : ''}
            </div>
        `;

        paidRowHTML += `
            <div class="bp-item-slot premium ${isUnlocked ? 'unlocked item-selected' : 'locked'}" onclick="inspectItem('${namePaidItem}', 'Recompensa exclusiva do Passe Pago para o Tier ${tierNumber}.')">
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
    const tierCost = 150;

    if (currentCoins >= tierCost) {
        if (currentTier < totalTiers) {
            currentCoins -= tierCost;
            coinsElem.innerText = currentCoins;
            currentTier++;
            
            currentPage = Math.ceil(currentTier / tiersPerPage);
            renderBattlePassPage();
            alert(`🎉 Subiu com sucesso para o Tier ${currentTier}!`);
        } else {
            alert('🏆 Já atingiu o nível máximo (100) do Passe de Batalha!');
        }
    } else {
        alert('❌ Moedas insuficientes para comprar o próximo nível!');
    }
}

function inspectItem(itemName, itemDescription) {
    document.getElementById('inspect-name').innerText = itemName;
    document.getElementById('inspect-desc').innerHTML = itemDescription;
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

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: 0x00ffcc })
    );
    box.position.set(0, 1, -8);
    scene.add(box);

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
