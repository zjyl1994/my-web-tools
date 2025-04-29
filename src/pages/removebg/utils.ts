export const performFloodFill = (
    imageData: ImageData,
    width: number,
    height: number,
    targetR: number,
    targetG: number,
    targetB: number,
    threshold: number,
    startX: number = 0,
    startY: number = 0
) => {
    const data = imageData.data;
    const visited = new Uint8Array(width * height);
    const queue: number[] = [];

    const isValid = (x: number, y: number) => {
        return x >= 0 && x < width && y >= 0 && y < height;
    };

    const shouldRemove = (index: number) => {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        return Math.abs(r - targetR) + Math.abs(g - targetG) + Math.abs(b - targetB) < threshold;
    };

    // 初始化种子点
    const index = (startY * width + startX) * 4;
    if (isValid(startX, startY) && !visited[startY * width + startX] && shouldRemove(index)) {
        queue.push(startX, startY);
        visited[startY * width + startX] = 1;
    }

    // Flood Fill算法
    while (queue.length > 0) {
        const x = queue.shift()!;
        const y = queue.shift()!;
        const index = (y * width + x) * 4;

        data[index + 3] = 0; // 设置透明

        // 检查四个方向
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (isValid(nx, ny)) {
                const nIndex = (ny * width + nx) * 4;
                if (!visited[ny * width + nx] && shouldRemove(nIndex)) {
                    visited[ny * width + nx] = 1;
                    queue.push(nx, ny);
                }
            }
        });
    }
};