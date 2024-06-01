import BaseSolver from "./BaseSolver";
import {copyList} from "./utils";
import FakeCube from "./test/fakeCube";

export default class Solver3X extends BaseSolver {
    #cubeSize = 3;
    static #diagonals = [0, 6, 8, 2];
    static #edges = [1, 3, 7, 5];


    #move(faceId, clockwise = false) {
        if (Array.isArray(faceId)) {
            for (let i = 0; i < faceId.length; i++) {
                this.#move(faceId[i].faceId, faceId[i].clockwise);
            }
            return;
        }
        else if (typeof faceId === "object") {
            this.#move(faceId.faceId, faceId.clockwise);
            return;
        }
        let cycle = BaseSolver.getCycle(faceId);
        let selfFaceCycle = [...BaseSolver.cubeSides];

        let temp = copyList(this.temp);
        if (!clockwise) {
            cycle.reverse();
            selfFaceCycle.reverse();
        }
        for (let i = 0; i < 4; i++) {
            let road = this.#getIndexesRoad(faceId, cycle[i], cycle[(i+1)%4]);
            //console.log(cycle[i], cycle[(i+1)%4], road);
            for (let j = 0; j < road.from.length; j++) {
                temp[cycle[(i+1)%4]][road.to[j]] = this.temp[cycle[i]][road.from[j]];
            }
        }
        for (let i = 0; i < 4; i++) {
            let indexes = this.#getIndexBySide(selfFaceCycle[i]);
            let indexes2 = this.#getIndexBySide(selfFaceCycle[(i+1)%4]);
            let transformation = BaseSolver.getTransformationInOneFace(selfFaceCycle[i], selfFaceCycle[(i+1)%4]);
            let road = {
                from: indexes,
                to: transformation(indexes2)
            };
            //console.log(selfFaceCycle[i], selfFaceCycle[(i+1)%4], road);
            for (let j = 0; j < road.from.length; j++) {
                temp[faceId][road.to[j]] = this.temp[faceId][road.from[j]];
            }
        }
        this.moves.push({
            faceId: faceId,
            clockwise: clockwise
        });
        this.temp = temp;
    }

    #getIndexesRoad(faceId, oldFaceId, newFaceId) {
        let relationRef = BaseSolver.getRelation(faceId, oldFaceId);
        let relation = BaseSolver.getRelation(oldFaceId, newFaceId);
        let transformation = this.#getTransformation(relation[0], relation[1]);
        let indexes = this.#getIndexBySide(relationRef[1]);
        return {
            from: indexes,
            to: transformation(indexes)
        }
    }

    #getIndexBySide(side) {
        if (Array.isArray(side)) {
            let indexes = side.map((s) => this.#getIndexBySide(s));
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

    #getSideByIndex(index) {
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

    #isColorsFitCubeIndex(colorsLength, index) {
        return (Solver3X.#edges.includes(index) && colorsLength === 2) || (Solver3X.#diagonals.includes(index) && colorsLength === 3);
    }

    /** @type FakeCube[] */
     #getCubes(color, isEdge) {
        let cubes = [];
        if (isEdge) {
            for (let i = 0; i < Solver3X.#edges.length; i++) {
                let cube = this.#getCube(color, Solver3X.#edges[i], false);
                if (cube !== null) {
                    if (Array.isArray(cube)) cubes.push(...cube);
                    else cubes.push(cube);
                }
            }
        }
        else{
            for (let i = 0; i < Solver3X.#diagonals.length; i++) {
                let cube = this.#getCube(color, Solver3X.#diagonals[i], false);
                if (cube !== null) {
                    if (Array.isArray(cube)) cubes.push(...cube);
                    else cubes.push(cube);
                }
            }
        }
        return cubes;
    }

    #getCube(color, positionInFace, colorIsParentFace = false) {
        let mapsList = copyList(this.temp);
        let parentFaceId = -1;
        if (colorIsParentFace) {
            parentFaceId = [color];
        }
        else{
            for (let i = 0; i < this.temp.length; i++) {
                if (this.temp[i][positionInFace]===color) {
                    if (parentFaceId === -1) parentFaceId = [i];
                    else parentFaceId.push(i);
                }
            }
        }
        if (parentFaceId === -1) return null;
        let cubes = [];
        for (let j = 0; j < parentFaceId.length; j++) {
            let sides = this.#getSideByIndex(positionInFace);
            if (typeof sides === "string") sides = [sides];
            let cubeParts = [];
            for (let i = 0; i < sides.length; i++) {
                let side = sides[i];
                let relations = BaseSolver.getRelation(parentFaceId[j]);
                let relation = relations.find((relation) => relation.relation[0]===side);
                let otherParentFaceId = parseInt(relation.key[2]);
                let index = this.#getPositionInOtherFaceOfOneCube(positionInFace, parentFaceId[j], otherParentFaceId);
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
    #getCubeByColors(colors) {
        let mapsList = copyList(this.temp);
        let testColor = colors[0];
        for (let i = 0; i < mapsList.length; i++) {
            for (let j = 0; j < mapsList[i].length; j++) {
                if (mapsList[i][j] === testColor) {
                    if (!this.#isColorsFitCubeIndex(colors.length, j)) continue;
                    let cube = this.#getCube(i, j, true);
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

    solve() {
         super.solve();
         this.#solveEdgeOfFirstFace();
         this.#solveDiagonalsOfFirstFace();
         this.#solveEdgeOfSecondRow();
         this.#solveEdgeOfLastFace();
         this.#solveDiagonalsPositionOfLastFace();
         this.#optimizeMoves();
         this.baseGameListener.OnSolvingSuccess(this.moves);
    }

    #solveEdgeOfFirstFace() {
        let firstFaceId = this.baseFirstFaceId;
        let edgesCubes = this.#getCubes(firstFaceId, true);
        let cycle = BaseSolver.getCycle(firstFaceId);
        let n = 0;
        while (!this.#checkCubesInRightPlace(edgesCubes)) {
            //console.log(edgesCubes);
            let cube = this.#getFirstCubeNotRight(edgesCubes);
            console.warn("cube", cube);
            let cubeFace = cube.getFace(firstFaceId);
            if (cycle.includes(cubeFace.parentFaceId)) {
                if (!cube.faces.every(face => cycle.includes(face.parentFaceId))) {
                    let nextMoves = [];
                    nextMoves.push({
                        faceId: cubeFace.parentFaceId,
                        clockwise: true
                    });
                    this.#move(nextMoves);
                    cube = this.#getCubeByColors(cube.getColors());
                }
                //console.log(copyList(cube));
                let faceToTurn = cube.getOtherFace(firstFaceId);
                let relation = BaseSolver.getRelation(firstFaceId, faceToTurn.parentFaceId);
                let indexes = this.#getIndexBySide(relation[1]);
                let otherIndex = (Solver3X.#edges.indexOf(indexes[1])+2)%4;
                let clockwise = Solver3X.#edges[(otherIndex+1)%4] !== faceToTurn.positionInFace;
                let nextMoves = [];
                nextMoves.push({
                    faceId: faceToTurn.parentFaceId,
                    clockwise: clockwise
                });
                let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);
                nextMoves.push({
                    faceId: oppositeFace,
                    clockwise: true
                });
                nextMoves.push({
                    faceId: faceToTurn.parentFaceId,
                    clockwise: !clockwise
                });
                this.#move(nextMoves);
                cube = this.#getCubeByColors(cube.getColors());
                this.#cubeIsInOppositeFace(cube, firstFaceId);
            }
            else{
                if (cubeFace.parentFaceId === cubeFace.color){
                    this.#turn2times(cube.getOtherFace(cubeFace.color).parentFaceId);
                }
                cube = this.#getCubeByColors(cube.getColors());
                this.#cubeIsInOppositeFace(cube, firstFaceId);
            }
            if (n === 200) {
                this._baseGameListener.OnSolvingFailed();
                break;
            }
            n++;
            edgesCubes = this.#getCubes(firstFaceId, true);
            //console.log("edgesCubes", edgesCubes);
        }
    }

    #solveDiagonalsOfFirstFace() {
        let firstFaceId = this.baseFirstFaceId;
        let diagonalsCubes = this.#getCubes(firstFaceId, false);
        //console.log(diagonalsCubes);
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);
        let cycle = BaseSolver.getCycle(firstFaceId);
        let n = 0;
        while (!this.#checkCubesInRightPlace(diagonalsCubes)) {
            //console.log(diagonalsCubes);
            let cube = this.#getFirstCubeNotRight(diagonalsCubes);
            let cubeFace = cube.getFace(firstFaceId);
            if (cubeFace.parentFaceId === oppositeFace) {

                let indexInFirstFaceWhichCanBeUsed = this.temp[firstFaceId].findIndex((color) => color !== firstFaceId);
                let anyFaceFromCycle = cycle[0];
                let relation = BaseSolver.getRelation(firstFaceId, anyFaceFromCycle);
                let relation2 = BaseSolver.getRelation(anyFaceFromCycle, oppositeFace);
                let transformation = this.#getTransformation(relation[0], relation[1]);
                let transformation2 = this.#getTransformation(relation2[0], relation2[1]);
                let index0 = transformation(indexInFirstFaceWhichCanBeUsed);
                let index = transformation2(index0);


                let side2 = BaseSolver.getOppositeSide(relation2[1]);
                let indexes2 = this.#getIndexBySide(side2);
                let indexes = this.#getIndexBySide(relation2[1]);

                let currentIndex = Solver3X.#diagonals.indexOf(cubeFace.positionInFace);
                let targetIndex = Solver3X.#diagonals.indexOf(indexes2[indexes.indexOf(index)]);
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
                    this.#move(nextMoves);
                    cube = this.#getCubeByColors(cube.getColors());
                    cubeFace = cube.getFace(firstFaceId);
                }

                let otherSide = BaseSolver.getOppositeSide(relation[1]);
                let indexes3 = this.#getIndexBySide(otherSide);
                let clockwise3 = !indexes3.includes(Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(index0)+1)%4]);
                nextMoves = {
                    faceId: anyFaceFromCycle,
                    clockwise: clockwise3
                };
                this.#move(nextMoves);

                this.#turn2times(oppositeFace);

                nextMoves = {
                    faceId: anyFaceFromCycle,
                    clockwise: !clockwise3
                };
                this.#move(nextMoves);
                cube = this.#getCubeByColors(cube.getColors());
                cubeFace = cube.getFace(firstFaceId);
            }
            else if (cubeFace.parentFaceId === firstFaceId) {
                let face2 = cube.faces.find(face => face.color !== firstFaceId);
                // noinspection DuplicatedCode
                let relation = BaseSolver.getRelation(firstFaceId, face2.parentFaceId);
                let indexes = this.#getIndexBySide(relation[1]);
                let clockwise = !indexes.includes(Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(face2.positionInFace)+1)%4]);
                let nextMove;
                nextMove = {
                    faceId: face2.parentFaceId,
                    clockwise: clockwise
                };
                this.#move(nextMove);
                cube = this.#getCubeByColors(cube.getColors());
                nextMove = {
                    faceId: oppositeFace,
                    clockwise: true
                };
                this.#move(nextMove);
                cube = this.#getCubeByColors(cube.getColors());
                nextMove = {
                    faceId: face2.parentFaceId,
                    clockwise: !clockwise
                };
                this.#move(nextMove);
                cube = this.#getCubeByColors(cube.getColors());
            }
            if (cycle.includes(cubeFace.parentFaceId)) {
                if (cube.faces.some(face => face.parentFaceId === firstFaceId)) {
                    let face2 = cube.faces.find(face => face.parentFaceId !== firstFaceId && face.color !== firstFaceId);
                    // noinspection DuplicatedCode
                    let relation = BaseSolver.getRelation(firstFaceId, face2.parentFaceId);
                    let indexes = this.#getIndexBySide(relation[1]);
                    let clockwise = !indexes.includes(Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(face2.positionInFace)+1)%4]);
                    let nextMove;
                    nextMove = {
                        faceId: face2.parentFaceId,
                        clockwise: clockwise
                    };
                    this.#move(nextMove);
                    cube = this.#getCubeByColors(cube.getColors());

                    let lastPositionInOppositeFace = cube.getFaceByParentFaceId(oppositeFace).positionInFace;
                    relation = BaseSolver.getRelation(cubeFace.parentFaceId, oppositeFace);
                    indexes = this.#getIndexBySide(relation[1]);
                    let clockwise2 = !indexes.includes(Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(lastPositionInOppositeFace)+1)%4]);
                    nextMove = {
                        faceId: oppositeFace,
                        clockwise: clockwise2
                    };
                    this.#move(nextMove);
                    cube = this.#getCubeByColors(cube.getColors());

                    nextMove = {
                        faceId: face2.parentFaceId,
                        clockwise: !clockwise
                    };
                    this.#move(nextMove);
                    cube = this.#getCubeByColors(cube.getColors());
                    cubeFace = cube.getFace(firstFaceId);
                }
                if (cube.faces.some(face => face.parentFaceId === oppositeFace)) {
                    let face2 = cube.faces.find(face => face.parentFaceId !== oppositeFace && face.color !== firstFaceId);
                    if (face2.parentFaceId !== face2.color) {
                        this.#turnFaceUtilOtherFaceMatch(cube, cube.getFaceByParentFaceId(oppositeFace).color, face2);
                        cube = this.#getCubeByColors(cube.getColors());
                        cubeFace = cube.getFace(firstFaceId);
                    }
                    //console.log(cube);
                    let relation = BaseSolver.getRelation(firstFaceId, cubeFace.parentFaceId);
                    let indexes = this.#getIndexBySide(relation[1]);
                    let clockwise = !indexes.includes(Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(cubeFace.positionInFace)+1)%4]);
                    let firstPositionInOppositeFace = cube.getFaceByParentFaceId(oppositeFace).positionInFace;
                    let nextMove;
                    nextMove = {
                        faceId: cubeFace.parentFaceId,
                        clockwise: clockwise
                    };
                    this.#move(nextMove);
                    cube = this.#getCubeByColors(cube.getColors());

                    //console.log(cube, oppositeFace);
                    let lastPositionInOppositeFace = cube.getFaceByParentFaceId(oppositeFace).positionInFace;
                    let clockwise2 = Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(lastPositionInOppositeFace)+1)%4] === firstPositionInOppositeFace;
                    nextMove =  {
                        faceId: oppositeFace,
                        clockwise: clockwise2
                    };
                    this.#move(nextMove);
                    cube = this.#getCubeByColors(cube.getColors());
                    nextMove =  {
                        faceId: cubeFace.parentFaceId,
                        clockwise: !clockwise
                    };
                    this.#move(nextMove);
                    cube = this.#getCubeByColors(cube.getColors());
                }
            }
            if (n === 200) {
                this._baseGameListener.OnSolvingFailed();
                break;
            }
            n++;
            diagonalsCubes = this.#getCubes(firstFaceId, false);
            //console.log("diagonalsCubes", diagonalsCubes);
            //break;
        }
    }

    #solveEdgeOfSecondRow() {
        let firstFaceId = this.baseFirstFaceId;
        let secondRowEdgeCubes = this.#getSecondRowEdges(firstFaceId);
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);
        let n = 0;
        //console.log(this.temp);
        while (!this.#checkCubesInRightPlace(secondRowEdgeCubes)) {
            //console.log(secondRowEdgeCubes);
            let cube = this.#getFirstCubeNotRight(secondRowEdgeCubes);
            if (!cube.faces.some((face) => face.parentFaceId === oppositeFace)) {
                let face2 = cube.faces.find((face) => face.parentFaceId !== firstFaceId);
                let relation = BaseSolver.getRelation(oppositeFace, face2.parentFaceId);
                let indexes = this.#getIndexBySide(relation[1]);
                let clockwise = !indexes.includes(Solver3X.#edges[(Solver3X.#edges.indexOf(face2.positionInFace)+1)%4]);
                this.#createFixEdgeSecondRowMoves(face2.parentFaceId, oppositeFace, clockwise, false);
                cube = this.#getCubeByColors(cube.getColors());
            }
            if (!cube.faces.some((face) => face.parentFaceId === face.color)) {
                let colorToTurn = cube.getFaceByParentFaceId(oppositeFace).color;
                this.#turnFaceUtilOtherFaceMatch(cube, colorToTurn, cube.getOtherFace(colorToTurn));
                cube = this.#getCubeByColors(cube.getColors());
            }
            if (cube.faces.some((face) => face.parentFaceId === face.color)) {
                let face2 = cube.faces.find((face) => face.parentFaceId === face.color);
                let otherFace = cube.getOtherFace(face2.color);
                let tempMoves = copyList(this.moves);
                let temp = copyList(this.temp);
                this.#turnFaceUtilOtherFaceMatch(cube, face2.color, otherFace);
                let movesFake = this.moves.slice(tempMoves.length, this.moves.length);
                let clockwise = movesFake.length === 1 ? movesFake[0].clockwise : !movesFake[0].clockwise;
                this.moves = copyList(tempMoves);
                this.temp = temp;
                this.#createFixEdgeSecondRowMoves(face2.parentFaceId, oppositeFace, clockwise);
                cube = this.#getCubeByColors(cube.getColors());
            }
            if (n === 100) {
                this._baseGameListener.OnSolvingFailed();
                break;
            }
            n++;
            secondRowEdgeCubes = this.#getSecondRowEdges(firstFaceId);
            //console.log("secondRowEdgeCubes", secondRowEdgeCubes);
        }
    }

    #solveEdgeOfLastFace() {
        let firstFaceId = this.baseFirstFaceId;
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);
        let edgesCubes = this.#getCubes(oppositeFace, true);
        let cycle = BaseSolver.getCycle(oppositeFace);
        //console.log(edgesCubes);
        let n = 0;
        while (!this.#checkCubesInRightPlace(edgesCubes)) {
            n++;
            if (n === 100) {
                this._baseGameListener.OnSolvingFailed();
                break;
            }
            edgesCubes = this.#getCubes(oppositeFace, true);
            //console.log(edgesCubes);
            let inRightFace = edgesCubes.filter((c) => c.getFace(oppositeFace).parentFaceId === oppositeFace);
            let inRightFaceNumber = inRightFace.length;
            if (inRightFaceNumber === 0) {
                this.#createFixLastFaceEdgeAvailability(cycle[0]);
                continue;
            }
            else if (inRightFaceNumber === 2) {
                if (Math.abs(Solver3X.#edges.indexOf(inRightFace[0].getFace(oppositeFace).positionInFace) - Solver3X.#edges.indexOf(inRightFace[1].getFace(oppositeFace).positionInFace)) === 2) {
                    let side = this.#getSideByIndex(Solver3X.#edges[(Solver3X.#edges.indexOf(inRightFace[0].getFace(oppositeFace).positionInFace)+1)%4]);
                    this.#createFixLastFaceEdgePlaces(BaseSolver.getFaceNeighborBySide(oppositeFace, side));
                    continue;
                    //break;
                }
                else{
                    let order = (Solver3X.#edges.indexOf(inRightFace[0].getFace(oppositeFace).positionInFace)+1)%4 === Solver3X.#edges.indexOf(inRightFace[1].getFace(oppositeFace).positionInFace);
                    let cubeToRefer = order ? inRightFace[1] : inRightFace[0];
                    let side = this.#getSideByIndex(cubeToRefer.getFace(oppositeFace).positionInFace);
                    let faceToUseToMakeTheMove = BaseSolver.getFaceNeighborBySide(oppositeFace, side);
                    //console.log(faceToUseToMakeTheMove);
                    this.#createFixLastFaceEdgeAvailability(faceToUseToMakeTheMove);
                }
            }
            else{
                let randomFace = cycle[0];
                let cube = this.#getCubeByColors([oppositeFace, randomFace]);
                this.#turnFaceUtilOtherFaceMatch(cube, oppositeFace, cube.getFace(randomFace));
                cube = this.#getCubeByColors(cube.getColors());
                edgesCubes = this.#getCubes(oppositeFace, true);
                let rightPlaces = edgesCubes.filter((c) => c.faces.every((f) => f.color === f.parentFaceId));
                if (rightPlaces.length === 2) {
                    if (Math.abs(Solver3X.#edges.indexOf(rightPlaces[0].getFace(oppositeFace).positionInFace) - Solver3X.#edges.indexOf(rightPlaces[1].getFace(oppositeFace).positionInFace)) === 2) {
                        this.#createFixLastFaceEdgePlaces(rightPlaces[0].getOtherFace(oppositeFace).parentFaceId);
                        continue;
                    }
                    cube = edgesCubes.find((c) => c.faces.some((f) => f.color !== f.parentFaceId));
                    this.#turnFaceUtilOtherFaceMatch(cube, oppositeFace);
                    cube = this.#getCubeByColors(cube.getColors());
                    edgesCubes = this.#getCubes(oppositeFace, true);
                }
                rightPlaces = edgesCubes.filter((c) => c.faces.every((f) => f.color === f.parentFaceId));
                let x = 0;
                while (!this.#checkCubesInRightPlace(edgesCubes)) {
                    x++;
                    if (x === 20) {
                        this._baseGameListener.OnSolvingFailed();
                        break;
                    }
                    this.#createFixLastFaceEdgePlaces(cube.getOtherFace(oppositeFace).parentFaceId);
                    edgesCubes = this.#getCubes(oppositeFace, true);
                }
                break;
            }
            //console.log("lastRowEdgeCubes", edgesCubes);
        }
    }

    #solveDiagonalsPositionOfLastFace() {
        let firstFaceId = this.baseFirstFaceId;
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);
        let diagonalsCubes = this.#getCubes(oppositeFace, false);
        let cycle = BaseSolver.getCycle(oppositeFace);
        //console.log(diagonalsCubes);
        let n = 0;
        while (!this.#checkCubesInRightPlace(diagonalsCubes)) {
            n++;
            if (n === 100) {
                this._baseGameListener.OnSolvingFailed();
                break;
            }
            diagonalsCubes = this.#getCubes(oppositeFace, false);

            const getDiagonalsInRightPosition = () => diagonalsCubes.filter((c) => c.faces.map((f) => f.color).every((cf) => c.faces.map((f) => f.parentFaceId).includes(cf)));
            let diagonalsInRightPosition = getDiagonalsInRightPosition();
            if (diagonalsInRightPosition.length === 0) {
                this.#createFixLastFaceDiagonalPlaces(cycle[0]);
                continue;
            }
            else{
                if (diagonalsInRightPosition.length === 1) {
                    let face = diagonalsInRightPosition[0].getOtherFace(diagonalsInRightPosition[0].getFaceByParentFaceId(oppositeFace).color);
                    let relation = BaseSolver.getRelation(oppositeFace, face.parentFaceId);
                    let side = relation[1];
                    let faceOnRight = BaseSolver.getFaceNeighborBySide(face.parentFaceId, BaseSolver.cubeSides[(BaseSolver.cubeSides.indexOf(side)+1)%4]);
                    let right = diagonalsInRightPosition[0].faces.map((f) => f.color).includes(faceOnRight);
                    this.#createFixLastFaceDiagonalPlaces(face.parentFaceId, right);
                    diagonalsCubes = this.#getCubes(oppositeFace, false);
                    diagonalsInRightPosition = getDiagonalsInRightPosition();
                    if (diagonalsInRightPosition.length === 1) {
                        this.#createFixLastFaceDiagonalPlaces(face.parentFaceId, right);
                    }
                    //break;
                }
            }
            diagonalsCubes = this.#getCubes(oppositeFace, false);
            let refFace = cycle[0];
            const getTopRightCube = () => {
                let relation = BaseSolver.getRelation(oppositeFace, refFace);
                let side = relation[1];
                let index = this.#getIndexBySide([side, BaseSolver.cubeSides[(BaseSolver.cubeSides.indexOf(side)+1)%4]]);
                return this.#getCube(refFace, index, true);
            };
            let x = 0;
            while (!this.#checkCubesInRightPlace(diagonalsCubes, oppositeFace)) {
                let cube = getTopRightCube();
                //console.log(cube, this.#checkCubesInRightPlace(cube, oppositeFace));
                x++;
                if (x === 100) {
                    this._baseGameListener.OnSolvingFailed();
                    break;
                }
                let x2 = 0;
                while (!this.#checkCubesInRightPlace(cube, oppositeFace)) {
                    x2++;
                    if (x2 === 100) {
                        this._baseGameListener.OnSolvingFailed();
                        break;
                    }
                    this.#createFixLastFaceDiagonalDirection(cube.faces.find((f) => ![refFace, oppositeFace].includes(f.parentFaceId)).parentFaceId);
                    cube = getTopRightCube();
                }
                let nextMove = [{
                    faceId: oppositeFace,
                    clockwise: true
                }];
                this.#move(nextMove);
                diagonalsCubes = this.#getCubes(oppositeFace, false);
            }

            let oneEdge = this.#getCube(oppositeFace, Solver3X.#edges[0], true);
            this.#turnFaceUtilOtherFaceMatch(oneEdge, oppositeFace, oneEdge.getOtherFace(oppositeFace));


            //console.log(diagonalsCubes);
            //console.log("lastRowDiagonalsCubes", diagonalsCubes);
        }
    }

    #createFixLastFaceEdgeAvailability(faceId) {
        let firstFaceId = this.baseFirstFaceId;
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);
        let cycle = BaseSolver.getCycle(oppositeFace);

        let oneFace = cycle[(cycle.indexOf(faceId)+1)%4];
        let relation = BaseSolver.getRelation(faceId, oneFace);
        let relation2 = BaseSolver.getRelation(oppositeFace, oneFace);
        let index = this.#getIndexBySide([relation[1], relation2[1]]);
        let indexes = this.#getIndexBySide(BaseSolver.getOppositeSide(relation2[1]));
        let clockwise = indexes.includes(Solver3X.#diagonals[(Solver3X.#diagonals.indexOf(index)+1)%4]);

        const doubleFace = (go) => [
            {
                faceId: oneFace,
                clockwise: go
            },
            {
                faceId: BaseSolver.getOppositeFace(oneFace),
                clockwise: !go
            }
        ];

        //go
        let nextMoves;
        nextMoves = doubleFace(clockwise);
        this.#move(nextMoves);

        //move faceId
        nextMoves = [
            {
                faceId: faceId,
                clockwise: true
            }
        ];
        this.#move(nextMoves);

        //return
        nextMoves = doubleFace(!clockwise);
        this.#move(nextMoves);

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
        this.#move(nextMoves);

        nextMoves = doubleFace(clockwise);
        this.#move(nextMoves);

        //move faceId
        nextMoves = [
            {
                faceId: faceId,
                clockwise: true
            }
        ];
        this.#move(nextMoves);

        nextMoves = doubleFace(!clockwise);
        this.#move(nextMoves);
    }

    #createFixLastFaceEdgePlaces(faceId) {
        let firstFaceId = this.baseFirstFaceId;
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);

        let relation = BaseSolver.getRelation(oppositeFace, faceId);
        let side = relation[1];
        let faceOnRight = BaseSolver.getFaceNeighborBySide(faceId, BaseSolver.cubeSides[(BaseSolver.cubeSides.indexOf(side)+1)%4]);
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
        this.#move(nextMoves);
    }

    #createFixLastFaceDiagonalPlaces(faceId, right = true) {
        let firstFaceId = this.baseFirstFaceId;
        let oppositeFace = BaseSolver.getOppositeFace(firstFaceId);

        let relation = BaseSolver.getRelation(oppositeFace, faceId);
        let side = relation[1];
        let faceOnRight = BaseSolver.getFaceNeighborBySide(faceId, BaseSolver.cubeSides[(BaseSolver.cubeSides.indexOf(side)+1)%4]);
        let faceOnLeft = BaseSolver.getOppositeFace(faceOnRight);

        let nextMoves;
        //move faceId
        nextMoves = [
            {
                faceId: right ? faceOnLeft : BaseSolver.getOppositeFace(faceOnLeft),
                clockwise: !right
            },
            //
            {
                faceId: oppositeFace,
                clockwise: right
            },
            {
                faceId: right ? faceOnRight : BaseSolver.getOppositeFace(faceOnRight),
                clockwise: right
            },
            {
                faceId: oppositeFace,
                clockwise: !right
            },
            {
                faceId: right ? faceOnLeft : BaseSolver.getOppositeFace(faceOnLeft),
                clockwise: right
            },
            {
                faceId: oppositeFace,
                clockwise: right
            },
            {
                faceId: right ? faceOnRight : BaseSolver.getOppositeFace(faceOnRight),
                clockwise: !right
            },
            {
                faceId: oppositeFace,
                clockwise: !right
            },
        ];
        this.#move(nextMoves);
    }

    #createFixLastFaceDiagonalDirection(faceOnRight) {
        let moves = [];
        let firstFaceId = this.baseFirstFaceId;
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
        this.#move(moves);
    }

    #createFixEdgeSecondRowMoves(faceToTurn, topFace, clockwise, forward = true) {
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
        this.#move(nextMoves);
    }

    #getSecondRowEdges(firstFaceId) {
        let cubes = [];
        let cycle = BaseSolver.getCycle(firstFaceId);
        for (let i = 0; i < cycle.length; i++) {
            cubes.push(this.#getCubeByColors([cycle[i], cycle[(i+1)%4]]));
        }
        return cubes;
    }

    #getPositionInOtherFaceOfOneCube(positionInRefFace, refFaceId, targetFaceId) {
        let relation = BaseSolver.getRelation(refFaceId, targetFaceId);
        let side = relation[0];
        let otherSide = relation[1];
        let indexes = this.#getIndexBySide(otherSide);
        let indexes2 = this.#getIndexBySide(BaseSolver.getOppositeSide(otherSide));
        let transformation = this.#getTransformation(side, otherSide);
        let index = transformation(positionInRefFace);
        return indexes[indexes2.indexOf(index)];
    }

    #cubeIsInOppositeFace(cube, faceId) {
        this.#turnFaceUtilOtherFaceMatch(cube, faceId);
        cube = this.#getCubeByColors(cube.getColors());
        this.#turn2times(cube.getOtherFace(faceId).parentFaceId);
    }

    #turn2times(faceId) {
        let nextMoves = [];
        for (let i = 0; i < 2; i++) {
            nextMoves.push({
                faceId: faceId,
                clockwise: true
            });
        }
        this.#move(nextMoves);
    }

    #optimizeMoves() {
        let list = copyList(this.moves);
        list = BaseSolver.optimizeMoves(list);
        // some other optimization specifically for 3x Size
        this.moves = list;
    }

    /** @param cube
     @param faceInFaceToTurn
     @param {false,FakeCubeFace} faceToCheck */
    #turnFaceUtilOtherFaceMatch(cube, faceInFaceToTurn, faceToCheck = false) {
        let moves = [];
        let faceToTurn = cube.getFace(faceInFaceToTurn);
        //console.log(cube, faceInFaceToTurn, faceToCheck);
        if (faceToCheck===false) {
            faceToCheck = cube.getOtherFace(faceInFaceToTurn);
        }
        //console.log(faceToTurn, faceToCheck)
        let cycle = BaseSolver.getCycle(faceToTurn.parentFaceId);
        if (faceToCheck.parentFaceId === faceToCheck.color) {
            //console.log("hichem", cube);
            return [];
        }
        let currentIndex = cycle.indexOf(faceToCheck.parentFaceId);
        let targetIndex = cycle.indexOf(faceToCheck.color);
        //console.log("until", targetIndex, currentIndex, cube);
        let diff = targetIndex - currentIndex;
        let clockwise = diff > 0;
        if (diff<0) diff*=-1
        for (let i = 0; i < diff; i++) {
            moves.push({
                faceId: faceToTurn.parentFaceId,
                clockwise: clockwise
            });
        }
        this.#move(moves);
    }

    /** @param {FakeCube[],FakeCube} cubes
     * @param oneColor
     */
    #checkCubesInRightPlace(cubes, oneColor = false) {
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

    #getFirstCubeNotRight(cubes) {
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

    #getTransformation(side1, side2) {
        let keys = Object.keys(BaseSolver.transformations);
        let key1 = side1 + side2;
        let key2 = side2 + side1;
        let key = keys.find(k => k===key1 || k===key2);
        let transformation = BaseSolver.transformations[key];
        if (key === key2) {
            transformation = transformation[1];
        }
        else{
            transformation = transformation[0];
        }
        if (typeof transformation === "string") {
            transformation = BaseSolver.transformations[transformation.substring(0, 2)][transformation.substring(2)];
        }
        return (indexes) => {
            let from = BaseSolver.create2DArray(0, this.#cubeSize);
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
}