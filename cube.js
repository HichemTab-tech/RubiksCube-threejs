import Game from "./game";
import * as THREE from "three";

export default class Cube {

    /** @var THREE.Group*/
    _ThreeCube

    #type;
    #relation;

    #colors = {
        x: 6,
        y: 6,
        z: 6,
    }
    constructor(colors) {
        this.init(colors);
    }
    init(colors) {
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
            materials.push(new THREE.MeshLambertMaterial( {color: Game.allColors[colors[l]], map: new THREE.CanvasTexture(Game.generateCanvasFace(Game.allColors[colors[l]], (index === l ? l : -1)))} ));
        }
        this._ThreeCube = new THREE.Group();
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        // noinspection JSCheckFunctionSignatures
        let cube = new THREE.Mesh(geometry, materials);
        this._ThreeCube.add(cube);
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