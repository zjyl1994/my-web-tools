import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React, { useRef, useEffect, useState } from 'react';
import { pipeline, env, RawImage, BackgroundRemovalPipeline } from "@huggingface/transformers";

env.allowLocalModels = false;
if (env.backends.onnx.wasm?.proxy)
    env.backends.onnx.wasm.proxy = true;

const RemoveBgPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const segmenterRef = useRef<BackgroundRemovalPipeline>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusText, setStatusText] = useState('Loading');

    useEffect(() => {
        (async () => {
            try {
                const model_id = "briaai/RMBG-1.4";
                segmenterRef.current ??= await pipeline('background-removal', model_id);
            } catch (err) {
                setStatusText(err instanceof Error ? err.message : String(err));
            }
            setIsLoading(false);
            setStatusText("Ready");
        })();
    }, []);

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

    const handleRemoveBackground = async () => {
        const canvas = canvasRef.current;
        const segmenter = segmenterRef.current;
        if (canvas && segmenter) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = await RawImage.fromURL(canvas.toDataURL())
                setStatusText("Analysing...")
                const output = await segmenter(img);
                ctx.putImageData(output[0].toCanvas(), 0, 0);
                setStatusText("Done")
            }
        }
    };

    const handleSaveImage = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = 'removebg.png';
            link.click();
        }
    };

    return (
        <>
            <canvas ref={canvasRef} style={{
                border: '1px solid #000',
                backgroundImage: 'conic-gradient(#eee 0 25%, white 0 50%, #eee 0 75%, white 0)',
                backgroundSize: '16px 16px',
                maxWidth: '100%',
                maxHeight: '400px',
            }}></canvas>

            <div>Load: {isLoading ? 'loading' : 'finished'}</div>
            <div>Status: {statusText}</div>
            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={handleOpenImage}>打开图片</Button>
                    <Button variant="light" className="border" onClick={handleRemoveBackground}>去除底色</Button>
                    <Button variant="light" className="border" onClick={handleSaveImage}>保存图片</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default RemoveBgPage;
