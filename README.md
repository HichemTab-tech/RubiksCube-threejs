# Rubik's Cube Solver

This project is a Rubik's cube solver implemented in JavaScript. The solver operates on a 3x3 Rubik's cube and employs an algorithm based on base solver and transformations to solve the cube.

## Demo

The Rubik's Cube Solver is available as a web application. You can access the demo [here](https://hichemtab-tech.github.io/RubiksCube-threejs/).

## Algorithm

The algorithm is based on the [CFOP method](https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/). Which is programmed in this project under these steps:


### Step 1
Identify the positioning of the cubes, which are categorized into **edges** and **diagonals**. Each cube has an associated color. The **solver** identifies the colors and their location to determine the initial state of the Rubik's Cube.

### Step 2
The **solver** then calculates the **movement plan** to reach the solved state. This is performed by following a pre-defined `road` that describes how the cube's faces should be moved.
This process involves rotating the cube faces in a specific way using the `#move` function. This function takes the face ID and a boolean value to determine whether the rotation should be **clockwise** or **counterclockwise**.

### Step 3
The `#getIndexesRoad` function is used to understand the transformation between the old face ID and the new one. It calculates the sequence of moves to transport a cube piece from its old location (old face ID) to its new location (new face ID).

### Step 4
The `#getIndexBySide` function is used to understand the sides of each cube. It determines the relative position on the face of a cube using the cube indices.

### Step 5
If the cube is on the edge, the `#getCubes` function takes care of moving it to its correct position, respecting the global color scheme of the Rubik's Cube.

### End Step
After going through these algorithmic steps, the Rubik's Cube should be in its solved state. Calculations based on the cube's state ensure that the solver continues to execute until the cube is solved.
This algorithm essentially mimics the way a human would solve a Rubik's Cube, by understanding the positioning, planning the movements, and then executing those movements until the puzzle is solved.

_**Disclaimer**: This is a high-level summarization of the algorithm used in this project, for more detailed understanding I recommend going through the source code._