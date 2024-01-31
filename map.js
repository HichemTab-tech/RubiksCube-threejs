import {copyList} from './utils';
import Game from "./game";
export default class Map {
    mapParentHtmlElement;
    #domMaps = [];
    #maps = [];

    /*map manipulation*/
    static relations = {
        "0-2": "tb",
        "0-5": "rl",
        "0-3": "bt",
        "0-4": "lr",
        "1-2": "tt",
        "1-5": "lr",
        "1-3": "bb",
        "1-4": "rl",
        "2-5": "rt",
        "2-4": "lt",
        "3-5": "rb",
        "3-4": "lb",
    }
    static transformations = {
        "tb": [
            (arr) => arr,
            (arr) => arr
        ],
        "rl": [
            (arr) => arr,
            (arr) => arr
        ],
        "tt": [
            "bb0",
            "bb0"
        ],
        "bb": [
            (arr) => copyList(arr).reverse().map(row => row.reverse()),
            "bb0"
        ],
        "rt": [
            (arr) => arr[0].map((_, i) => arr.map(row => row[i])).map(row => copyList(row).reverse()),
            (arr) => arr[0].map((_, i) => arr.map(row => copyList(row).reverse()[i]))
        ],
        "lt": [
            "rt1",
            "rt0"
        ],
        "rb": [
            "rt1",
            "rt0"
        ],
        "lb": [
            "rt0",
            "rt1"
        ]
    };
    static transformationsInOneFace = {
        "tr": (arr) => copyList(arr).reverse(),
        "rb": (arr) => arr,
        "bl": (arr) => copyList(arr).reverse(),
        "lt": (arr) => arr
    }

    constructor(mapParentHtmlElement) {
        this.mapParentHtmlElement = mapParentHtmlElement;
        this.init();
    }

    init() {
        this.makeMapsDom();
    }

    get maps() {
        return this.#maps;
    }

    set maps(value) {
        this.#maps = value;
    }

    get domMaps() {
        return this.#domMaps;
    }

    set domMaps(value) {
        this.#domMaps = value;
    }

    makeMapsDom() {
        this.mapParentHtmlElement.innerHTML = "";
        const numbers = [2,4,0,5,1,3];
        for (let i = 0; i < 6; i++) {
            let divMap = $('<div>').addClass('map').attr('data-map', numbers[i]);
            this.#domMaps.push([]);
            for (let j = 0; j < 9; j+=3) {
                for (let k = 0; k < 3; k++) {
                    let divTexture = $('<div>').addClass('one-2d-texture').attr('data-order', 6-j+k);
                    divMap.append(divTexture);
                    this.#domMaps[i].push(-1);
                }
            }
            let span = $('<span>').addClass('map-name').text(numbers[i]);
            let spanParent = $('<div>').addClass('map-name-parent').append(span);
            let divParent = $('<div>').addClass('one-map-parent').append(divMap).append(spanParent);
            this.mapParentHtmlElement.append(divParent);
        }
    }

    fillMapsDom() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 9; j++) {
                this.mapParentHtmlElement.find('.map[data-map="'+i+'"] .one-2d-texture[data-order="'+j+'"]').attr('data-color-index', this.#domMaps[i][j]);
            }
        }
    }

    /*map manipulation*/
    move(faceId, clockwise) {
        let cycle;
        const selfFaceCycle = ["t","r","b","l"];
        switch (faceId) {
            case 0:
                cycle = [2, 5, 3, 4];
                break;
            case 1:
                cycle = [2, 4, 3, 5];
                break;
            case 2:
                cycle = [1, 5, 0, 4];
                break;
            case 3:
                cycle = [1, 4, 0, 5];
                break;
            case 4:
                cycle = [2, 0, 3, 1];
                break;
            case 5:
                cycle = [2, 1, 3, 0];
                break;
            default:
                return;

        }

        let temp = copyList(this.maps);
        if (!clockwise) {
            cycle.reverse();
            selfFaceCycle.reverse();
        }
        for (let i = 0; i < 4; i++) {
            let road = this.getIndexesRoad(faceId, cycle[i], cycle[(i+1)%4]);
            //console.log(cycle[i], cycle[(i+1)%4], road);
            for (let j = 0; j < road.from.length; j++) {
                temp[cycle[(i+1)%4]][road.to[j]] = this.maps[cycle[i]][road.from[j]];
            }
        }
        for (let i = 0; i < 4; i++) {
            let indexes = this.getIndexBySide(selfFaceCycle[i]);
            let indexes2 = this.getIndexBySide(selfFaceCycle[(i+1)%4]);
            let transformation = this.getTransformationInOneFace(selfFaceCycle[i], selfFaceCycle[(i+1)%4]);
            let road = {
                from: indexes,
                to: transformation(indexes2)
            };
            console.log(selfFaceCycle[i], selfFaceCycle[(i+1)%4], road);
            for (let j = 0; j < road.from.length; j++) {
                temp[faceId][road.to[j]] = this.maps[faceId][road.from[j]];
            }
        }

        this.maps = temp;
    }

    getIndexesRoad(faceId, oldFaceId, newFaceId) {
        let relationRef = this.getRelation(faceId, oldFaceId);
        let relation = this.getRelation(oldFaceId, newFaceId);
        let transformation = this.getTransformation(relation[0], relation[1]);
        let indexes = this.getIndexBySide(relationRef[1]);
        return {
            from: indexes,
            to: transformation(indexes)
        }
    }

    getIndexBySide(side) {
        switch (side) {
            case "t":
                return [6, 7, 8];
            case "b":
                return [0, 1, 2];
            case "r":
                return [2, 5, 8];
            case "l":
                return [0, 3, 6];
            default:
                return [];
        }
    }

    getRelation(oldFaceId, newFaceId) {
        let keys = Object.keys(Map.relations);
        let key1 = oldFaceId + "-" + newFaceId;
        let key2 = newFaceId + "-" + oldFaceId;
        let key = keys.find(k => k===key1 || k===key2);
        let relation = Map.relations[key];
        if (key===key2) {
            relation = relation.split("").reverse().join("");
        }
        return relation;
    }

    getTransformation(side1, side2) {
        let keys = Object.keys(Map.transformations);
        let key1 = side1 + side2;
        let key2 = side2 + side1;
        let key = keys.find(k => k===key1 || k===key2);
        let transformation = Map.transformations[key];
        if (key === key2) {
            transformation = transformation[1];
        }
        else{
            transformation = transformation[0];
        }
        if (typeof transformation === "string") {
            transformation = Map.transformations[transformation.substring(0, 2)][transformation.substring(2)];
        }
        return (indexes) => {
            let from = this.create2DArray(0, Game.RubiksSize);
            let to = copyList(from);
            to = transformation(to);
            //console.table(to);
            to = to.flat();
            //console.table(to);
            from = from.flat();
            let newIndexes = [];
            for (let i = 0; i < indexes.length; i++) {
                newIndexes.push(to[from.indexOf(indexes[i])]);
            }
            return newIndexes;
        };
    }

    getTransformationInOneFace(side1, side2) {
        let keys = Object.keys(Map.transformationsInOneFace);
        let key1 = side1 + side2;
        let key2 = side2 + side1;
        let key = keys.find(k => k===key1 || k===key2);
        return Map.transformationsInOneFace[key];
    }

    create2DArray(start, rows) {
        return Array.from({length: rows}, (_, i) =>
            Array.from({length: rows}, (_, j) => start + i * rows + j)
        );
    }
}