import * as THREE from 'three';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

export function createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(PHONE_WIDTH, PHONE_HEIGHT);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    return renderer;
}