import * as THREE from 'three';

let sceneRef = null;
let sun, moon;
let currentOffset = 0;
const loader = new THREE.TextureLoader();

export function initCelestials(scene) {
    const textureSun = loader.load('/sun.png');
    const materialSun = new THREE.SpriteMaterial({map: textureSun});
    sun = new THREE.Sprite(materialSun);
    sun.scale.set(1, 1, 1);
    sun.position.set(2,1,-4);
    scene.add(sun);

    const textureMoon = loader.load('/moon.png');
    const materialMoon = new THREE.SpriteMaterial({map: textureMoon});
    moon = new THREE.Sprite(materialMoon);
    moon.scale.set(1, 1, 1);
    moon.position.set(2,1,-4);
    scene.add(moon);
    
    sceneRef = scene;
}


function getHourForTimezone(offset) {
    const now = new Date();
    const utcHour = now.getUTCHours();
    return (utcHour + parseInt(offset) + 24) % 24;
}

export function updateCelestial(offset = currentOffset){
    currentOffset = offset;
    if(!sun||!moon) return;
    const hour = getHourForTimezone(offset);
    const minute = new Date().getUTCMinutes();
    
    const sunStartHour = 6;
    const sunEndHour = 18;
    const arcRadius = 2;
    const arcHeight = 1.75;
    
    const sunVisible=(hour>= sunStartHour&& hour<= sunEndHour);

    if (sunVisible) {
        const progress = (hour + minute / 60 - sunStartHour) / (sunEndHour - sunStartHour);
        const angle = Math.PI * progress;
        sun.position.x = Math.cos(angle) * arcRadius;
        sun.position.y = Math.sin(angle) * arcHeight;
    }
    sun.visible = sunVisible;
    
    const moonVisible = !sunVisible;
    if (moonVisible) {
        let moonHour = hour + minute / 60;
        if (moonHour >= sunEndHour) {
            moonHour = moonHour - sunEndHour;
        } else {
            moonHour = moonHour + 6;
        }
        const progress = moonHour / 12;
        const angle = Math.PI * progress;
        moon.position.x = Math.cos(angle) * arcRadius;
        moon.position.y = Math.sin(angle) * arcHeight;
    }
    moon.visible = moonVisible;
}