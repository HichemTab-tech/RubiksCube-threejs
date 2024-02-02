// noinspection JSCheckFunctionSignatures

import * as THREE from 'three';
import {OrbitControls} from "three/addons";
import Game from './game';
import {areNumbersAlmostEqual} from './utils';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer( {antialias: true} );
renderer.setSize( innerWidth, innerHeight );
renderer.setAnimationLoop( animationLoop );
document.body.appendChild( renderer.domElement );

window.addEventListener( "resize", (event) => {
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix( );
    renderer.setSize( innerWidth, innerHeight );
});


const ambientLight = new THREE.AmbientLight( 'white', 2 );
scene.add( ambientLight );

const light = new THREE.DirectionalLight( 'white', 3 );
light.position.set( 1, 1, 1 );
scene.add( light );




let game = new Game(scene, $(".map-parent"));
console.log(game);

let RubiksCube = game.RubiksCube;

scene.add(RubiksCube);




const controls = new OrbitControls( camera, renderer.domElement );

camera.position.z = 6;
camera.position.x=-4
camera.position.y=4


//animation
const maxAnimations = 10;
let initPos=new Array(RubiksCube.children.length);
window.initPos = initPos;
let coefs=[0,0,0];
let coef=-1;
let maxDis = 0.8;
let animations = 0;
let stop = [true, true];

function stopAnimation() {
    stop[0] = true;
    $("#start").removeClass('d-none');
    $("#stop").addClass('d-none');
}

function startAnimation() {
    $("#stop").removeClass('d-none');
    $("#start").addClass('d-none');
    coef=-1;
    animations = 0;
    for (let i = 0; i < RubiksCube.children.length; i++) {
        let group = RubiksCube.children[i];
        initPos[i] = [group.position.x-Game.start, group.position.y-Game.start, group.position.z-Game.start];
    }
    stop[0] = false;
}

function stopAnimation1() {
    stop[1] = true;
    $("#start1").removeClass('d-none');
    $("#stop1").addClass('d-none');
}

function startAnimation1() {
    $("#stop1").removeClass('d-none');
    $("#start1").addClass('d-none');
    stop[1] = false;
}

function animationLoop() {

    controls.update();
    light.position.copy( camera.position );
    ambientLight.position.copy( camera.position );

    renderer.render( scene, camera );
    animationsList();
    game.animateAMoveIfThereIsOne();
}

function animationsList() {
    if (!stop[1]) {
        RubiksCube.rotation.x += 0.01;
        RubiksCube.rotation.y += 0.01;
    }
    if (!stop[0]) {
        if (areNumbersAlmostEqual(getPos(RubiksCube.children[0].position)[0], -1 * coef * maxDis) || areNumbersAlmostEqual(getPos(RubiksCube.children[0].position)[0], initPos[0][0])) {
            coef = coef * (-1);
            if (coef>0) {
                animations++;
                if (animations>maxAnimations) {
                    stopAnimation();
                    return;
                }
            }
        }
        for (let i = 0; i < RubiksCube.children.length; i++) {
            let group = RubiksCube.children[i];
            let pos = [
                initPos[i][0],
                initPos[i][1],
                initPos[i][2],
            ];
            coefs = [
                pos[0] === 2 ? 1 : (pos[0] === 0 ? -1 : 0),
                pos[1] === 2 ? 1 : (pos[1] === 0 ? -1 : 0),
                pos[2] === 2 ? 1 : (pos[2] === 0 ? -1 : 0),
            ];
            group.position.x += coefs[0] * coef * 0.01;
            group.position.y += coefs[1] * coef * 0.01;
            group.position.z += coefs[2] * coef * 0.01;
        }
    }
}

function getPos(pos) {
    return [pos.x-Game.start,pos.y-Game.start,pos.z-Game.start];
}


$("#reset_camera").click(function () {
    console.log("reset camera");
    camera.position.z = 6;
    camera.position.x=-4
    camera.position.y=4
});

$("#stop").click(function () {
    animations=maxAnimations;
});

$("#start").click(function () {
    startAnimation();
});

$("#stop1").click(function () {
    stopAnimation1()
});

$("#start1").click(function () {
    startAnimation1();
});

$("#reset1").click(function () {
    RubiksCube.rotation.x=0
    RubiksCube.rotation.y=0
});

$("#shuffle").click(function () {
    game.shuffle();
});

$("#solve-backward").click(function () {
    //game.solveBackward();
    game.gameSolver.start();
});




window.game = game;
window.RubiksCube = RubiksCube;
window.camera = camera;
window.THREE = THREE;
window.light = light;
window.ambientLight = ambientLight;