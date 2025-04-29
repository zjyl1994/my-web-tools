import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React, { useRef, useState } from 'react';
import { performFloodFill } from './utils';

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
                const [targetR, targetG, targetB] = hexToRgb(backgroundColor);

                // 从四个角开始 Flood Fill
                const corners = [
                    [0, 0],  // 左上角
                    [canvas.width - 1, 0],  // 右上角
                    [0, canvas.height - 1],  // 左下角
                    [canvas.width - 1, canvas.height - 1]  // 右下角
                ];

                corners.forEach(([x, y]) => {
                    performFloodFill(imageData, canvas.width, canvas.height, targetR, targetG, targetB, 50, x, y);
                });

                ctx.putImageData(imageData, 0, 0);
                console.log("基于Flood Fill去除底色");
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


export default RemoveBgPage;
