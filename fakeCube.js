/**
 * @typedef {Object} FakeCubeFace
 * @property {number} color - The color of the object.
 * @property {number} positionInFace - The position of the object in face.
 * @property {number} parentFaceId - The ID of the parent face of the object.
 */
export default class FakeCube {
    /** @type FakeCubeFace[] */
    faces = [];

    constructor(faces) {
        this.faces = faces;
    }

    /** @type FakeCubeFace */
    getFace(color) {
        return this.faces.find(face => face.color === color);
    }

    /** @type FakeCubeFace */
    getFaceByParentFaceId(parentFaceId) {
        return this.faces.find(face => face.parentFaceId === parentFaceId);
    }

    getColors() {
        return this.faces.map(face => face.color);
    }

    /** @type FakeCubeFace */
    getOtherFace(color) {
        return this.faces.find(face => face.color !== color);
    }
}