import * as THREE from 'three';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(60, PHONE_WIDTH / PHONE_HEIGHT, 0.1, 100);
    camera.position.z = 5;
    return camera;
}