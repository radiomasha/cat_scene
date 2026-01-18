import * as THREE from 'three';
import {Ray} from "three";

let sceneRef = null;
let cameraRef = null;
let canvasRef = null;
let branch, cat, eyes, tail, blossom;
let isTouching = false;
let touchStartTime =0;
let tailSwinging = false;
let isBlinking = false;
let tailBaseX = 0;

let shortSound, longSound;

const loader = new THREE.TextureLoader();
export function initSceneElements(scene, camera, canvas) {

    sceneRef = scene;
    cameraRef = camera;
    canvasRef = canvas;
    
    // adding branch
    const texBranch = loader.load('/branch.png',(tex) => {
      //keeping proportions
        const imgWidth = tex.image.width;
        const imgHeight = tex.image.height;
        const aspectRatio = imgWidth / imgHeight;
        const desiredHeight =8;
        const desiredWidth = desiredHeight * aspectRatio;
        branch.scale.set(desiredWidth, desiredHeight, 1);
    });
    texBranch.colorSpace = THREE.SRGBColorSpace;
    const materialBranch = new THREE.SpriteMaterial({
        map: texBranch,
        transparent: true,
        toneMapped: false
    });
    branch = new THREE.Sprite(materialBranch);
    branch.position.set(0, -0.5, -3);
    scene.add(branch);

    const texBlossom = loader.load('/blossom.png',(tex) => {
        //keeping proportions
        const imgWidth = tex.image.width;
        const imgHeight = tex.image.height;
        const aspectRatio = imgWidth / imgHeight;
        const desiredHeight =12;
        const desiredWidth = desiredHeight * aspectRatio;

        blossom.scale.set(desiredWidth, desiredHeight, 1);
    });

    texBlossom.colorSpace = THREE.SRGBColorSpace;

    const materialBlossom = new THREE.SpriteMaterial({
        map: texBlossom,
        transparent: true,
        toneMapped: false
    });
    blossom = new THREE.Sprite(materialBlossom);

    blossom.position.set(-0.3, -0.5, -2);

    scene.add(blossom);
    
//add cat
    const texCat = loader.load('/cat.png', (tex) => {
        // 
        const imgWidth = tex.image.width;
        const imgHeight = tex.image.height;
        const aspectRatio = imgWidth / imgHeight;

        //
        const desiredHeight =7;
        const desiredWidth = desiredHeight * aspectRatio;

        cat.scale.set(desiredWidth, desiredHeight, 1);
    });

    texCat.colorSpace = THREE.SRGBColorSpace;

    const materialCat = new THREE.SpriteMaterial({
        map: texCat,
        transparent: true,
        toneMapped: false
    });
    cat = new THREE.Sprite(materialCat);

    cat.position.set(0, -0.75, -2.8);

    scene.add(cat);
// add eyes
    const texEyes = loader.load('/eyesOpen.png', (tex) => {
        // after image loaded
        const imgWidth = tex.image.width;
        const imgHeight = tex.image.height;
        const aspectRatio = imgWidth / imgHeight;

        // keeping proportions
        const desiredHeight =7;
        const desiredWidth = desiredHeight * aspectRatio;

        eyes.scale.set(desiredWidth, desiredHeight, 1);
    });

    texEyes.colorSpace = THREE.SRGBColorSpace;

    const materialEyes= new THREE.SpriteMaterial({
        map: texEyes,
        transparent: true,
        toneMapped: false
    });
    eyes = new THREE.Sprite(materialEyes);
    eyes.position.set(0, -0.75, -2.78);
    eyes.visible= false;
    scene.add(eyes);
// add tail
    const texTail = loader.load('/tail.png', (tex) => {
        console.log('Tail loaded!', tex.image.width, tex.image.height);
        const imgWidth = tex.image.width;
        const imgHeight = tex.image.height;
        const aspectRatio = imgWidth / imgHeight;

        // keeping proroportions
        const desiredHeight =7;
        const desiredWidth = desiredHeight * aspectRatio;

        tail.scale.set(desiredWidth, desiredHeight, 1);
    });

    texTail.colorSpace = THREE.SRGBColorSpace;

    const materialTail = new THREE.SpriteMaterial({
        map: texTail,
        transparent: true,
        toneMapped: false
    });
    tail = new THREE.Sprite(materialTail);
    //tail.center.set(0.5, 1);
    tail.position.set(0, -1, -3.01);

    scene.add(tail);
    
    //--- Audio---
    shortSound = new Audio('/short.wav');
    longSound = new Audio('/long.wav');
    longSound.loop = true;
    
    //---Interaction---
    setupInteraction(camera, canvas);
    
    sceneRef = scene;
}

function setupInteraction(camera, canvas) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function getPointerPosition(event) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;

        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function checkCatIntersection() {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(cat);
        return intersects.length > 0;
    }

    function onTouchStart(event) {
        event.preventDefault();
        getPointerPosition(event);

        if (checkCatIntersection()) {
            isTouching = true;
            touchStartTime = Date.now();

            eyes.visible = true;

            shortSound.currentTime = 0;
            shortSound.play();
        }
    }

    function onTouchEnds(event) {
        if (isTouching) {
            isTouching = false;
            tailSwinging = false;

            eyes.visible = false;

            longSound.pause();
            longSound.currentTime = 0;

            tail.position.x = tailBaseX;
        }
    }

    canvas.addEventListener('mousedown', onTouchStart);
    canvas.addEventListener('mouseup', onTouchEnds);
    canvas.addEventListener('mouseleave', onTouchEnds);

    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchend', onTouchEnds);
    canvas.addEventListener('touchcancel', onTouchEnds);
}
    export function updateSceneElements(){
        if(!tail) return;

        const now = Date.now();
        const holdTime = now - touchStartTime;
        
        
        if(isTouching &&!tailSwinging &&Date.now() - touchStartTime>500){
            tailSwinging = true;
            longSound.play();
        }
        //tail swinging
        if (tailSwinging) {
                const time = Date.now() * 0.003;
                tail.material.rotation = Math.sin(time) * 0.1;  
        }

        if (isTouching && holdTime > 1000) {
            // Blinking
            const blinkCycle = (now % 5000) / 5000;  // 0 to 1 over 2 seconds

            // Eyes closed 
            if(blinkCycle < 0.3) {
                eyes.visible = false;
            } else {
                eyes.visible = true;
            }
        } else if (isTouching) {
            eyes.visible = true;
        }
    }
    
