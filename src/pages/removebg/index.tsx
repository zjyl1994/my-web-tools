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
                const [r, g, b] = hexToRgb(backgroundColor);

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] === r && data[i + 1] === g && data[i + 2] === b) {
                        data[i + 3] = 0; // 设置 alpha 通道为 0，表示透明
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                console.log("去除底色");
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
            <canvas ref={canvasRef} style={{ border: '2px dashed #000' }}></canvas>

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
