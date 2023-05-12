export function gcd(a: number, b: number) {
    while (a !== 0 && b !== 0) {
        if (a > b) {
            a = a % b;
        } else {
            b = b % a;
        }
    }
    
    return a + b;
}