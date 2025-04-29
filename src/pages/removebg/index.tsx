import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React, { useRef, useState } from 'react';

const RemoveBgPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff'); // 默认颜色为白色

    const handleOpenImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event: any) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                                canvas.width = img.width;
                                canvas.height = img.height;

                                // 再绘制图片
                                ctx.drawImage(img, 0, 0);

                                // 获取 (0,0) 坐标点的颜色
                                const pixelData = ctx.getImageData(0, 0, 1, 1).data;
                                const r = pixelData[0];
                                const g = pixelData[1];
                                const b = pixelData[2];
                                const hexColor = rgbToHex(r, g, b);
                                setBackgroundColor(hexColor);
                                console.log("设置背景色为:", hexColor);
                            }
                        }
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const rgbToHex = (r: number, g: number, b: number): string => {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    };

    const handleSelectBackground = () => {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = backgroundColor;
        input.onchange = (event: any) => {
            setBackgroundColor(event.target.value);
            console.log("选择的底色:", event.target.value);
        };
        input.click();
    };

    const handleRemoveBackground = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const [targetR, targetG, targetB] = hexToRgb(backgroundColor);
                const threshold = 50; // 颜色差异阈值

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // 计算颜色差异（曼哈顿距离）
                    const delta = Math.abs(r - targetR) +
                        Math.abs(g - targetG) +
                        Math.abs(b - targetB);

                    if (delta < threshold) {
                        data[i + 3] = 0; // 设置透明
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                console.log("去除底色及相近颜色");
            }
        }
    };

    const hexToRgb = (hex: string): [number, number, number] => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
    };

    const handleSaveImage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = 'canvas-image.png';
            link.click();
        }
    };

    return (
        <>
            <canvas ref={canvasRef} style={{
                border: '1px solid #000',
                backgroundImage: 'conic-gradient(#eee 0 25%, white 0 50%, #eee 0 75%, white 0)',
                backgroundSize: '16px 16px',
                width: '100%'
            }}></canvas>

            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={handleOpenImage}>打开图片</Button>
                    <Button variant="light" className="border" onClick={handleSelectBackground}>指定底色</Button>
                    <Button variant="light" className="border" onClick={handleRemoveBackground}>去除底色</Button>
                    <Button variant="light" className="border" onClick={handleSaveImage}>保存图片</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default RemoveBgPage
