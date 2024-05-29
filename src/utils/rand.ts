export function getRandomInt(min: number, max: number): number {
    const range = max - min + 1;
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    const randomValue = byteArray[0] / (0xFFFFFFFF + 1);
    return Math.floor(randomValue * range) + min;
}