import Face from './face.js';
import Cube from "./cube";
import * as THREE from 'three';
import Map from "./map";
export default class Game {


    static RubiksSize = 3
    static start=-1*(Game.RubiksSize/2)+0.5

    static redColor = "#C52E36";
    static greenColor = "#019719";
    static blueColor = "#304FC9";
    static yellowColor = "#EBD51B";
    static orangeColor = "#E46C15";
    static whiteColor = "#ffffff";
    static defaultColor = "#888888";
    static allColors = [Game.redColor, Game.orangeColor, Game.yellowColor, Game.whiteColor, Game.blueColor, Game.greenColor, Game.defaultColor];

    /** @type Cube[] */
    cubes = [];
    /** @type Face[] */
    faces = [];
    /** @type Map */
    map;
    RubiksCube;

    scene;

    static speeds = [0.03,0.1,0.15];

    tmpMoveProgress = 0;
    tmpMaxMoveProgress = 0;
    tmpRestProgress = 0;
    movesToMake = [];
    movesHistory=[];

    constructor(scene, mapParentHtmlElement) {
        this.scene = scene;
        this.map = new Map(mapParentHtmlElement);
        this.init();
    }

    init() {
        this.createCubes();
        this.makeFaces();
        this.createPivotPoints();
        this.refreshMaps();
        this.createCommandsButtons();

    }

    createCubes() {
        this.RubiksCube = new THREE.Group();
        let max= Game.RubiksSize;
        let start = Game.start;
        for (let i = 0; i < max; i++) {
            for (let j = 0; j < max; j++) {
                for (let k = 0; k < max; k++) {
                    let colors = [];
                    colors.push(i===2 ? 0 : 6);
                    colors.push(i===0 ? 1 : 6);
                    colors.push(j===2 ? 2 : 6);
                    colors.push(j===0 ? 3 : 6);
                    colors.push(k===2 ? 4 : 6);
                    colors.push(k===0 ? 5 : 6);
                    let cube = new Cube(colors);
                    cube.ThreeCube.position.x += i+start;
                    cube.ThreeCube.position.y += j+start;
                    cube.ThreeCube.position.z += k+start;
                    this.RubiksCube.add(cube.ThreeCube);
                    this.cubes.push(cube);
                }
            }
        }
    }

    createPivotPoints() {
        let pivotPoints = [];
        let pivotPoint;
        const dis = (Game.RubiksSize-2)/2+0.5;
        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = dis;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = 0;
        pivotPoints.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = -dis;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = 0;
        pivotPoints.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = dis;
        pivotPoint.position.z = 0;
        pivotPoints.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = -dis;
        pivotPoint.position.z = 0;
        pivotPoints.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = dis;
        pivotPoints.push(pivotPoint);

        pivotPoint = new THREE.Object3D();
        pivotPoint.position.x = 0;
        pivotPoint.position.y = 0;
        pivotPoint.position.z = -dis;
        pivotPoints.push(pivotPoint);

        for (let i = 0; i < pivotPoints.length; i++) {
            this.scene.add(pivotPoints[i]);
            this.faces[i].pivotPoint = pivotPoints[i];
        }
    }

    makeFaces() {
        let bigGroup = this.cubes;
        let face;
        face = new Face(0);
        face.group = bigGroup.slice(18);
        this.faces.push(face);

        face = new Face(1);
        face.group = bigGroup.slice(0, 9);
        this.faces.push(face);

        face = new Face(2);
        face.addToGroup(bigGroup.slice(-3).reverse());
        face.addToGroup(bigGroup.slice(15, 18).reverse());
        face.addToGroup(bigGroup.slice(6, 9).reverse());
        this.faces.push(face);

        face = new Face(3);
        face.addToGroup(bigGroup.slice(0, 3).reverse());
        face.addToGroup(bigGroup.slice(9, 12).reverse());
        face.addToGroup(bigGroup.slice(18, 21).reverse());
        this.faces.push(face);

        face = new Face(4);
        for (let i = 0; i < 3; i++) {
            face.addToGroup(bigGroup[2+i*9]);
        }
        for (let i = 0; i < 3; i++) {
            face.addToGroup(bigGroup[5+i*9]);
        }
        for (let i = 0; i < 3; i++) {
            face.addToGroup(bigGroup[8+i*9]);
        }
        this.faces.push(face);

        face = new Face(5);
        for (let i = 2; i >= 0; i--) {
            face.addToGroup(bigGroup[i*9]);
        }
        for (let i = 2; i >= 0; i--) {
            face.addToGroup(bigGroup[3+i*9]);
        }
        for (let i = 2; i >= 0; i--) {
            face.addToGroup(bigGroup[6+i*9]);
        }
        this.faces.push(face);
    }

    refreshFaces() {
        for (let i = 0; i < this.faces.length; i++) {
            this.faces[i].group = [];
        }
        const faceConditions= [
            ["x", 1],
            ["x", -1],
            ["y", 1],
            ["y", -1],
            ["z", 1],
            ["z", -1],
        ];
        for (let i = 0; i < this.cubes.length; i++) {
            let cubePos = this.cubes[i].ThreeCube.position;
            for (let j = 0; j < 6; j++) {
                if (cubePos[faceConditions[j][0]] === faceConditions[j][1]) {
                    this.faces[j].addToGroup(this.cubes[i]);
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
            for (let j = 0; j < 9; j++) {
                this.map.domMaps[i][j] = face.group[j].colors[face.axe];
            }
        }
        this.map.fillMapsDom();
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

    move(faceId, clockwise) {
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
                game.faces[move.faceId].correctCubesPositions();
                game.faces[move.faceId].correctCubesColorsAxis();
                this.refreshFaces();
                this.refreshMaps();
                this.movesHistory.push(move);
                this.movesToMake.shift();
            }
            else{
                this.tmpMoveProgress++;
                if (this.tmpMaxMoveProgress === this.tmpMoveProgress) {
                    game.faces[move.faceId].turn(move, this.tmpRestProgress);
                }
                else {
                    game.faces[move.faceId].turn(move);
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
            speed: 2,
        }
    }

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