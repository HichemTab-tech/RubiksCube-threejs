import Game from "./game";
import * as THREE from "three";

export default class Cube {

    /** @var THREE.Group*/
    _ThreeCube

    #type;
    #relation;

    uuid;

    #colors = {
        x: 6,
        y: 6,
        z: 6,
    }
    parents = {
        x: 6,
        y: 6,
        z: 6,
    }
    transparentIds = {
        x: [],
        y: [],
        z: [],
    }

    resetParents() {
        this.parents = {
            x: 6,
            y: 6,
            z: 6,
        }
    }

    getParentOfTransparent(uuid) {
        let values = Object.values(this.transparentIds);
        let keys = Object.keys(this.transparentIds);
        let index = values.findIndex((v) => v.includes(uuid));
        return this.parents[keys[index]];
    }

    constructor(colors, centered = false) {
        this.init(colors, centered);
    }
    init(colors, centered) {
        let materials = [];
        let index = 6;
        if (colors.filter(color => color !== 6).length === 1) {
            index = colors.findIndex(color => color !== 6);
        }
        for (let l = 0; l < colors.length; l++) {
            if (colors[l]!==6) {
                if (l === 0 || l === 1) this.#colors.x = colors[l];
                if (l === 2 || l === 3) this.#colors.y = colors[l];
                if (l === 4 || l === 5) this.#colors.z = colors[l];
            }
            materials.push(new THREE.MeshLambertMaterial( {color: Game.allColors[colors[l]], map: new THREE.CanvasTexture(Game.generateCanvasFace(Game.allColors[colors[l]], (index === l && centered ? l : -1)))} ));
        }
        this._ThreeCube = new THREE.Group();
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        // noinspection JSCheckFunctionSignatures
        let cube = new THREE.Mesh(geometry, materials);
        this._ThreeCube.add(cube);
        this.uuid = this._ThreeCube.uuid;


        /**/
        // Define materials for transparent faces
        const transparentMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.0 });

        // Create transparent faces
        const transparentFaces = [];
        for (let i = 0; i < 6; i++) {
            const transparentGeometry = new THREE.PlaneGeometry(1.1, 1.1); // Use PlaneGeometry for flat faces
            const transparentMesh = new THREE.Mesh(transparentGeometry, transparentMaterial);
            transparentFaces.push(transparentMesh);
            this._ThreeCube.add(transparentMesh);
            let key;
            if (i<2) key = "x";
            else if (i<4) key = "y";
            else key = "z";
            this.transparentIds[key].push(transparentMesh.uuid);
        }

        // Position transparent faces relative to the cube
        // For each face, you may need to adjust its position, rotation, and scale to match the corresponding face of the cube

        const halfCubeSize = 0.5;
        // Front face (x = far)
        const far = halfCubeSize+0.01;
        transparentFaces[0].position.set(far, 0, 0);
        transparentFaces[0].rotation.y = Math.PI / 2;
        // Back face (x = -far)
        transparentFaces[1].position.set(-far, 0, 0);
        transparentFaces[1].rotation.y = -Math.PI / 2;
        // Top face (y = far)
        transparentFaces[2].position.set(0, far, 0);
        transparentFaces[2].rotation.x = -Math.PI / 2;
        // Bottom face (y = -far)
        transparentFaces[3].position.set(0, -far, 0);
        transparentFaces[3].rotation.x = Math.PI / 2;
        // Right face (z = far)
        transparentFaces[4].position.set(0, 0, far);
        transparentFaces[4].rotation.y = 0;
        // Left face (z = -far)
        transparentFaces[5].position.set(0, 0, -far);
        transparentFaces[5].rotation.y = Math.PI;



        let colorsWithoutDefault = Object.values(this.#colors).filter(color => color !== 6);
        let n = colorsWithoutDefault.length;
        switch (n) {
            case 1:
            default:
                this.#type = "F1";
                break;
            case 2:
                this.#type = "F2";
                break;
            case 3:
                this.#type = "F3";
                break;
        }
        this.#relation = colorsWithoutDefault.reduce((a, b) => a.toString() + b.toString(), "");
    }

    get type() {
        return this.#type;
    }

    get relation() {
        return this.#relation;
    }

    correctPosition() {
        let pos = this.ThreeCube.position;
        let x = Math.round(pos.x);
        let y = Math.round(pos.y);
        let z = Math.round(pos.z);
        this.ThreeCube.position.set(x, y, z);

        let rotation = this.ThreeCube.rotation;
        let rx = Cube.closestAngle(rotation.x);
        let ry = Cube.closestAngle(rotation.y);
        let rz = Cube.closestAngle(rotation.z);
        this.ThreeCube.rotation.set(rx, ry, rz);
    }

    get colors() {
        return this.#colors;
    }

    set colors(value) {
        this.#colors = value;
    }

    /** @var THREE.Group*/
    get ThreeCube() {
        return this._ThreeCube;
    }

    static closestAngle(a) {
        const angles = [
            -Math.PI * 2,
            -Math.PI * 3 / 2,
            -Math.PI,
            -Math.PI / 2,
            0,
            Math.PI / 2,
            Math.PI,
            Math.PI * 3 / 2,
            Math.PI * 2,
        ];

        return angles.reduce((prev, curr) =>
            Math.abs(curr - a) < Math.abs(prev - a) ? curr : prev
        );
    }
}