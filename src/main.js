import { scene } from './scene.js';
import { createCamera } from './camera.js';
import { createRenderer } from './renderer.js';
import { initSky, updateSky } from './sky.js';
import {initCelestials, updateCelestial} from "./celestial.js";
import {initSceneElements, updateSceneElements} from "./sceneElements.js";

//to make sure that cos is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('scene');

    const camera = createCamera();
    const renderer = createRenderer(canvas);

    const userOffset = -new Date().getTimezoneOffset() / 60;
    
    initSky(scene);
    initCelestials(scene);
    initSceneElements(scene, camera, canvas);
    
    const timezoneSelect = document.getElementById('timezone');
    selectClosestTimezone(timezoneSelect, userOffset);
    timezoneSelect.addEventListener('change', () => {
        const value = timezoneSelect.value;
        const offset = (value === 'auto')
            ? -new Date().getTimezoneOffset() / 60
            : parseFloat(value);
        updateSky(offset);
        updateCelestial(offset);
    });

    function animate() {
        requestAnimationFrame(animate);
        updateSky();
        updateCelestial();
        updateSceneElements();
        renderer.render(scene, camera);
    }

    animate();

    function selectClosestTimezone(select, targetOffset) {
        let closestOption = select.options[0];
        let closestDiff = Infinity;

        for (const option of select.options) {
            const diff = Math.abs(parseFloat(option.value) - targetOffset);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestOption = option;
            }
        }

        closestOption.selected = true;
    }
});