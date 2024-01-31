

export function areNumbersAlmostEqual(a, b, tolerance = 0.0001) {
    return Math.abs(a - b) < tolerance;
}

export function copyList(arr) {
    return JSON.parse(JSON.stringify(arr));
}