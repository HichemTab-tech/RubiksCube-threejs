import {copyList} from "./utils";
/** @typedef {{faceId: number, clockwise: boolean}} Move */
/**
 * @typedef {{
 * OnSolvingStart: () => void,
 * OnSolvingEnd: () => void,
 * OnSolvingSuccess: (solution: Move[]) => void,
 * OnSolvingFailed: (errors: any[]|false = false) => void,
 * }} GameListener
 */
/**
 * @typedef {{
 * OnSolvingStart: () => void,
 * OnSolvingSuccess: (solution: Move[]) => void,
 * OnSolvingFailed: (errors: any[]|false = false) => void,
 * }} BaseGameListener
 */
export default class BaseSolver {
    /** @type Move[] */
    moves;
    temp;
    baseFirstFaceId = 0;
    /** @type GameListener */
    _gameListener;
    /** @type BaseGameListener */
    _baseGameListener;
    game;



    constructor(game) {
        this.game = game;
        this._gameListener = {
            OnSolvingStart: () => {},
            OnSolvingEnd: () => {},
            OnSolvingSuccess: (_solution) => {},
            OnSolvingFailed: (_errors) => {},
        };
        this._baseGameListener = {
            OnSolvingStart: () => this._gameListener.OnSolvingStart(),
            OnSolvingSuccess: (_solution) => {
                this._gameListener.OnSolvingSuccess(_solution);
                this._gameListener.OnSolvingEnd();
            },
            OnSolvingFailed: (_errors) => {
                this._gameListener.OnSolvingFailed(_errors);
                this._gameListener.OnSolvingEnd();
                throw "Error";
            },
        };
    }

    get baseGameListener() {
        return this._baseGameListener;
    }

    /** @type GameListener */
    get gameListener() {
        return this._gameListener;
    }

    set gameListener(value) {
        this._gameListener = value;
    }

    solve() {
        this.moves = [];
        this.temp = copyList(game.map.maps);
    }

    //data
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
    };
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
    };
    static cubeSides = ["t", "r", "b", "l"];

    /**
     * @param start
     * @param rows
     * @returns {number[][]}
     */
    static create2DArray(start, rows) {
        return Array.from({length: rows}, (_, i) =>
            Array.from({length: rows}, (_, j) => start + i * rows + j)
        );
    }

    /**
     * @param faceId
     * @returns {number[]|*[]}
     */
    static getCycle(faceId) {
        let cycle;
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
                return [];

        }
        return cycle;
    }

    /**
     * @param side
     * @returns {string}
     */
    static getOppositeSide(side) {
        const sides = BaseSolver.cubeSides;
        return sides[(sides.indexOf(side)+2)%4];
    }

    /** @param {number} oldFaceId
     * @param {number|false} newFaceId */
    static getRelation(oldFaceId, newFaceId = false) {
        if (newFaceId === false) {
            let keys = Object.keys(BaseSolver.relations);
            return keys.filter(k => k.split("").includes(oldFaceId.toString())).map(k => {
                let relation = BaseSolver.relations[k];
                if (k.split("")[0] !== oldFaceId.toString()) {
                    relation = relation.split("").reverse().join("");
                    k = k.split("").reverse().join("");
                }
                return {
                    key:k,
                    relation: relation
                };
            });
        }
        let keys = Object.keys(BaseSolver.relations);
        let key1 = oldFaceId.toString() + "-" + newFaceId.toString();
        let key2 = newFaceId.toString() + "-" + oldFaceId.toString();
        let key = keys.find(k => k===key1 || k===key2);
        let relation = BaseSolver.relations[key];
        if (key===key2) {
            relation = relation.split("").reverse().join("");
        }
        return relation;
    }

    /**
     * @param faceId
     * @param side
     * @returns {number}
     */
    static getFaceNeighborBySide(faceId, side) {
        let relations = BaseSolver.getRelation(faceId);
        let relation = relations.find((r) => r.relation[0] === side);
        return parseInt(relation.key[2]);
    }

    static getTransformationInOneFace(side1, side2) {
        let keys = Object.keys(BaseSolver.transformationsInOneFace);
        let key1 = side1 + side2;
        let key2 = side2 + side1;
        let key = keys.find(k => k===key1 || k===key2);
        return BaseSolver.transformationsInOneFace[key];
    }

    static getOppositeFace(faceId) {
        if (faceId%2===0) return faceId+1;
        return faceId-1;
    }

    static optimizeMoves(moves) {
        let list = copyList(moves);

        let part1Result = [];
        for (let i = 0; i < list.length; i++) {
            const currentItem = list[i];
            const prevItem = part1Result[part1Result.length - 1];

            if (prevItem && currentItem.faceId === prevItem.faceId && currentItem.clockwise !== prevItem.clockwise) {
                // Opposite direction, remove the previous element
                part1Result.pop();
            } else {
                // Either no previous item or not opposite direction, keep the current item
                part1Result.push(currentItem);
            }
        }
        list = part1Result;


        let part2Result = [];
        for (let i = 0; i < list.length; i++) {
            if (i < list.length - 2 &&
                list[i].faceId === list[i + 1].faceId &&
                list[i].faceId === list[i + 2].faceId &&
                list[i].clockwise === list[i + 1].clockwise &&
                list[i].clockwise === list[i + 2].clockwise) {
                part2Result.push({ faceId: list[i].faceId, clockwise: !list[i].clockwise });
                i += 2;
            } else {
                part2Result.push(list[i]);
            }
        }
        list = part2Result;

        let part3Result = [];
        for (let i = 0; i < list.length; i++) {
            if (i < list.length - 3 &&
                list[i].faceId === list[i + 1].faceId &&
                list[i].faceId === list[i + 2].faceId &&
                list[i].faceId === list[i + 3].faceId &&
                list[i].clockwise === list[i + 1].clockwise &&
                list[i].clockwise === list[i + 2].clockwise &&
                list[i].clockwise === list[i + 3].clockwise) {
                i += 3;
            } else {
                part3Result.push(list[i]);
            }
        }
        list = part3Result;
        return list;
    }
}