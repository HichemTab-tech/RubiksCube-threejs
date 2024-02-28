import Face from './face.js';
import Cube from "./cube";
import * as THREE from 'three';
import Map from "./map";
import GameSolver from "./GameSolver";

export default class Game {

    controls;
    camera;
    renderer;
    raycaster;
    pointer = new THREE.Vector2();

    RubiksSize = 3
    start;

    static redColor = "#C52E36";
    static greenColor = "#019719";
    static blueColor = "#304FC9";
    static yellowColor = "#EBD51B";
    static orangeColor = "#E46C15";
    static whiteColor = "#ffffff";
    static defaultColor = "#888888";
    static allColors = [Game.redColor, Game.orangeColor, Game.yellowColor, Game.whiteColor, Game.blueColor, Game.greenColor, Game.defaultColor];
    /** @type GameSolver */
    gameSolver;

    /** @type Cube[] */
    cubes = [];
    /** @type Face[] */
    faces = [];
    /** @type Map */
    map;
    RubiksCube;

    scene;

    static speeds = [0.03,0.1,0.15,0.15];

    tmpMoveProgress = 0;
    tmpMaxMoveProgress = 0;
    tmpRestProgress = 0;
    movesToMake = [];
    movesHistory=[];

    /** @type {false|object} */
    #isMouseDown = false;

    bigCubes;

    bigCycle;

    constructor(renderer, scene, camera, mapParentHtmlElement, controls) {
        this.scene = scene;
        this.renderer = renderer;
        this.camera = camera;
        this.map = new Map(this, mapParentHtmlElement);
        this.controls = controls;
        this.bigCycle = [0];
        while (this.bigCycle[this.bigCycle.length-1]+this.RubiksSize<=(Math.pow(this.RubiksSize, 2)-this.RubiksSize)) {
            this.bigCycle.push(this.bigCycle[this.bigCycle.length-1]+this.RubiksSize);
        }
        while (this.bigCycle[this.bigCycle.length-1]+1<Math.pow(this.RubiksSize, 2)) {
            this.bigCycle.push(this.bigCycle[this.bigCycle.length-1]+1);
        }
        while (this.bigCycle[this.bigCycle.length-1]-this.RubiksSize>=(this.RubiksSize-1)) {
            this.bigCycle.push(this.bigCycle[this.bigCycle.length-1]-this.RubiksSize);
        }
        while (this.bigCycle[this.bigCycle.length-1]-1>0) {
            this.bigCycle.push(this.bigCycle[this.bigCycle.length-1]-1);
        }
        this.init();
    }

    init() {
        // noinspection JSCheckFunctionSignatures
        this.raycaster = new THREE.Raycaster();
        this.start = -1*(this.RubiksSize-1)/2;
        this.createCubes();
        this.makeFaces();
        this.createPivotPoints();
        this.refreshMaps();
        this.createCommandsButtons();
        this.createMouseEvents();
        this.gameSolver = new GameSolver(this);
    }

    createCubes() {
        const bigCubeSize = 30;
        let geometry = new THREE.BoxGeometry(1, bigCubeSize, bigCubeSize);
        const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
        this.bigCubes = [];
        let c;
        c = new THREE.Mesh(geometry, material);
        c.position.x = bigCubeSize/2;
        this.bigCubes.push(c);

        c = new THREE.Mesh(geometry, material);
        c.position.x = -(bigCubeSize/2);
        this.bigCubes.push(c);


        geometry = new THREE.BoxGeometry(bigCubeSize, bigCubeSize, 1);
        c = new THREE.Mesh(geometry, material);
        c.position.z = bigCubeSize/2;
        this.bigCubes.push(c);

        c = new THREE.Mesh(geometry, material);
        c.position.z = -(bigCubeSize/2);
        this.bigCubes.push(c);


        geometry = new THREE.BoxGeometry(bigCubeSize, 1, bigCubeSize);
        c = new THREE.Mesh(geometry, material);
        c.position.y = bigCubeSize/2;
        this.bigCubes.push(c);

        c = new THREE.Mesh(geometry, material);
        c.position.y = -(bigCubeSize/2);
        this.bigCubes.push(c);

        for (let i = 0; i < this.bigCubes.length; i++) {
            //this.scene.add(this.bigCubes[i]);
        }

        this.RubiksCube = new THREE.Group();
        let max= this.RubiksSize;
        let start = this.start;
        for (let i = 0; i < max; i++) {
            for (let j = 0; j < max; j++) {
                for (let k = 0; k < max; k++) {
                    let colors = [];
                    colors.push(i===(max-1) ? 0 : 6);
                    colors.push(i===0 ? 1 : 6);
                    colors.push(j===(max-1) ? 2 : 6);
                    colors.push(j===0 ? 3 : 6);
                    colors.push(k===(max-1) ? 4 : 6);
                    colors.push(k===0 ? 5 : 6);
                    let cube = new Cube(colors, [i,j,k].filter((n) => n === (max-1)/2).length===2);
                    cube.ThreeCube.position.x += i+start;
                    cube.ThreeCube.position.y += j+start;
                    cube.ThreeCube.position.z += k+start;
                    this.RubiksCube.add(cube.ThreeCube);
                    this.cubes.push(cube);
                }
            }
        }

        this.RubiksCube.cursor = 'pointer';
    }

    createPivotPoints() {
        let pivotPoints0 = [];
        let pivotPoint;
        const dis = (this.RubiksSize-2)/2+0.5;
        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = dis;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = 0;
        pivotPoints0.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = -dis;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = 0;
        pivotPoints0.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = dis;
        pivotPoint.position.z = 0;
        pivotPoints0.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = -dis;
        pivotPoint.position.z = 0;
        pivotPoints0.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = dis;
        pivotPoints0.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = -dis;
        pivotPoints0.push(pivotPoint);

        let pivotPoints = {};
        for (let i = 0; i < pivotPoints0.length; i++) {
            pivotPoints[i] = pivotPoints0[i];
        }

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            pivotPoint = new THREE.Object3D();
            pivotPoint.position.x = dis-(i + 1);
            pivotPoint.position.y = 0;
            pivotPoint.position.z = 0;
            pivotPoints[1000 + i + 1] = pivotPoint;
        }

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            pivotPoint = new THREE.Object3D();
            pivotPoint.position.x = 0;
            pivotPoint.position.y = dis-(i + 1);
            pivotPoint.position.z = 0;
            pivotPoints[1200 + i + 1] = pivotPoint;
        }

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            pivotPoint = new THREE.Object3D();
            pivotPoint.position.x = 0;
            pivotPoint.position.y = 0;
            pivotPoint.position.z = dis-(i + 1);
            pivotPoints[1400 + i + 1] = pivotPoint;
        }

        const keys = Object.keys(pivotPoints);
        for (let i = 0; i < keys.length; i++) {
            this.scene.add(pivotPoints[keys[i]]);
            this.findFace(keys[i]).pivotPoint = pivotPoints[keys[i]];
        }
    }

    makeFaces() {
        let bigGroup = this.cubes;
        let face;
        face = new Face(0);
        for (let i = 0; i < this.RubiksSize; i++) {
            face.addToGroup([...bigGroup.slice(Math.pow(this.RubiksSize, 2)*(this.RubiksSize - 1)+this.RubiksSize*i, Math.pow(this.RubiksSize, 3)-this.RubiksSize*(this.RubiksSize-1-i))].reverse())
        }
        this.faces.push(face);

        face = new Face(1);
        face.group = bigGroup.slice(0, Math.pow(this.RubiksSize, 2));
        this.faces.push(face);

        face = new Face(2);
        face.addToGroup(bigGroup.slice(-this.RubiksSize).reverse());
        for (let i = this.RubiksSize - 2; i >= 0; i--) {
            face.addToGroup(bigGroup.slice((this.RubiksSize*(this.RubiksSize - 1 + this.RubiksSize*i)), (this.RubiksSize*(this.RubiksSize + this.RubiksSize*i))).reverse());
        }
        this.faces.push(face);

        face = new Face(3);
        for (let i = 0; i < this.RubiksSize; i++) {
            face.addToGroup(bigGroup.slice(Math.pow(this.RubiksSize, 2)*i, Math.pow(this.RubiksSize, 2)*i+this.RubiksSize).reverse());
        }
        this.faces.push(face);

        face = new Face(4);
        for (let i = 0; i < this.RubiksSize; i++) {
            for (let j = 0; j < this.RubiksSize; j++) {
                face.addToGroup(bigGroup[(i+1)*this.RubiksSize-1+j*Math.pow(this.RubiksSize, 2)]);
            }
        }
        this.faces.push(face);

        face = new Face(5);
        for (let i = 0; i < this.RubiksSize; i++) {
            for (let j = this.RubiksSize - 1; j >= 0; j--) {
                face.addToGroup(bigGroup[i*this.RubiksSize+j*Math.pow(this.RubiksSize, 2)]);
            }
        }
        this.faces.push(face);

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            face = new Face(1000+i+1);
            for (let j = 0; j < this.RubiksSize; j++) {
                face.addToGroup([...bigGroup.slice(Math.pow(this.RubiksSize, 2)*(this.RubiksSize - (i+2))+j*this.RubiksSize, Math.pow(this.RubiksSize, 2)*(this.RubiksSize - (i+2))+j*this.RubiksSize+this.RubiksSize)].reverse());
            }
            this.faces.push(face);
        }

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            face = new Face(1200+i+1);
            face.addToGroup(bigGroup.slice(-this.RubiksSize*(i+2), Math.pow(this.RubiksSize, 3)-this.RubiksSize*(i+1)).reverse());
            for (let j = this.RubiksSize - 2; j >= 0; j--) {
                face.addToGroup(bigGroup.slice((this.RubiksSize*(this.RubiksSize - (i+2) + this.RubiksSize*j)), (this.RubiksSize*(this.RubiksSize - (i+1) + this.RubiksSize*j))).reverse());
            }
            this.faces.push(face);
        }

        for (let i = this.RubiksSize - 3; i >= 0; i--) {
            face = new Face(1400+this.RubiksSize - 3-i+1);
            for (let j = 0; j < this.RubiksSize; j++) {
                for (let k = 0; k < this.RubiksSize; k++) {
                    face.addToGroup(bigGroup[j*this.RubiksSize+(i+1)+k*Math.pow(this.RubiksSize, 2)]);
                }
            }
            this.faces.push(face);
        }

        for (let i = 0; i < this.faces.length; i++) {
            let group = this.faces[i].group;
            for (let j = 0; j < group.length; j++) {
                if (!group[j].parents[this.faces[i].axe].includes(this.faces[i].faceId)) {
                    group[j].parents[this.faces[i].axe].push(this.faces[i].faceId);
                }
            }
        }
    }

    refreshFaces() {
        for (let i = 0; i < this.faces.length; i++) {
            this.faces[i].group = [];
        }
        let faceConditions0= [
            ["x", (this.RubiksSize-1)/2],
            ["x", -(this.RubiksSize-1)/2],
            ["y", (this.RubiksSize-1)/2],
            ["y", -(this.RubiksSize-1)/2],
            ["z", (this.RubiksSize-1)/2],
            ["z", -(this.RubiksSize-1)/2],
        ];
        let faceConditions = {};
        for (let i = 0; i < faceConditions0.length; i++) {
            faceConditions[i] = faceConditions0[i];
        }
        for (let i = 0; i < this.RubiksSize - 2; i++) {
            faceConditions[1000 + i + 1] = ["x", (this.RubiksSize-1)/2-(i + 1)];
        }

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            faceConditions[1200 + i + 1] = ["y", (this.RubiksSize-1)/2-(i + 1)];
        }

        for (let i = 0; i < this.RubiksSize - 2; i++) {
            faceConditions[1400 + i + 1] = ["z", (this.RubiksSize-1)/2-(i + 1)];
        }

        console.log(faceConditions);

        for (let i = 0; i < this.cubes.length; i++) {
            let cubePos = this.cubes[i].ThreeCube.position;
            this.cubes[i].resetParents();
            for (let j0 = 0; j0 < this.faces.length; j0++) {
                let j = this.faces[j0].faceId;
                if (cubePos[faceConditions[j][0]] === faceConditions[j][1]) {
                    if (!this.cubes[i].parents[faceConditions[j][0]].includes(j)) {
                        this.cubes[i].parents[faceConditions[j][0]].push(j);
                    }
                    this.faces[j0].addToGroup(this.cubes[i]);
                }
            }
        }
        for (let i = 0; i < this.faces.length; i++) {
            this.faces[i].reorderCubes();
        }
    }

    refreshMaps() {
        for (let i = 0; i < 6; i++) {
            /** @var Face */
            let face = this.findFace(i);
            for (let j = 0; j < Math.pow(this.RubiksSize, 2); j++) {
                this.map.domMaps[i][j] = face.group[j].colors[face.axe];
            }
        }
        this.map.fillMapsDom();
        this.map.maps = this.map.domMaps;
    }

    createCommandsButtons() {
            for(let i = 0; i <= 5; i++) {
                let buttonCW = $("<button/>") // Create clockwise button
                    .addClass("btn command-btn")
                    .attr("data-color-index", i)
                    .attr("data-clockwise", "1")
                    .html('<i class="bi bi-arrow-clockwise"></i>');
                let buttonCCW = $("<button/>") // Create counter-clockwise button
                    .addClass("btn command-btn")
                    .attr("data-color-index", i)
                    .attr("data-clockwise", "0")
                    .html('<i class="bi bi-arrow-counterclockwise"></i>');

                $("#commands-container").append(buttonCW, buttonCCW); // Add column to the container
            }
            const instance = this;
            $('.command-btn').click(function() {
                let faceId = $(this).attr('data-color-index');
                let clockwise = $(this).attr('data-clockwise')==="1";
                instance.move(parseInt(faceId), clockwise);
            });
    }

    animationLoop() {

    }

    createMouseEvents() {
        let game = this;
        let mousedown = (ev) => {
            console.log(ev);
            game.#isMouseDown = {
                faceUUID: null,
                faceToMove: -1
            };
            game.controls.enabled = false;
        };
        let mousemove = (ev) => {
            if (game.#isMouseDown !== false) {
                //console.log(ev);
                // Check for intersections with the cube
                const intersects = ev.intersects;
                //console.log([...intersects]);
                if (game.#isMouseDown.faceToMove === -1) {
                    if (intersects.length > 0) {
                        let newUuid = intersects[0].object.parent.uuid;
                        if (game.#isMouseDown.faceUUID === null) {
                            console.log(newUuid);
                            game.#isMouseDown.faceUUID = newUuid;
                        } else {
                            if (game.#isMouseDown.faceUUID !== newUuid) {
                                console.log(game.#isMouseDown.faceUUID, newUuid);
                                let cube1 = game.cubes.find((c) => c.uuid === game.#isMouseDown.faceUUID);
                                let cube2 = game.cubes.find((c) => c.uuid === newUuid);
                                if (cube1.type === "F1" || cube2.type === "F1") {
                                    mouseup();
                                    return;
                                }
                                let thisFace = cube2.getParentOfTransparent(intersects[0].object.uuid)[0];
                                console.log("thisFace", thisFace);
                                //let intersection = Object.values(cube1.parents).filter(x => x.filter(x2 => Object.values(cube2.parents).includes(x2)).length!==0);
                                let intersection = Object.values(cube1.parents).filter(x => {
                                    if (x.length===0) return false;
                                    return x.filter(x2 => Object.values(cube2.parents).flat().includes(x2)).length !== 0;
                                }).flat();
                                console.log("intersection", intersection, cube1.parents, cube2.parents);
                                let faceToTurn = intersection.filter((i) => i!==thisFace)[0];
                                console.log({...game.findFace(faceToTurn)});
                                let faceUuids = game.findFace(faceToTurn).group.map((c) => c.uuid);
                                let index1 = faceUuids.indexOf(cube1.uuid);
                                let index2 = faceUuids.indexOf(cube2.uuid);
                                game.#isMouseDown.faceToMove = faceToTurn;
                                console.log("faceToTurn", faceToTurn, index1, index2);
                                mouseup();
                                let clockwise = this.bigCycle[this.bigCycle.indexOf(index1)+1%this.bigCycle.length] === index2;
                                game.move(faceToTurn, clockwise);
                            }
                        }
                    }
                }
            }
        };
        let mouseup = (_ev) => {
            game.#isMouseDown = false;
            game.controls.enabled = true;
        };
        game.scene.on('mousemove', (ev) => mousemove(ev));
        game.scene.on('mouseup', (ev) => mouseup(ev));
        game.scene.on('mousedown', (ev) => mousedown(ev));
    }

    move(faceId, clockwise = null) {
        if (Array.isArray(faceId)) {
            if (clockwise !== null) {
                faceId = faceId.map((f) => {
                    f.speed = clockwise;
                    return f;
                });
            }
            this.movesToMake.push(...faceId);
            return;
        }
        let move = {
            faceId: faceId,
            clockwise: clockwise,
            speed: 0
        };
        this.movesToMake.push(move);
    }

    static generateCanvasFace(color, number = -1) {
        let canvas = document.createElement( 'CANVAS' );
        canvas.width = 512;
        canvas.height = 512;
        let context = canvas.getContext( '2d' );

        context.fillStyle = color;
        context.fillRect( 0, 0, 512, 512 );
        context.strokeStyle = '#050505';
        context.lineWidth = 32;
        context.strokeRect( 16, 16, 512-32, 512-32 );

        if (number !== -1) {
            context.font = "400px MyFont"; // Increased font size
            context.fillStyle = '#050505'; // Changed text color to white for visibility
            context.fillText(number.toString(), 136, 400); // Adjusted coordinates to center of canvas
        }

        return canvas;
    }

    /** @var Face */
    findFace(faceId) {
        if (typeof faceId === 'string') faceId = parseInt(faceId);
        for (let i = 0; i < this.faces.length; i++) {
            if (this.faces[i].faceId===faceId) return this.faces[i];
        }
        return null;
    }

    animateAMoveIfThereIsOne() {
        if (this.searchForAvailableMove()) {
            let move = this.movesToMake[0];
            if (typeof move.speed === 'undefined') move.speed = 2;
            if (this.tmpMoveProgress === 0) {
                this.tmpMaxMoveProgress = Math.PI/2/Game.speeds[move.speed];
                this.tmpRestProgress = Math.ceil(this.tmpMaxMoveProgress) - this.tmpMaxMoveProgress;
                this.tmpMaxMoveProgress = Math.ceil(this.tmpMaxMoveProgress);
            }
            if (this.tmpMaxMoveProgress === this.tmpMoveProgress) {
                this.tmpMoveProgress = 0;
                this.tmpMaxMoveProgress = 0;
                console.log("done");
                game.findFace(move.faceId).correctCubesPositions();
                game.findFace(move.faceId).correctCubesColorsAxis();
                this.refreshFaces();
                this.refreshMaps();
                this.movesHistory.push(move);
                this.movesToMake.shift();
            }
            else{
                this.tmpMoveProgress++;
                if (this.tmpMaxMoveProgress === this.tmpMoveProgress) {
                    game.findFace(move.faceId).turn(move, Game.speeds[move.speed]*this.tmpRestProgress);
                }
                else {
                    game.findFace(move.faceId).turn(move);
                }
            }
        }
    }

    searchForAvailableMove() {
        return this.movesToMake.length !== 0;

    }

    shuffle() {
        let n = Math.floor(Math.random() * 21) + 20;

        let moves = [];

        for (let i = 0; i < n; i++) {
            let move = this.#randomMove();
            if (moves.length !== 0) {
                while (move.faceId === moves[moves.length - 1].faceId && move.clockwise !== moves[moves.length - 1].clockwise) {
                    move = this.#randomMove();
                }
            }
            moves.push(move);
        }

        this.movesToMake.push(...moves);
    }

    #randomMove() {
        return {
            faceId: Math.floor(Math.random() * 6),
            clockwise: Math.random() < 0.5,
            speed: 3,
        }
    }

    // noinspection JSUnusedGlobalSymbols
    solveBackward() {
        let movesBackward = [...this.movesHistory].reverse();
        movesBackward.map((item) => {
            item.speed = 1;
            item.clockwise=!item.clockwise;
            return item;
        });
        this.movesHistory = [];
        this.movesToMake.push(...movesBackward);
    }
}