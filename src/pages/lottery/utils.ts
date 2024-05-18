function getRandomInt(min: number, max: number): number {
    const range = max - min + 1;
    const byteArray = new Uint32Array(1);
    window.crypto.getRandomValues(byteArray);
    const randomValue = byteArray[0] / (0xFFFFFFFF + 1);
    return Math.floor(randomValue * range) + min;
}

const getRandomNumbers = (maxNumber: number, numberCount: number) => {
    const numbers: number[] = [];
    while (numbers.length < numberCount) {
        const randomNumber = getRandomInt(1, maxNumber);
        if (!numbers.includes(randomNumber)) {
            numbers.push(randomNumber);
        }
    }
    return numbers.sort((a, b) => a - b).map((num: number) => num < 10 ? '0' + num : num);
}

export const superLottoGen = () => getRandomNumbers(35, 5).join(' ') + ' + ' + getRandomNumbers(12, 2).join(' ');

export const markSixGen = () => getRandomNumbers(49, 6).join(' ');
