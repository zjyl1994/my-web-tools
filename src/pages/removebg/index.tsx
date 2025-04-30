import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import React, { useRef, useEffect, useState } from 'react';
import { AutoModel, AutoProcessor, RawImage, PreTrainedModel, Processor,env } from "@huggingface/transformers";

env.allowLocalModels = false;

const RemoveBgPage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const modelRef = useRef<PreTrainedModel>(null);
    const processorRef = useRef<Processor>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [statusText, setStatusText] = useState('Loading');

    useEffect(() => {
        (async () => {
            try {
                const model_id = "briaai/RMBG-1.4";
                modelRef.current ??= await AutoModel.from_pretrained(model_id, {
                    config: {
                        model_type: "custom",
                        is_encoder_decoder: false, // 假设默认值为 false，可根据实际情况调整
                        max_position_embeddings: 0, // 假设默认值为 0，可根据实际情况调整
                        'transformers.js_config': {}, // 假设为空对象，可根据实际情况调整
                        normalized_config: {} // 假设为空对象，可根据实际情况调整
                    },
                });
                processorRef.current ??= await AutoProcessor.from_pretrained(model_id, {
                    config: {
                        do_normalize: true,
                        do_pad: false,
                        do_rescale: true,
                        do_resize: true,
                        image_mean: [0.5, 0.5, 0.5],
                        feature_extractor_type: "ImageFeatureExtractor",
                        image_std: [1, 1, 1],
                        resample: 2,
                        rescale_factor: 0.00392156862745098,
                        size: { width: 1024, height: 1024 },
                    },
                });
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
        const model = modelRef.current;
        const processor = processorRef.current;
        if (canvas && model && processor) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const img = RawImage.fromCanvas(canvas)
                
                setStatusText("Analysing...")
                const { pixel_values } = await processor(img);

                const { output } = await model({ input: pixel_values });

                const maskData = (
                    await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
                        img.width,
                        img.height,
                    )
                ).data;

                const pixelData = ctx.getImageData(0, 0, img.width, img.height);
                for (let i = 0; i < maskData.length; ++i) {
                    pixelData.data[4 * i + 3] = maskData[i];
                }
                ctx.putImageData(pixelData, 0, 0);
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
