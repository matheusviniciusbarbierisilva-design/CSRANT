let scene, camera, renderer, controls;
let gameRunning = false;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let prevTime = performance.now();

// Configuração exata: 100 Tiers divididos em 13 páginas (7 itens por página nas primeiras e o ajuste na última)
let currentTier = 24;
let currentPage = 1;
const totalTiers = 100;
const tiersPerPage = 7;
const maxPages = 13; // Exatamente 13 páginas solicitadas

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
    } else if (tabName === 'store') {
        document.getElementById('content-store').classList.add('active-content');
    }

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Renderização das recompensas por página com navegação individual (1 em 1)
function renderBattlePassPage() {
    document.getElementById('current-tier-num').innerText = currentTier;
    document.getElementById('lobby-tier-display').innerText = currentTier;
    document.getElementById('page-indicator-text').innerText = `PAGE ${currentPage} / ${maxPages}`;
    
    let nextTierVal = currentTier < totalTiers ? currentTier + 1 : totalTiers;
    document.getElementById('next-tier-target').innerText = nextTierVal;

    const colsHeader = document.getElementById('bp-cols-header');
    const rowsContainer = document.getElementById('bp-rows-container');

    colsHeader.innerHTML = '<div class="col-num-tag">#</div>';
    let freeRowHTML = '<div class="row-tag-name">FREE</div>';
    let paidRowHTML = '<div class="row-tag-name paid-tag">PASTE</div>';

    const startTierIndex = (currentPage - 1) * tiersPerPage + 1;

    // Ícones e recompensas inspiradas na imagem de referência
    const rewardIcons = ['🛡️', '🖼️', '⭐', '🪙', '🔥', '⚔️', '🎨', '👤', '🎁', '⚡'];

    for (let i = 0; i < tiersPerPage; i++) {
        let tierNumber = startTierIndex + i;
        if (tierNumber > totalTiers) break; // Trava estritamente no 100

        colsHeader.innerHTML += `<div class="col-num-tag">${tierNumber}</div>`;

        let isUnlocked = tierNumber <= currentTier;
        let iconFree = rewardIcons[(tierNumber + 2) % rewardIcons.length];
        let iconPaid = rewardIcons[tierNumber % rewardIcons.length];
        
        let nameFreeItem = `Recompensa Gratuita Tier ${tierNumber}`;
        let namePaidItem = tierNumber === 24 ? "GALE FORCE" : `Recompensa Premium Tier ${tierNumber}`;
        let descPaidItem = tierNumber === 24 ? "Rise above the storm.<br>Part of the Valiant set." : `Item exclusivo do Passe de Batalha para o nível ${tierNumber}.`;

        freeRowHTML += `
            <div class="bp-item-slot ${isUnlocked ? 'unlocked' : 'locked'}" onclick="inspectItem('${nameFreeItem}', 'Recompensa gratuita do nível ${tierNumber}.', '${iconFree}')">
                <span class="item-icon">${iconFree}</span>
                ${isUnlocked ? '<div class="check-mark">✔</div>' : ''}
            </div>
        `;

        paidRowHTML += `
            <div class="bp-item-slot premium ${isUnlocked ? 'unlocked item-selected' : 'locked'}" onclick="inspectItem('${namePaidItem}', '${descPaidItem}', '${iconPaid}')">
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

// Funções para avançar ou recuar página por página de forma fluida
function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > maxPages) currentPage = maxPages;
    renderBattlePassPage();
}

function buyBattlePassTier() {
    let coinsElem = document.getElementById('player-coins');
    let currentCoins = parseInt(coinsElem.innerText);
    const tierCost = 100;

    if (currentCoins >= tierCost) {
        if (currentTier < totalTiers) {
            currentCoins -= tierCost;
            coinsElem.innerText = currentCoins;
            currentTier++;
            
            currentPage = Math.min(Math.ceil(currentTier / tiersPerPage), maxPages);
            renderBattlePassPage();
            alert(`🎉 Subiu com sucesso para o Tier ${currentTier}!`);
        } else {
            alert('🏆 Já atingiu o nível máximo (100) do Passe de Batalha!');
        }
    } else {
        alert('❌ Moedas insuficientes para comprar o próximo nível!');
    }
}

function inspectItem(itemName, itemDescription, icon) {
    document.getElementById('inspect-name').innerText = itemName;
    document.getElementById('inspect-desc').innerHTML = itemDescription;
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
