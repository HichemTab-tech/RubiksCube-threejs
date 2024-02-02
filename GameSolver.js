import Solver3X from "./Solver3X";

export default class GameSolver {
    solverSize = 3;
    /** @type Game*/
    game;
    /** @type BaseSolver */
    solver;

    constructor(game) {
        this.game = game;
        this.#init();
    }

    #init() {
        switch (this.solverSize) {
            case 3:
                this.solver = new Solver3X(this.game);
                break;
        }
    }

    start() {

        /** @type GameListener */
        let gameListener = {
            OnSolvingStart: () => {
                console.log('Start solving');
            },
            OnSolvingEnd: () => {
                console.log('End solving');
            },
            OnSolvingSuccess: (moves) => {
                console.log('Solving success', moves);
                //this.game.move(moves);
            },
            OnSolvingFailed: () => {
                console.log('Solving fail');
            }
        }
        if (typeof this.solver === 'undefined') {
            return;
        }
        this.solver.gameListener = gameListener;
        this.solver.solve();
    }
}