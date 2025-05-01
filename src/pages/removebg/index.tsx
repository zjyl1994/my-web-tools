import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React, { useRef, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { pipeline, env, BackgroundRemovalPipeline, RawImage } from "@huggingface/transformers";

env.allowLocalModels = false;

const RemoveBgPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const segmenterRef = useRef<BackgroundRemovalPipeline>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const model_id = "briaai/RMBG-1.4";
                const rmbgPipeline = await toast.promise(pipeline('background-removal', model_id, { device: "auto" }),
                    {
                        pending: '端侧模型加载中，可能较慢...',
                        success: '端侧模型加载成功',
                        error: '端侧模型加载失败'
                    });
                segmenterRef.current = rmbgPipeline;
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
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
                setIsLoading(true);
                try {
                    const img = RawImage.fromCanvas(canvas);
                    const output = await toast.promise(segmenter(img), {
                        pending: '处理中...',
                        success: '处理完毕',
                        error: '处理失败'
                    });
                    ctx.clearRect(0, 0, img.width, img.height);
                    ctx.drawImage(output[0].toCanvas(), 0, 0);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
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
                backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURb+/v////5nD/3QAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAUSURBVBjTYwABQSCglEENMxgYGAAynwRB8BEAgQAAAABJRU5ErkJggg==")',
                maxWidth: '100%',
                maxHeight: '400px',
            }}></canvas>
            <ButtonToolbar>
                <ButtonGroup className="me-2 mt-2">
                    <Button variant="light" className="border" onClick={handleOpenImage}>打开图片</Button>
                    <Button variant="light" className="border" onClick={handleRemoveBackground} disabled={isLoading || !Boolean(segmenterRef.current)}>去除背景</Button>
                    <Button variant="light" className="border" onClick={handleSaveImage}>保存图片</Button>
                </ButtonGroup>
            </ButtonToolbar>
        </>
    )
}

export default RemoveBgPage;
