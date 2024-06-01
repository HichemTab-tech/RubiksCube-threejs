/**
 * Original JavaScript code by Jamie Law (@jamiemlaw)
 * Source: https://codepen.io/jamiemlaw/pen/ZoYVgG
 *
 * This code has been used as a reference for developing this current script,
 * and all credit for the original code goes to Jamie Law.
 *
 * For more information about Jamie Law's work, visit https://jamiemlaw.com.
 */
(function () {

    const cube = document.getElementById('loading-cube');
    const lid = document.getElementById('lid');
    const base = document.getElementById('base');

    const lid_coordinates = [
        // lid outline
        [[-3, 3, 3], [-3, -3, 3], [3, -3, 3], [3, 3, 3], [-3, 3, 3], [-3, 3, 1], [-3, -3, 1], [3, -3, 1], [3, -3, 3]],
        // lid inner lines
        [[3, 1, 3], [-3, 1, 3], [-3, 1, 1]],
        [[3, -1, 3], [-3, -1, 3], [-3, -1, 1]],
        [[-3, -3, 3], [-3, -3, 1]],
        [[-1, -3, 1], [-1, -3, 3], [-1, 3, 3]],
        [[1, -3, 1], [1, -3, 3], [1, 3, 3]]
    ];

    const base_coordinates = [
        [[-3, 3, 1], [3, 3, 1], [3, -3, 1], [-3, -3, 1], [-3, 3, 1], [-3, 3, -3], [-3, -3, -3], [3, -3, -3], [3, -3, 1]],
        [[1, -3, -3], [1, -3, 1], [1, 1, 1], [-3, 1, 1], [-3, 1, -3]],
        [[-1, -3, -3], [-1, -3, 1], [-1, -1, 1], [-3, -1, 1], [-3, -1, -3]],
        [[-3, -3, -3], [-3, -3, 1]],
        [[-3, 3, -1], [-3, -3, -1], [3, -3, -1]]
    ];

    const u = 4; // size of the cube
    let t = 0; // time

    /*
     * Take in arrays of coordinates and projects them onto an isometric grid.
     * We also pass a parameter t to control the Z rotation of the object, so it can be animated.
     */
    function project(coordinatesGroup, t) {
        return coordinatesGroup.map(function (coordinatesSubGroup) {
            return coordinatesSubGroup.map(function (coordinates) {
                const x = coordinates[0];
                const y = coordinates[1];
                const z = coordinates[2];

                return [
                    (x *  Math.cos(t) - y * Math.sin(t)) * u + 30,
                    (x * -Math.sin(t) - y * Math.cos(t) - z * Math.sqrt(2)) * u / Math.sqrt(3) + 30
                ];
            });
        });
    }

    /*
     * Takes in arrays of coordinates and outputs an SVG path 'd' attribute.
     * The pen is lifted between child arrays, which represent series of lines.
     * The pen draws a line through all coordinates in the grandchild arrays.
     */
    function toPath(coordinates) {
        return 'M' + (JSON
                .stringify(coordinates)
                .replace(/]],\[\[/g, 'M')
                .replace(/],\[/g, 'L')
                .slice(3, -3)
        );
    }

    /*
     * A discontinuous sine ease-in-out easing function.
     * It starts with the lid rotated at 45 degrees (lines up with the rest of the cube).
     * It eases into a rotation, reaching its maximum speed at 90 degrees.
     * It snaps back to 0 degrees (to emulate that it has continued spinning), keeping its velocity.
     * It eases out of the rotation, coming to a stop at 45 degrees, ready to repeat.
    */
    function easing(t) {
        return (2 - Math.cos(Math.PI * t)) % 2 * Math.PI / 4;
    }

    /*
     * run every frame
     */
    function tick() {
        t = (t + 1/30) % 3;
        // rotate the entire cube every spin, to mimic different faces being turned
        cube.style.transform = 'rotate(' + (Math.floor(t) * 120) + 'deg)';

        lid.setAttribute('d', toPath(project(lid_coordinates, easing(t))));
        requestAnimationFrame(tick);
    }

    base.setAttribute('d', toPath(project(base_coordinates, Math.PI / 4)));

    tick();

})();