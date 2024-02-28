import Game from "./game";

export default class Face {
    faceId
    #axe
    /** @type Cube[] */
    _group = []
    #pivotPoint;


    constructor(faceId) {
        this.faceId = faceId;
        this.#init();
    }

    #init() {
        if (this.faceId===0||this.faceId===1||this.faceId.toString().startsWith("10")) this.#axe="x";
        if (this.faceId===2||this.faceId===3||this.faceId.toString().startsWith("12")) this.#axe="y";
        if (this.faceId===4||this.faceId===5||this.faceId.toString().startsWith("14")) this.#axe="z";
    }

    get pivotPoint() {
        return this.#pivotPoint;
    }

    set pivotPoint(value) {
        this.#pivotPoint = value;
    }

    get axe() {
        return this.#axe;
    }

    set group(value) {
        this._group = value;
    }

    get group() {
        return this._group;
    }

    addToGroup(added) {
        if (Array.isArray(added)) {
            this._group.push(...added);
        }
        else {
            this._group.push(added);
        }
    }

    correctCubesPositions() {
        for (let i = 0; i < this._group.length; i++) {
            let cube = this._group[i];
            cube.correctPosition();
        }
    }

    reorderCubes() {
        let cubes = this._group;
        let coefs;
        let fakeFaceId = this.faceId;
        if (this.faceId > 5) {
            if (this.faceId.toString().startsWith("100")) {
                fakeFaceId = 0;
            }
            else if (this.faceId.toString().startsWith("120")) {
                fakeFaceId = 2;
            }
            else if (this.faceId.toString().startsWith("140")) {
                fakeFaceId = 4;
            }
        }
        switch (fakeFaceId) {
            case 0:
                coefs = [0, 1, -1];
                break;
            case 1:
                coefs = [0, 1, 1];
                break;
            case 2:
                coefs = [-1, 0, -1];
                break;
            case 3:
                coefs = [1, 0, -1];
                break;
            case 4:
                coefs = [1, 1, 0];
                break;
            case 5:
                coefs = [-1, 1, 0];
                break;
            default:
                coefs = [0, 0, 0];
                break;
        }

        cubes.sort(function (a, b) {
            let aPos = a.ThreeCube.position;
            let bPos = b.ThreeCube.position;
            if (coefs[1] !== 0 && aPos.y !== bPos.y) return coefs[1] * (aPos.y - bPos.y);
            if (coefs[0] !== 0 && aPos.x !== bPos.x) return coefs[0] * (aPos.x - bPos.x);
            return coefs[2] * (aPos.z - bPos.z);
        });
        this._group = cubes;
    }

    turn(move, forcedStep = null) {
        let pivotPoint = this.pivotPoint;
        let axis = new THREE.Vector3();
        axis[this.axe] = 1;
        let step = forcedStep === null ? Game.speeds[move.speed] : forcedStep;
        let theta = move.clockwise ? -step : step;
        if ([1,3,5].includes(this.faceId)) theta = -1*theta;
        for (let i = 0; i < this._group.length; i++) {
            let cube = this._group[i];
            Face.rotateAboutPoint(cube.ThreeCube, pivotPoint.position, axis, theta, false);
        }
    }

    correctCubesColorsAxis() {
        let staticColorAxis = this.axe;
        let keys = ["x", "y", "z"].filter(key => key !== staticColorAxis);
        let newKeys = [...keys].reverse();
        for (let i = 0; i < this._group.length; i++) {
            let cube = this._group[i];
            let colors = {...cube.colors};
            colors[keys[0]] = cube.colors[newKeys[0]];
            colors[keys[1]] = cube.colors[newKeys[1]];
            cube.colors = colors;
            let transparentIds = {...cube.transparentIds};
            transparentIds[keys[0]] = cube.transparentIds[newKeys[0]];
            transparentIds[keys[1]] = cube.transparentIds[newKeys[1]];
            cube.transparentIds = transparentIds;
        }
    }

    static rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
        // rotate object around axis in world space (the axis passes through point)
        // axis is assumed to be normalized
        // assumes object does not have a rotated parent

        let q = new THREE.Quaternion();

        q.setFromAxisAngle( axis, theta );

        obj.applyQuaternion( q );

        obj.position.sub( point );
        obj.position.applyQuaternion( q );
        obj.position.add( point );
    }

    searchForCorrectCubeInFace(color) {
        for (let i = 0; i < this.group.length; i++) {
            if (this.group[i].colors[this.axe] === color) {
                return this.group[i];
            }
        }
        return null;
    }

    /** @type Face */
    static searchForFaceOfCube(faces, cube, faceToIgnore = -1) {
        for (let i = 0; i < faces.length; i++) {
            if (faces[i].group.includes(cube) && i !== faceToIgnore) {
                return faces[i];
            }
        }
        return null;
    }
}