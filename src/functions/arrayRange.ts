export function arrayRange(arr: number[]): [number, number] {
    return arr.length ? arr.reduce((acc, cur) => {
        return [Math.min(acc[0], cur), Math.max(acc[1], cur)];
    }, [Infinity, 0]) : [0, 0];
}