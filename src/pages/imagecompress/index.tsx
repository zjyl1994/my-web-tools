import { useEffect, useRef, useState } from 'react';
import { Button, Card } from '@/components/ui';
import './style.css';

type Format = 'png' | 'jpeg' | 'webp';
type Source = { file: File; image: HTMLImageElement };
type Output = { blob: Blob; source: Source; scale: number; format: Format };

function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageCompressPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [scale, setScale] = useState(100);
  const [format, setFormat] = useState<Format>('webp');
  const [output, setOutput] = useState<Output | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function openImage(next: File) {
    setLoading(true);
    setSource(null);
    setError('');
    setFile(next);
  }

  useEffect(() => {
    function pasteImage(event: ClipboardEvent) {
      const image = Array.from(event.clipboardData?.files ?? []).find((item) =>
        ['image/png', 'image/jpeg', 'image/webp'].includes(item.type),
      );
      if (!image) return;
      event.preventDefault();
      openImage(image);
    }
    document.addEventListener('paste', pasteImage);
    return () => document.removeEventListener('paste', pasteImage);
  }, []);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      const initialScale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight)) * 100;
      setSource({ file, image });
      setScale(initialScale);
      setLoading(false);
    };
    image.onerror = () => {
      if (cancelled) return;
      setError('图片读取失败，请选择有效的 PNG、JPG 或 WEBP 图片。');
      setLoading(false);
    };
    image.src = url;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const width = source ? Math.max(1, Math.round(source.image.naturalWidth * scale / 100)) : 0;
  const height = source ? Math.max(1, Math.round(source.image.naturalHeight * scale / 100)) : 0;

  useEffect(() => {
    if (!source) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setError('');
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('无法创建画布');
        if (format === 'jpeg') {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(source.image, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (cancelled) return;
          if (!blob || blob.type !== `image/${format}`) {
            setError('当前浏览器无法导出该格式，请切换格式或减小缩放比例。');
            return;
          }
          setOutput({ blob, source, scale, format });
        }, `image/${format}`, 0.9);
      } catch {
        if (!cancelled) setError('图片处理失败，请减小缩放比例或换一张图片。');
      }
    }, 100);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [source, scale, format, width, height]);

  const currentOutput = output?.source === source && output.scale === scale && output.format === format ? output : null;
  const saving = source && !currentOutput && !error;
  const difference = source && currentOutput ? (1 - currentOutput.blob.size / source.file.size) * 100 : null;

  function download() {
    if (!currentOutput || !source) return;
    const url = URL.createObjectURL(currentOutput.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${source.file.name.replace(/\.[^.]+$/, '')}-${width}x${height}.${format === 'jpeg' ? 'jpg' : format}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="image-compress">
      <div className="image-compress-heading">
        <div><h1>图片压缩</h1><p>缩小尺寸，轻装分享。图片仅在本机处理。</p></div>
        <Button onClick={() => inputRef.current?.click()}>{source ? '更换图片' : '选择图片'}</Button>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" hidden onChange={(event) => {
          const next = event.target.files?.[0];
          event.target.value = '';
          if (!next) return;
          if (!['image/png', 'image/jpeg', 'image/webp'].includes(next.type)) {
            setError('请选择 PNG、JPG 或 WEBP 格式的图片。');
            return;
          }
          openImage(next);
        }} />
      </div>
      <Card>
        <div className="image-compress-preview" aria-busy={Boolean(loading || saving)}>
          <canvas ref={canvasRef} hidden={!source} aria-label="缩放后的图片预览" />
          {!source && <button type="button" className="image-compress-empty" disabled={loading} onClick={() => inputRef.current?.click()}><span aria-hidden="true">▧</span><span>{loading ? '正在读取图片…' : '点击选择图片，或 Ctrl / Cmd + V 粘贴'}</span><small>支持 PNG / JPG / WEBP</small></button>}
        </div>
        <Card.Body>
          <input id="image-scale" aria-label="缩放比例" className="image-compress-slider" type="range" min="0.01" max="100" step="any" value={scale} disabled={!source} onChange={(event) => setScale(Number(event.target.value))} />
          <div className="image-compress-hint"><span>0.01%</span><output htmlFor="image-scale">{Number(scale.toFixed(2))}%</output><span>100%</span></div>
          <dl className="image-compress-stats">
            <div><dt>原始分辨率</dt><dd>{source ? `${source.image.naturalWidth} × ${source.image.naturalHeight}` : '—'}</dd></div>
            <div><dt>缩放后分辨率</dt><dd>{source ? `${width} × ${height}` : '—'}</dd></div>
            <div><dt>原图尺寸</dt><dd>{source ? fileSize(source.file.size) : '—'}</dd></div>
            <div><dt>缩放后尺寸</dt><dd aria-live="polite">{currentOutput ? fileSize(currentOutput.blob.size) : saving ? '计算中…' : '—'}</dd></div>
          </dl>
          <div className="image-compress-footer">
            <fieldset><legend>保存格式</legend>{(['png', 'jpeg', 'webp'] as const).map((item) => <label key={item}><input type="radio" name="image-format" value={item} checked={format === item} onChange={() => setFormat(item)} />{item === 'jpeg' ? 'JPG' : item.toUpperCase()}</label>)}</fieldset>
            <Button className="image-compress-download" disabled={!currentOutput || loading || Boolean(error)} onClick={download}>下载图片</Button>
          </div>
          <div className="image-compress-summary">
            <p className="image-compress-note" aria-live="polite">{difference !== null && (difference >= 0 ? `体积减少 ${difference.toFixed(1)}%` : `体积增加 ${Math.abs(difference).toFixed(1)}%，可尝试其他格式或继续缩小尺寸。`)}</p>
            <p className="image-compress-note image-compress-summary-help">{format === 'jpeg' ? 'JPG 使用白色背景填充透明区域。' : 'PNG 和 WEBP 保留透明背景。'} JPG / WEBP 导出质量为 90%。</p>
          </div>
          {error && <p className="image-compress-error" role="alert">{error}</p>}
        </Card.Body>
      </Card>
    </div>
  );
}
