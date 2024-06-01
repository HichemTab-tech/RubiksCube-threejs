// noinspection JSUnusedAssignment

import FakeCube from "../fakeCube";
import {initialMoves} from './t';

const size = 3;
const baseFirstFaceId = 3;
const numbers = [2,4,0,5,1,3];
let maps = numbers.map(() => []);
const tracked = ["2F-03", "2F-14"];
const mapParentHtmlElement = $(".map-parent");
function createMap() {
    mapParentHtmlElement.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        let divMap = $('<div>').addClass('map').attr('data-map', numbers[i]);
        let str = Array(size).fill('auto').join(" ");
        divMap.css({
            'grid-template-rows': str,
            'grid-template-columns': str
        });
        for (let j = 0; j < Math.pow(size, 2); j+=size) {
            for (let k = 0; k < size; k++) {
                let divTexture = $('<div>').addClass('one-2d-texture').attr('data-order', size*2-j+k);
                divMap.append(divTexture);
                maps[numbers[i]].push(numbers[i]);
            }
        }
        let span = $('<span>').addClass('map-name').text(numbers[i]);
        let spanParent = $('<div>').addClass('map-name-parent').append(span);
        let divParent = $('<div>').addClass('one-map-parent').append(divMap).append(spanParent);
        mapParentHtmlElement.append(divParent);
    }
}

function createCommands() {
    // noinspection DuplicatedCode
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
    $('.command-btn').click(function() {
        let faceId = $(this).attr('data-color-index');
        let clockwise = $(this).attr('data-clockwise')==="1";
        maps = move(maps, parseInt(faceId), clockwise);
        refreshMaps(maps);
    });
}

function fillMaps(map_) {
    $('.tracked').removeClass('tracked');
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < Math.pow(size, 2); j++) {
            mapParentHtmlElement.find('.map[data-map="'+i+'"] .one-2d-texture[data-order="'+j+'"]').attr('data-color-index', map_[i][j]);
        }
    }
    outer:
    for (let i = 0; i < tracked.length; i++) {
        let faceId = parseInt(tracked[i][3]);
        let isEdge = tracked[i][0]==="2";
        let list = isEdge ? edges : diagonals;
        for (let j = 0; j < list.length; j++) {
            let elements = mapParentHtmlElement.find('.map .one-2d-texture[data-order="'+list[j]+'"][data-color-index="'+faceId+'"]');
            if (elements.length === 0) continue;
            for (let k = 0; k < elements.length; k++) {
                let element = $(elements[k]);
                let parentFace = $(element).parent('.map').attr('data-map');
                let faceRelations = getRelation(parentFace);
                for (let l = 0; l < faceRelations.length; l++) {
                    let faceRelation = faceRelations[l];
                    let indexes1 = getIndexBySide(faceRelation.relation[0]);
                    let indexes2 = getIndexBySide(faceRelation.relation[1]);
                    if (!indexes1.includes(list[j])) continue;
                    let index = indexes1.indexOf(list[j]);
                    let indexInFace = indexes2[index];
                    let testElement = mapParentHtmlElement.find('.map[data-map="'+faceRelation.key[2]+'"] .one-2d-texture[data-order="'+indexInFace+'"]');
                    if (testElement.length === 0) continue;
                    let colorIndex = testElement.attr('data-color-index');
                    if (colorIndex === tracked[i][4]) {
                        element.addClass('tracked');
                        testElement.addClass('tracked');
                        continue outer;
                    }
                }
            }
        }
    }
}

function refreshMaps(map_) {
    //
    fillMaps(map_);
}

const relations = {
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
const transformations = {
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
const transformationsInOneFace = {
    "tr": (arr) => copyList(arr).reverse(),
    "rb": (arr) => arr,
    "bl": (arr) => copyList(arr).reverse(),
    "lt": (arr) => arr
};
const diagonals = [0, 6, 8, 2];
const edges = [1, 3, 7, 5];
const cubeSides = ["t", "r", "b", "l"];

function moveByList(list) {
    for (let i = 0; i < list.length; i++) {
        maps = move(maps, list[i].faceId, list[i].clockwise);
    }
    refreshMaps(maps);
}
window.moveByList = moveByList;
function getCycle(faceId) {
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
function move(map_ = false, faceId, clockwise = false) {
    if (map_===false) map_ = maps;
    if (Array.isArray(faceId)) {
        for (let i = 0; i < faceId.length; i++) {
            map_ = move(map_, faceId[i].faceId, faceId[i].clockwise);
        }
        return map_;
    }
    let cycle = getCycle(faceId);
    let selfFaceCycle = [...cubeSides];

    let temp = copyList(map_);
    if (!clockwise) {
        cycle.reverse();
        selfFaceCycle.reverse();
    }
    for (let i = 0; i < 4; i++) {
        let road = getIndexesRoad(faceId, cycle[i], cycle[(i+1)%4]);
        //console.log(cycle[i], cycle[(i+1)%4], road);
        for (let j = 0; j < road.from.length; j++) {
            temp[cycle[(i+1)%4]][road.to[j]] = map_[cycle[i]][road.from[j]];
        }
    }
    for (let i = 0; i < 4; i++) {
        let indexes = getIndexBySide(selfFaceCycle[i]);
        let indexes2 = getIndexBySide(selfFaceCycle[(i+1)%4]);
        let transformation = getTransformationInOneFace(selfFaceCycle[i], selfFaceCycle[(i+1)%4]);
        let road = {
            from: indexes,
            to: transformation(indexes2)
        };
        //console.log(selfFaceCycle[i], selfFaceCycle[(i+1)%4], road);
        for (let j = 0; j < road.from.length; j++) {
            temp[faceId][road.to[j]] = map_[faceId][road.from[j]];
        }
    }

    map_ = temp;
    return map_;
}

function getIndexesRoad(faceId, oldFaceId, newFaceId) {
    let relationRef = getRelation(faceId, oldFaceId);
    let relation = getRelation(oldFaceId, newFaceId);
    let transformation = getTransformation(relation[0], relation[1]);
    let indexes = getIndexBySide(relationRef[1]);
    return {
        from: indexes,
        to: transformation(indexes)
    }
}

function getIndexBySide(side) {
    if (Array.isArray(side)) {
        let indexes = side.map((s) => getIndexBySide(s));
        return indexes[0].filter((i) => indexes[1].includes(i))[0];
    }
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

function getSideByIndex(index) {
    let sides = [];
    if ([6, 7, 8].includes(index)) {
        sides.push('t');
    }
    if ([0, 1, 2].includes(index)) {
        sides.push('b');
    }
    if ([2, 5, 8].includes(index)) {
        sides.push('r');
    }
    if ([0, 3, 6].includes(index)) {
        sides.push('l');
    }
    if (sides.length===0) console.error(index);
    return sides.length === 1 ? sides[0] : sides;
}

function getOppositeSide(side) {
    const sides = cubeSides;
    return sides[(sides.indexOf(side)+2)%4];
}

function isColorsFitCubeIndex(colorsLength, index) {
    return (edges.includes(index) && colorsLength === 2) || (diagonals.includes(index) && colorsLength === 3);
}

/** @param {number} oldFaceId
 * @param {number|false} newFaceId */
function getRelation(oldFaceId, newFaceId = false) {
    if (newFaceId === false) {
        let keys = Object.keys(relations);
        return keys.filter(k => k.split("").includes(oldFaceId.toString())).map(k => {
            let relation = relations[k];
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
    let keys = Object.keys(relations);
    let key1 = oldFaceId.toString() + "-" + newFaceId.toString();
    let key2 = newFaceId.toString() + "-" + oldFaceId.toString();
    let key = keys.find(k => k===key1 || k===key2);
    let relation = relations[key];
    if (key===key2) {
        relation = relation.split("").reverse().join("");
    }
    return relation;
}

function getFaceNeighborBySide(faceId, side) {
    let relations = getRelation(faceId);
    let relation = relations.find((r) => r.relation[0] === side);
    return parseInt(relation.key[2]);
}

function getTransformation(side1, side2) {
    let keys = Object.keys(transformations);
    let key1 = side1 + side2;
    let key2 = side2 + side1;
    let key = keys.find(k => k===key1 || k===key2);
    let transformation = transformations[key];
    if (key === key2) {
        transformation = transformation[1];
    }
    else{
        transformation = transformation[0];
    }
    if (typeof transformation === "string") {
        transformation = transformations[transformation.substring(0, 2)][transformation.substring(2)];
    }
    return (indexes) => {
        let from = create2DArray(0, size);
        let to = copyList(from);
        to = transformation(to);
        //console.table(to);
        to = to.flat();
        //console.table(to);
        from = from.flat();
        let newIndexes = [];
        if (typeof indexes === "number") indexes = [indexes];
        for (let i = 0; i < indexes.length; i++) {
            newIndexes.push(to[from.indexOf(indexes[i])]);
        }
        if (newIndexes.length === 1) return newIndexes[0];
        return newIndexes;
    };
}

function getTransformationInOneFace(side1, side2) {
    let keys = Object.keys(transformationsInOneFace);
    let key1 = side1 + side2;
    let key2 = side2 + side1;
    let key = keys.find(k => k===key1 || k===key2);
    return transformationsInOneFace[key];
}

createCommands();
createMap();
refreshMaps(maps);

function makeInitialMoves() {
    let initial = [...initialMoves/*, ...[
        {
            "faceId": 3,
            "clockwise": true
        },
        {
            "faceId": 2,
            "clockwise": false
        },
        {
            "faceId": 4,
            "clockwise": true
        },
        {
            "faceId": 3,
            "clockwise": false
        },
        {
            "faceId": 2,
            "clockwise": true
        },
        {
            "faceId": 1,
            "clockwise": false
        },
        {
            "faceId": 1,
            "clockwise": false
        },
        {
            "faceId": 3,
            "clockwise": true
        },
        {
            "faceId": 2,
            "clockwise": false
        },
        {
            "faceId": 4,
            "clockwise": true
        },
        {
            "faceId": 3,
            "clockwise": false
        },
        {
            "faceId": 2,
            "clockwise": true
        }
    ],
        ...[
            {
                "faceId": 3,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": true
            },
            {
                "faceId": 3,
                "clockwise": false
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 3,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 3,
                "clockwise": false
            },
        ],
        ...[
            {
                "faceId": 3,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": true
            },
            {
                "faceId": 3,
                "clockwise": false
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 3,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 3,
                "clockwise": false
            },
            {
                "faceId": 3,
                "clockwise": true
            },
            {
                "faceId": 2,
                "clockwise": false
            },
            {
                "faceId": 4,
                "clockwise": true
            },
            {
                "faceId": 3,
                "clockwise": false
            },
            {
                "faceId": 2,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 3,
                "clockwise": true
            },
            {
                "faceId": 2,
                "clockwise": false
            },
            {
                "faceId": 4,
                "clockwise": true
            },
            {
                "faceId": 3,
                "clockwise": false
            },
            {
                "faceId": 2,
                "clockwise": true
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 1,
                "clockwise": false
            },
            {
                "faceId": 1,
                "clockwise": false
            }
        ]*/];
    console.log(initial);
    for (let i = 0; i < initial.length; i++) {
        maps = move(maps, initial[i].faceId, initial[i].clockwise);
        refreshMaps(maps);
    }
}
window.makeInitialMoves = makeInitialMoves;
window.maps = () => maps;

function copyList(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function create2DArray(start, rows) {
    return Array.from({length: rows}, (_, i) =>
        Array.from({length: rows}, (_, j) => start + i * rows + j)
    );
}

/** @type FakeCube[] */
function getCubes(mapsList_, color, isEdge) {
    let cubes = [];
    if (isEdge) {
        for (let i = 0; i < edges.length; i++) {
            let cube = getCube(mapsList_, color, edges[i], false);
            if (cube !== null) {
                if (Array.isArray(cube)) cubes.push(...cube);
                else cubes.push(cube);
            }
        }
    }
    else{
        for (let i = 0; i < diagonals.length; i++) {
            let cube = getCube(mapsList_, color, diagonals[i], false);
            if (cube !== null) {
                if (Array.isArray(cube)) cubes.push(...cube);
                else cubes.push(cube);
            }
        }
    }
    return cubes;
}

function getCube(mapsList_, color, positionInFace, colorIsParentFace = false) {
    let mapsList = copyList(mapsList_);
    let parentFaceId = -1;
    if (colorIsParentFace) {
        parentFaceId = [color];
    }
    else{
        for (let i = 0; i < mapsList_.length; i++) {
            if (mapsList_[i][positionInFace]===color) {
                if (parentFaceId === -1) parentFaceId = [i];
                else parentFaceId.push(i);
            }
        }
    }
    if (parentFaceId === -1) return null;
    let cubes = [];
    for (let j = 0; j < parentFaceId.length; j++) {
        let sides = getSideByIndex(positionInFace);
        if (typeof sides === "string") sides = [sides];
        let cubeParts = [];
        for (let i = 0; i < sides.length; i++) {
            let side = sides[i];
            //if ()
            let relations = getRelation(parentFaceId[j]);
            let relation = relations.find((relation) => relation.relation[0]===side);
            let otherParentFaceId = parseInt(relation.key[2]);
            let index = getPositionInOtherFaceOfOneCube(positionInFace, parentFaceId[j], otherParentFaceId);
            cubeParts.push({
                color: mapsList[otherParentFaceId][index],
                positionInFace: index,
                parentFaceId: otherParentFaceId
            });
        }

        if (cubeParts.length === 0) {
            continue;
        }
        cubes.push(new FakeCube([
            {
                color: mapsList[parentFaceId[j]][positionInFace],
                positionInFace: positionInFace,
                parentFaceId: parseInt(parentFaceId[j])
            },
            ...cubeParts
        ]));
    }


    return cubes.length === 0 ? null : (cubes.length === 1 ? cubes[0] : cubes);
}
function getCubeByColors(mapsList_, colors) {
    let mapsList = copyList(mapsList_);
    let testColor = colors[0];
    for (let i = 0; i < mapsList.length; i++) {
        for (let j = 0; j < mapsList[i].length; j++) {
            if (mapsList[i][j] === testColor) {
                if (!isColorsFitCubeIndex(colors.length, j)) continue;
                let cube = getCube(mapsList, i, j, true);
                if (cube !== null) {
                    let cubeColors = cube.getColors();
                    if (cubeColors.every(color => colors.includes(color))) {
                        return cube;
                    }
                }
            }
        }
    }
}

window.getCube = getCube;
window.getCubes = getCubes;
window.relations = relations;

function solve() {
    /** @type {{faceId,clockwise: boolean}[]} */
    let moves = [];
    let temp = copyList(maps);
    let newMoves;
    [temp, newMoves] = solveEdgeOfFirstFace(temp);
    moves.push(...newMoves);
    [temp, newMoves] = solveDiagonalsOfFirstFace(temp);
    moves.push(...newMoves);
    [temp, newMoves] = solveEdgeOfSecondRow(temp);
    moves.push(...newMoves);
    [temp, newMoves] = solveEdgeOfLastFace(temp);
    moves.push(...newMoves);
    [temp, newMoves] = solveDiagonalsPositionOfLastFace(temp);
    moves.push(...newMoves);
    let x = copyList(moves);
    moves = optimizeMoves(moves);
    let y = copyList(moves);
    let array1 = x;
    let array2 = y;

    let maxLength = Math.max(array1.length, array2.length);

    let combinedArray = Array.from({length: maxLength}, (_, i) => ({
        column1: array1[i] !== undefined ? (array1[i].faceId+"-"+array1[i].clockwise) : null,
        column2: array2[i] !== undefined ? array2[i].faceId+"-"+array2[i].clockwise : null
    }));

    console.table(combinedArray);
    console.log(moves);
}

window.solve = solve;
window.move = move;

function solveEdgeOfFirstFace(temp) {
    let moves = [];
    let firstFaceId = baseFirstFaceId;
    let edgesCubes = getCubes(temp, firstFaceId, true);
    let cycle = getCycle(firstFaceId);
    let n = 0;
    while (!checkCubesInRightPlace(edgesCubes)) {
        console.log(edgesCubes);
        let cube = getFirstCubeNotRight(edgesCubes);
        let cubeFace = cube.getFace(firstFaceId);
        if (cycle.includes(cubeFace.parentFaceId)) {
            if (!cube.faces.every(face => cycle.includes(face.parentFaceId))) {
                let nextMoves = [];
                nextMoves.push({
                    faceId: cubeFace.parentFaceId,
                    clockwise: true
                });
                moves.push(...nextMoves);
                temp = move(temp, nextMoves);
                cube = getCubeByColors(temp, cube.getColors());
            }
            console.log(copyList(cube));
            let faceToTurn = cube.getOtherFace(firstFaceId);
            let relation = getRelation(firstFaceId, faceToTurn.parentFaceId);
            let indexes = getIndexBySide(relation[1]);
            let otherIndex = (edges.indexOf(indexes[1])+2)%4;
            let clockwise = edges[(otherIndex+1)%4] !== faceToTurn.positionInFace;
            let nextMoves = [];
            nextMoves.push({
                faceId: faceToTurn.parentFaceId,
                clockwise: clockwise
            });
            let oppositeFace = getOppositeFace(firstFaceId);
            nextMoves.push({
                faceId: oppositeFace,
                clockwise: true
            });
            nextMoves.push({
                faceId: faceToTurn.parentFaceId,
                clockwise: !clockwise
            });
            moves.push(...nextMoves);
            temp = move(temp, nextMoves);
            cube = getCubeByColors(temp, cube.getColors());
            [temp, moves] = cubeIsInOppositeFace(cube, firstFaceId, moves, temp);
        }
        else{
            if (cubeFace.parentFaceId === cubeFace.color){
                let nextMoves = turn2times(cube.getOtherFace(cubeFace.color).parentFaceId);
                moves.push(...nextMoves);
                temp = move(temp, nextMoves);
            }
            cube = getCubeByColors(temp, cube.getColors());
            [temp, moves] = cubeIsInOppositeFace(cube, firstFaceId, moves, temp);
        }
        if (n === 20) break;
        n++;
        edgesCubes = getCubes(temp, firstFaceId, true);
        console.log("edgesCubes", edgesCubes);
    }
    console.log(temp);
    return [temp, moves];
}

function solveDiagonalsOfFirstFace(temp) {
    let moves = [];
    let firstFaceId = baseFirstFaceId;
    let diagonalsCubes = getCubes(temp, firstFaceId, false);
    console.log(diagonalsCubes);
    let oppositeFace = getOppositeFace(firstFaceId);
    let cycle = getCycle(firstFaceId);
    let n = 0;
    while (!checkCubesInRightPlace(diagonalsCubes)) {
        console.log(diagonalsCubes);
        let cube = getFirstCubeNotRight(diagonalsCubes);
        let cubeFace = cube.getFace(firstFaceId);
        if (cubeFace.parentFaceId === oppositeFace) {

            let indexInFirstFaceWhichCanBeUsed = temp[firstFaceId].findIndex((color) => color !== firstFaceId);
            let anyFaceFromCycle = cycle[0];
            let relation = getRelation(firstFaceId, anyFaceFromCycle);
            let relation2 = getRelation(anyFaceFromCycle, oppositeFace);
            let transformation = getTransformation(relation[0], relation[1]);
            let transformation2 = getTransformation(relation2[0], relation2[1]);
            let index0 = transformation(indexInFirstFaceWhichCanBeUsed);
            let index = transformation2(index0);


            let side2 = getOppositeSide(relation2[1]);
            let indexes2 = getIndexBySide(side2);
            let indexes = getIndexBySide(relation2[1]);

            let currentIndex = diagonals.indexOf(cubeFace.positionInFace);
            let targetIndex = diagonals.indexOf(indexes2[indexes.indexOf(index)]);
            let diff = targetIndex - currentIndex;
            let clockwise = diff > 0;
            if (diff<0) diff*=-1;
            if (diff===4) diff=0;
            let nextMoves = [];
            for (let i = 0; i < diff; i++) {
                nextMoves.push({
                    faceId: oppositeFace,
                    clockwise: clockwise
                });
            }
            if (nextMoves.length !== 0) {
                moves.push(...nextMoves);
                temp = move(temp, nextMoves);
                cube = getCubeByColors(temp, cube.getColors());
                cubeFace = cube.getFace(firstFaceId);
            }

            let otherSide = getOppositeSide(relation[1]);
            let indexes3 = getIndexBySide(otherSide);
            let clockwise3 = !indexes3.includes(diagonals[(diagonals.indexOf(index0)+1)%4]);
            nextMoves = {
                faceId: anyFaceFromCycle,
                clockwise: clockwise3
            };
            moves.push(nextMoves);
            temp = move(temp, [nextMoves]);

            nextMoves = turn2times(oppositeFace);
            moves.push(...nextMoves);
            temp = move(temp, nextMoves);

            nextMoves = {
                faceId: anyFaceFromCycle,
                clockwise: !clockwise3
            };
            moves.push(nextMoves);
            temp = move(temp, [nextMoves]);
            cube = getCubeByColors(temp, cube.getColors());
            cubeFace = cube.getFace(firstFaceId);
        }
        else if (cubeFace.parentFaceId === firstFaceId) {
            let face2 = cube.faces.find(face => face.color !== firstFaceId);
            let relation = getRelation(firstFaceId, face2.parentFaceId);
            let indexes = getIndexBySide(relation[1]);
            let clockwise = !indexes.includes(diagonals[(diagonals.indexOf(face2.positionInFace)+1)%4]);
            let nextMove;
            nextMove = {
                faceId: face2.parentFaceId,
                clockwise: clockwise
            };
            moves.push(nextMove);
            temp = move(temp, nextMove.faceId, nextMove.clockwise);
            cube = getCubeByColors(temp, cube.getColors());
            nextMove = {
                faceId: oppositeFace,
                clockwise: true
            };
            moves.push(nextMove);
            temp = move(temp, nextMove.faceId, nextMove.clockwise);
            cube = getCubeByColors(temp, cube.getColors());
            nextMove = {
                faceId: face2.parentFaceId,
                clockwise: !clockwise
            };
            moves.push(nextMove);
            temp = move(temp, nextMove.faceId, nextMove.clockwise);
            cube = getCubeByColors(temp, cube.getColors());
        }
        if (cycle.includes(cubeFace.parentFaceId)) {
            if (cube.faces.some(face => face.parentFaceId === firstFaceId)) {
                let face2 = cube.faces.find(face => face.parentFaceId !== firstFaceId && face.color !== firstFaceId);
                let relation = getRelation(firstFaceId, face2.parentFaceId);
                let indexes = getIndexBySide(relation[1]);
                let clockwise = !indexes.includes(diagonals[(diagonals.indexOf(face2.positionInFace)+1)%4]);
                let nextMove;
                nextMove = {
                    faceId: face2.parentFaceId,
                    clockwise: clockwise
                };
                moves.push(nextMove);
                temp = move(temp, nextMove.faceId, nextMove.clockwise);
                cube = getCubeByColors(temp, cube.getColors());

                let lastPositionInOppositeFace = cube.getFaceByParentFaceId(oppositeFace).positionInFace;
                relation = getRelation(cubeFace.parentFaceId, oppositeFace);
                indexes = getIndexBySide(relation[1]);
                let clockwise2 = !indexes.includes(diagonals[(diagonals.indexOf(lastPositionInOppositeFace)+1)%4]);
                nextMove = {
                    faceId: oppositeFace,
                    clockwise: clockwise2
                };
                moves.push(nextMove);
                temp = move(temp, nextMove.faceId, nextMove.clockwise);
                cube = getCubeByColors(temp, cube.getColors());

                nextMove = {
                    faceId: face2.parentFaceId,
                    clockwise: !clockwise
                };
                moves.push(nextMove);
                temp = move(temp, nextMove.faceId, nextMove.clockwise);
                cube = getCubeByColors(temp, cube.getColors());
                cubeFace = cube.getFace(firstFaceId);
            }
            if (cube.faces.some(face => face.parentFaceId === oppositeFace)) {
                let face2 = cube.faces.find(face => face.parentFaceId !== oppositeFace && face.color !== firstFaceId);
                if (face2.parentFaceId !== face2.color) {
                    let nextMoves = turnFaceUtilOtherFaceMatch(cube, cube.getFaceByParentFaceId(oppositeFace).color, face2);
                    if (nextMoves.length !== 0) {
                        moves.push(...nextMoves);
                        temp = move(temp, nextMoves);
                        cube = getCubeByColors(temp, cube.getColors());
                        cubeFace = cube.getFace(firstFaceId);
                    }
                }
                console.log(cube);
                let relation = getRelation(firstFaceId, cubeFace.parentFaceId);
                let indexes = getIndexBySide(relation[1]);
                let clockwise = !indexes.includes(diagonals[(diagonals.indexOf(cubeFace.positionInFace)+1)%4]);
                let firstPositionInOppositeFace = cube.getFaceByParentFaceId(oppositeFace).positionInFace;
                let nextMove;
                nextMove = {
                    faceId: cubeFace.parentFaceId,
                    clockwise: clockwise
                };
                moves.push(nextMove);
                temp = move(temp, nextMove.faceId, nextMove.clockwise);
                cube = getCubeByColors(temp, cube.getColors());

                let lastPositionInOppositeFace = cube.getFaceByParentFaceId(oppositeFace).positionInFace;
                let clockwise2 = diagonals[(diagonals.indexOf(lastPositionInOppositeFace)+1)%4] === firstPositionInOppositeFace;
                nextMove =  {
                    faceId: oppositeFace,
                    clockwise: clockwise2
                };
                moves.push(nextMove);
                temp = move(temp, nextMove.faceId, nextMove.clockwise);
                cube = getCubeByColors(temp, cube.getColors());
                nextMove =  {
                    faceId: cubeFace.parentFaceId,
                    clockwise: !clockwise
                };
                moves.push(nextMove);
                temp = move(temp, nextMove.faceId, nextMove.clockwise);
                cube = getCubeByColors(temp, cube.getColors());
            }
        }
        if (n === 300) break;
        n++;
        diagonalsCubes = getCubes(temp, firstFaceId, false);
        console.log("diagonalsCubes", diagonalsCubes);
        //break;
    }
    console.log(temp);
    return [temp, moves];
}

function solveEdgeOfSecondRow(temp) {
    let moves = [];
    let firstFaceId = baseFirstFaceId;
    let secondRowEdgeCubes = getSecondRowEdges(firstFaceId, temp);
    let oppositeFace = getOppositeFace(firstFaceId);
    let n = 0;
    while (!checkCubesInRightPlace(secondRowEdgeCubes)) {
        console.log(secondRowEdgeCubes);
        let cube = getFirstCubeNotRight(secondRowEdgeCubes);
        if (!cube.faces.some((face) => face.parentFaceId === oppositeFace)) {
            let face2 = cube.faces.find((face) => face.parentFaceId !== firstFaceId);
            let relation = getRelation(oppositeFace, face2.parentFaceId);
            let indexes = getIndexBySide(relation[1]);
            let clockwise = !indexes.includes(edges[(edges.indexOf(face2.positionInFace)+1)%4]);
            let nextMoves = createFixEdgeSecondRowMoves(face2.parentFaceId, oppositeFace, clockwise, false);
            moves.push(...nextMoves);
            temp = move(temp, nextMoves);
            cube = getCubeByColors(temp, cube.getColors());
        }
        if (!cube.faces.some((face) => face.parentFaceId === face.color)) {
            let colorToTurn = cube.getFaceByParentFaceId(oppositeFace).color;
            let nextMoves = turnFaceUtilOtherFaceMatch(cube, colorToTurn, cube.getOtherFace(colorToTurn));
            if (nextMoves.length !== 0) {
                moves.push(...nextMoves);
                temp = move(temp, nextMoves);
                cube = getCubeByColors(temp, cube.getColors());
            }
        }
        if (cube.faces.some((face) => face.parentFaceId === face.color)) {
            let face2 = cube.faces.find((face) => face.parentFaceId === face.color);
            let otherFace = cube.getOtherFace(face2.color);
            let movesFake = turnFaceUtilOtherFaceMatch(cube, face2.color, otherFace);
            let clockwise = movesFake.length === 1 ? movesFake[0].clockwise : !movesFake[0].clockwise;
            let nextMoves = createFixEdgeSecondRowMoves(face2.parentFaceId, oppositeFace, clockwise);
            moves.push(...nextMoves);
            temp = move(temp, nextMoves);
            cube = getCubeByColors(temp, cube.getColors());
        }
        if (n === 20) break;
        n++;
        secondRowEdgeCubes = getSecondRowEdges(firstFaceId, temp);
        console.log("secondRowEdgeCubes", secondRowEdgeCubes);
    }

    console.log(temp);
    return [temp, moves];
}

function solveEdgeOfLastFace(temp) {
    let moves = [];
    let oppositeFace = getOppositeFace(baseFirstFaceId);
    let edgesCubes = getCubes(temp, oppositeFace, true);
    let cycle = getCycle(oppositeFace);
    console.log(edgesCubes);
    let n = 0;
    while (!checkCubesInRightPlace(edgesCubes)) {
        n++;
        if (n === 20) break;
        edgesCubes = getCubes(temp, oppositeFace, true);
        console.log(edgesCubes);
        let inRightFace = edgesCubes.filter((c) => c.getFace(oppositeFace).parentFaceId === oppositeFace);
        let inRightFaceNumber = inRightFace.length;
        if (inRightFaceNumber === 0) {
            let nextMoves;
            [temp, nextMoves] = createFixLastFaceEdgeAvailability(temp, cycle[0]);
            moves.push(...nextMoves);
            continue;
        }
        else if (inRightFaceNumber === 2) {
            if (Math.abs(edges.indexOf(inRightFace[0].getFace(oppositeFace).positionInFace) - edges.indexOf(inRightFace[1].getFace(oppositeFace).positionInFace)) === 2) {
                let nextMoves;
                let side = getSideByIndex(edges[(edges.indexOf(inRightFace[0].getFace(oppositeFace).positionInFace)+1)%4]);
                [temp, nextMoves] = createFixLastFaceEdgePlaces(temp, getFaceNeighborBySide(oppositeFace, side));
                moves.push(...nextMoves);
                continue;
                //break;
            }
            else{
                let order = (edges.indexOf(inRightFace[0].getFace(oppositeFace).positionInFace)+1)%4 === edges.indexOf(inRightFace[1].getFace(oppositeFace).positionInFace);
                let cubeToRefer = order ? inRightFace[1] : inRightFace[0];
                let side = getSideByIndex(cubeToRefer.getFace(oppositeFace).positionInFace);
                let faceToUseToMakeTheMove = getFaceNeighborBySide(oppositeFace, side);
                console.log(faceToUseToMakeTheMove);
                let nextMoves;
                [temp, nextMoves] = createFixLastFaceEdgeAvailability(temp, faceToUseToMakeTheMove);
                moves.push(...nextMoves);
            }
        }
        else{
            let randomFace = cycle[0];
            let cube = getCubeByColors(temp, [oppositeFace, randomFace]);
            let nextMoves;
            nextMoves = turnFaceUtilOtherFaceMatch(cube, oppositeFace, cube.getFace(randomFace));
            if (nextMoves.length !== 0) {
                moves.push(...nextMoves);
                temp = move(temp, nextMoves);
                cube = getCubeByColors(temp, cube.getColors());
                edgesCubes = getCubes(temp, oppositeFace, true);
            }
            let rightPlaces = edgesCubes.filter((c) => c.faces.every((f) => f.color === f.parentFaceId));
            if (rightPlaces.length === 2) {
                if (Math.abs(edges.indexOf(rightPlaces[0].getFace(oppositeFace).positionInFace) - edges.indexOf(rightPlaces[1].getFace(oppositeFace).positionInFace)) === 2) {
                    [temp, nextMoves] = createFixLastFaceEdgePlaces(temp, rightPlaces[0].getOtherFace(oppositeFace).parentFaceId);
                    moves.push(...nextMoves);
                    continue;
                }
                cube = edgesCubes.find((c) => c.faces.some((f) => f.color !== f.parentFaceId));
                nextMoves = turnFaceUtilOtherFaceMatch(cube, oppositeFace);
                if (nextMoves.length !== 0) {
                    moves.push(...nextMoves);
                    temp = move(temp, nextMoves);
                    cube = getCubeByColors(temp, cube.getColors());
                    edgesCubes = getCubes(temp, oppositeFace, true);
                }
            }
            rightPlaces = edgesCubes.filter((c) => c.faces.every((f) => f.color === f.parentFaceId));
            let x = 0;
            while (!checkCubesInRightPlace(edgesCubes)) {
                x++;
                if (x > 10) throw "err";
                [temp, nextMoves] = createFixLastFaceEdgePlaces(temp, cube.getOtherFace(oppositeFace).parentFaceId);
                moves.push(...nextMoves);
                edgesCubes = getCubes(temp, oppositeFace, true);
            }
            break;
        }
        console.log("lastRowEdgeCubes", edgesCubes);
    }
    console.log(temp);
    return [temp, moves];
}

function solveDiagonalsPositionOfLastFace(temp) {
    let moves = [];
    let oppositeFace = getOppositeFace(baseFirstFaceId);
    let diagonalsCubes = getCubes(temp, oppositeFace, false);
    let cycle = getCycle(oppositeFace);
    console.log(diagonalsCubes);
    let n = 0;
    while (!checkCubesInRightPlace(diagonalsCubes)) {
        n++;
        if (n === 20) break;
        diagonalsCubes = getCubes(temp, oppositeFace, false);

        const getDiagonalsInRightPosition = () => diagonalsCubes.filter((c) => c.faces.map((f) => f.color).every((cf) => c.faces.map((f) => f.parentFaceId).includes(cf)));
        let diagonalsInRightPosition = getDiagonalsInRightPosition();
        if (diagonalsInRightPosition.length === 0) {
            let nextMoves;
            [temp, nextMoves] = createFixLastFaceDiagonalPlaces(temp, cycle[0]);
            moves.push(...nextMoves);
            continue;
        }
        else{
            if (diagonalsInRightPosition.length === 1) {
                let face = diagonalsInRightPosition[0].getOtherFace(diagonalsInRightPosition[0].getFaceByParentFaceId(oppositeFace).color);
                let relation = getRelation(oppositeFace, face.parentFaceId);
                let side = relation[1];
                let faceOnRight = getFaceNeighborBySide(face.parentFaceId, cubeSides[(cubeSides.indexOf(side)+1)%4]);
                let right = diagonalsInRightPosition[0].faces.map((f) => f.color).includes(faceOnRight);
                let nextMoves;
                [temp, nextMoves] = createFixLastFaceDiagonalPlaces(temp, face.parentFaceId, right);
                moves.push(...nextMoves);
                diagonalsCubes = getCubes(temp, oppositeFace, false);
                diagonalsInRightPosition = getDiagonalsInRightPosition();
                if (diagonalsInRightPosition.length === 1) {
                    [temp, nextMoves] = createFixLastFaceDiagonalPlaces(temp, face.parentFaceId, right);
                    moves.push(...nextMoves);
                }
                //break;
            }
        }
        diagonalsCubes = getCubes(temp, oppositeFace, false);
        let refFace = cycle[0];
        const getTopRightCube = () => {
            let relation = getRelation(oppositeFace, refFace);
            let side = relation[1];
            let index = getIndexBySide([side, cubeSides[(cubeSides.indexOf(side)+1)%4]]);
            return getCube(temp, refFace, index, true);
        };
        while (!checkCubesInRightPlace(diagonalsCubes, oppositeFace)) {
            let cube = getTopRightCube();
            console.log(cube, checkCubesInRightPlace(cube, oppositeFace));

            while (!checkCubesInRightPlace(cube, oppositeFace)) {
                let nextMoves;
                [temp, nextMoves] = createFixLastFaceDiagonalDirection(temp, cube.faces.find((f) => ![refFace, oppositeFace].includes(f.parentFaceId)).parentFaceId);
                moves.push(...nextMoves);
                cube = getTopRightCube();
            }
            let nextMove = [{
                faceId: oppositeFace,
                clockwise: true
            }];
            moves.push(...nextMove);
            temp = move(temp, nextMove);
            diagonalsCubes = getCubes(temp, oppositeFace, false);
        }

        let oneEdge = getCube(temp, oppositeFace, edges[0], true);
        let nextMoves = turnFaceUtilOtherFaceMatch(oneEdge, oppositeFace, oneEdge.getOtherFace(oppositeFace));
        if (nextMoves.length !== 0) {
            moves.push(...nextMoves);
            temp = move(temp, nextMoves);
        }


        console.log(diagonalsCubes);
        console.log("lastRowDiagonalsCubes", diagonalsCubes);
    }
    console.log(temp);
    return [temp, moves];
}

function createFixLastFaceEdgeAvailability(temp, faceId) {
    let moves = [];
    let oppositeFace = getOppositeFace(baseFirstFaceId);
    let cycle = getCycle(oppositeFace);

    let oneFace = cycle[(cycle.indexOf(faceId)+1)%4];
    let relation = getRelation(faceId, oneFace);
    let relation2 = getRelation(oppositeFace, oneFace);
    let index = getIndexBySide([relation[1], relation2[1]]);
    let indexes = getIndexBySide(getOppositeSide(relation2[1]));
    let clockwise = indexes.includes(diagonals[(diagonals.indexOf(index)+1)%4]);

    const doubleFace = (go) => [
        {
            faceId: oneFace,
            clockwise: go
        },
        {
            faceId: getOppositeFace(oneFace),
            clockwise: !go
        }
    ];

    //go
    let nextMoves;
    nextMoves = doubleFace(clockwise);
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    //move faceId
    nextMoves = [
        {
            faceId: faceId,
            clockwise: true
        }
    ];
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    //return
    nextMoves = doubleFace(!clockwise);
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    //move faceId twice
    nextMoves = [
        {
            faceId: oppositeFace,
            clockwise: false
        },
        {
            faceId: oppositeFace,
            clockwise: false
        }
    ];
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    nextMoves = doubleFace(clockwise);
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    //move faceId
    nextMoves = [
        {
            faceId: faceId,
            clockwise: true
        }
    ];
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    nextMoves = doubleFace(!clockwise);
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);
    return [temp, moves];
}

function createFixLastFaceEdgePlaces(temp, faceId) {
    let moves = [];
    let oppositeFace = getOppositeFace(baseFirstFaceId);

    let relation = getRelation(oppositeFace, faceId);
    let side = relation[1];
    let faceOnRight = getFaceNeighborBySide(faceId, cubeSides[(cubeSides.indexOf(side)+1)%4]);
    let nextMoves;
    //move faceId
    nextMoves = [
        {
            faceId: faceOnRight,
            clockwise: true
        },
        //
        {
            faceId: oppositeFace,
            clockwise: true
        },
        {
            faceId: oppositeFace,
            clockwise: true
        },
        {
            faceId: faceOnRight,
            clockwise: false
        },
        {
            faceId: oppositeFace,
            clockwise: false
        },
        {
            faceId: faceOnRight,
            clockwise: true
        },
        {
            faceId: oppositeFace,
            clockwise: false
        },
        {
            faceId: faceOnRight,
            clockwise: false
        },
    ];
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    return [temp, moves];
}

function createFixLastFaceDiagonalPlaces(temp, faceId, right = true) {
    let moves = [];
    let oppositeFace = getOppositeFace(baseFirstFaceId);

    let relation = getRelation(oppositeFace, faceId);
    let side = relation[1];
    let faceOnRight = getFaceNeighborBySide(faceId, cubeSides[(cubeSides.indexOf(side)+1)%4]);
    let faceOnLeft = getOppositeFace(faceOnRight);

    let nextMoves;
    //move faceId
    nextMoves = [
        {
            faceId: right ? faceOnLeft : getOppositeFace(faceOnLeft),
            clockwise: !right
        },
        //
        {
            faceId: oppositeFace,
            clockwise: right
        },
        {
            faceId: right ? faceOnRight : getOppositeFace(faceOnRight),
            clockwise: right
        },
        {
            faceId: oppositeFace,
            clockwise: !right
        },
        {
            faceId: right ? faceOnLeft : getOppositeFace(faceOnLeft),
            clockwise: right
        },
        {
            faceId: oppositeFace,
            clockwise: right
        },
        {
            faceId: right ? faceOnRight : getOppositeFace(faceOnRight),
            clockwise: !right
        },
        {
            faceId: oppositeFace,
            clockwise: !right
        },
    ];
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);

    return [temp, moves];
}

function createFixLastFaceDiagonalDirection(temp, faceOnRight) {
    let moves = [];
    let firstFaceId = baseFirstFaceId;
    for (let i = 0; i < 2; i++) {
        moves.push(...[
            {
                faceId: faceOnRight,
                clockwise: false
            },
            {
                faceId: firstFaceId,
                clockwise: false
            },
            {
                faceId: faceOnRight,
                clockwise: true
            },
            {
                faceId: firstFaceId,
                clockwise: true
            }
        ]);
    }

    temp = move(temp, moves);

    return [temp, moves];
}

function createFixEdgeSecondRowMoves(faceToTurn, topFace, clockwise, forward = true) {
    const nextMoves = [];
    for (let i = 0; i < 2; i++) {
        nextMoves.push({
            faceId: faceToTurn,
            clockwise: clockwise
        });
        nextMoves.push({
            faceId: topFace,
            clockwise: clockwise
        });
    }
    nextMoves.push({
        faceId: faceToTurn,
        clockwise: forward ? clockwise : !clockwise
    });
    for (let i = 0; i < 2; i++) {
        nextMoves.push({
            faceId: topFace,
            clockwise: !clockwise
        });
        nextMoves.push({
            faceId: faceToTurn,
            clockwise: !clockwise
        });
    }
    return nextMoves;
}

function getSecondRowEdges(firstFaceId, temp) {
    let cubes = [];
    let cycle = getCycle(firstFaceId);
    for (let i = 0; i < cycle.length; i++) {
        cubes.push(getCubeByColors(temp, [cycle[i], cycle[(i+1)%4]]));
    }
    return cubes;
}

function getPositionInOtherFaceOfOneCube(positionInRefFace, refFaceId, targetFaceId) {
    let relation = getRelation(refFaceId, targetFaceId);
    let side = relation[0];
    let otherSide = relation[1];
    let indexes = getIndexBySide(otherSide);
    let indexes2 = getIndexBySide(getOppositeSide(otherSide));
    let transformation = getTransformation(side, otherSide);
    let index = transformation(positionInRefFace);
    return indexes[indexes2.indexOf(index)];
}

function cubeIsInOppositeFace(cube, faceId, moves, temp) {
    let nextMoves = turnFaceUtilOtherFaceMatch(cube, faceId);
    if (nextMoves.length !== 0) {
        moves.push(...nextMoves);
        temp = move(temp, nextMoves);
        cube = getCubeByColors(temp, cube.getColors());
    }
    nextMoves = turn2times(cube.getOtherFace(faceId).parentFaceId);
    moves.push(...nextMoves);
    temp = move(temp, nextMoves);
    return [temp, moves];
}

function turn2times(faceId) {
    let nextMoves = [];
    for (let i = 0; i < 2; i++) {
        nextMoves.push({
            faceId: faceId,
            clockwise: true
        });
    }
    return nextMoves;
}

function optimizeMoves(moves) {
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

/** @param cube
 @param faceInFaceToTurn
 @param {false,FakeCubeFace} faceToCheck */
function turnFaceUtilOtherFaceMatch(cube, faceInFaceToTurn, faceToCheck = false) {
    let moves = [];
    let faceToTurn = cube.getFace(faceInFaceToTurn);
    console.log(cube, faceInFaceToTurn, faceToCheck);
    if (faceToCheck===false) {
        faceToCheck = cube.getOtherFace(faceInFaceToTurn);
    }
    console.log(faceToTurn, faceToCheck)
    let cycle = getCycle(faceToTurn.parentFaceId);
    if (faceToCheck.parentFaceId === faceToCheck.color) {
        console.log("hichem", cube);
        return [];
    }
    let currentIndex = cycle.indexOf(faceToCheck.parentFaceId);
    let targetIndex = cycle.indexOf(faceToCheck.color);
    console.log("until", targetIndex, currentIndex, cube);
    let diff = targetIndex - currentIndex;
    let clockwise = diff > 0;
    if (diff<0) diff*=-1
    for (let i = 0; i < diff; i++) {
        moves.push({
            faceId: faceToTurn.parentFaceId,
            clockwise: clockwise
        });
    }
    return moves;
}

function getOppositeFace(faceId) {
    if (faceId%2===0) return faceId+1;
    return faceId-1;
}

/** @param {FakeCube[],FakeCube} cubes
 * @param oneColor
 */
function checkCubesInRightPlace(cubes, oneColor = false) {
    if (!Array.isArray(cubes)) cubes = [cubes];
    for (let i = 0; i < cubes.length; i++) {
        let cube = cubes[i];
        if (oneColor !== false) {
            if (cube.getFace(oneColor).parentFaceId !== oneColor) {
                return false;
            }
        }
        else {
            for (let j = 0; j < cube.faces.length; j++) {
                let cubePart = cube.faces[j];
                if (cubePart.color !== cubePart.parentFaceId) {
                    return false;
                }
            }
        }
    }
    return true;
}

function getFirstCubeNotRight(cubes) {
    if (!Array.isArray(cubes)) cubes = [cubes];
    for (let i = 0; i < cubes.length; i++) {
        let cube = cubes[i];
        for (let j = 0; j < cube.faces.length; j++) {
            let cubePart = cube.faces[j];
            if (cubePart.color !== cubePart.parentFaceId) {
                return cube;
            }
        }
    }
    return null;
}