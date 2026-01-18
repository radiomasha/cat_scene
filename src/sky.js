import * as THREE from 'three';

let sceneRef = null;
let currentOffset = 0;
let skyMesh = null;
let skyCanvas = null;
let skyTexture = null;
//sky colors
const skyKeyframes = [
    { h: 0,  top: 0x0a0a14, bottom: 0x1a1a2e },
    { h: 4,  top: 0x14142a, bottom: 0x1a1a2e },
    { h: 5,  top: 0x3d2e4f, bottom: 0x5a4a6a },
    { h: 6,  top: 0xd4a5c9, bottom: 0xf5c7b8 },
    { h: 7,  top: 0xc9a088, bottom: 0xf5d0b8 },
    { h: 8,  top: 0xa8d4f0, bottom: 0xc8e4f8 },
    { h: 10, top: 0x87ceeb, bottom: 0xb8e0f8 },
    { h: 14, top: 0x7ec8e3, bottom: 0xa8d8f0 },
    { h: 17, top: 0xf8d568, bottom: 0xf8e8a8 },
    { h: 18, top: 0xf4a460, bottom: 0xf8c898 },
    { h: 19, top: 0xd4738c, bottom: 0xe8a8b8 },
    { h: 20, top: 0x5c4b7a, bottom: 0x3a3a5a },
    { h: 21, top: 0x2a2a5a, bottom: 0x1a1a2e },
    { h: 23, top: 0x0a0a14, bottom: 0x1a1a2e },
];

function hexToRgb(hex) {
    return {
        r: (hex >> 16) & 0xff,
        g: (hex >> 8) & 0xff,
        b: hex & 0xff
    };
}

function lerpColor(c1, c2, t) {
    const r = c1.r + (c2.r - c1.r) * t;
    const g = c1.g + (c2.g - c1.g) * t;
    const b = c1.b + (c2.b - c1.b) * t;
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function getKeyframeColors(hour, minute) {
    let prev = skyKeyframes[skyKeyframes.length - 1];
    let next = skyKeyframes[0];

    for (let i = 0; i < skyKeyframes.length; i++) {
        if (skyKeyframes[i].h <= hour) prev = skyKeyframes[i];
        if (skyKeyframes[i].h > hour) { next = skyKeyframes[i]; break; }
    }

    let duration = next.h - prev.h;
    if (duration <= 0) duration += 24;

    let elapsed = (hour + minute / 60) - prev.h;
    if (elapsed < 0) elapsed += 24;

    const t = elapsed / duration;

    const topColor = lerpColor(hexToRgb(prev.top), hexToRgb(next.top), t);
    const bottomColor = lerpColor(hexToRgb(prev.bottom), hexToRgb(next.bottom), t);

    return { topColor, bottomColor };
}

function updateGradient(topColor, bottomColor) {
    const ctx = skyCanvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, skyCanvas.height);
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, skyCanvas.width, skyCanvas.height);
    skyTexture.needsUpdate = true;
}

function getHourForTimezone(offset) {
    const now = new Date();
    const utcHour = now.getUTCHours();
    return (utcHour + parseFloat(offset) + 24) % 24;
}

export function initSky(scene) {
    sceneRef = scene;

    // Create canvas for gradient
    skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1;
    skyCanvas.height = 256;

    // Create texture from canvas
    skyTexture = new THREE.CanvasTexture(skyCanvas);

    // Create plane that fills background
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({ map: skyTexture });
    skyMesh = new THREE.Mesh(geometry, material);
    skyMesh.position.z = -10;
    scene.add(skyMesh);

    updateSky();
}

export function updateSky(offset = currentOffset) {
    currentOffset = offset;
    if (!sceneRef || !skyCanvas) return;

    const hour = getHourForTimezone(offset);
    const minute = new Date().getUTCMinutes();
    const { topColor, bottomColor } = getKeyframeColors(hour, minute);
    updateGradient(topColor, bottomColor);

    // Debug display
   // const debug = document.getElementById('debug');
    //if (debug) {
   //     const utcHour = new Date().getUTCHours();
   //     debug.textContent = `UTC: ${utcHour}:${minute.toString().padStart(2, '0')} | Local (offset ${offset}): ${Math.floor(hour)}:${minute.toString().padStart(2, '0')}`;
   // }
}