import dayjs from 'dayjs';
import { useState } from 'react';
import ToolIcon from '@/components/layout/tool-icon';
import { tools } from '@/components/layout/tools';
import { Button } from '@/components/ui';
import type { usePwaInstall } from '@/hooks/use-pwa-install';
import { checkForPwaUpdate } from '@/utils/pwa-update';
import './style.css';

const installHelp = '请在浏览器菜单中选择「安装应用」，或在 Safari 的分享菜单中选择「添加到主屏幕」。';

export default function AboutPage({ install, installed }: ReturnType<typeof usePwaInstall>) {
    const buildTime = dayjs(__BUILD_TIMESTAMP__);
    const [pending, setPending] = useState<'install' | 'update' | null>(null);
    const [status, setStatus] = useState('');

    async function handleInstall() {
        setPending('install');
        setStatus('');
        try {
            const result = await install();
            if (result === 'manual') setStatus(installHelp);
            if (result === 'accepted') setStatus('已确认安装。');
            if (result === 'dismissed') setStatus('已取消安装。' + installHelp);
        } catch {
            setStatus('未能打开安装提示。' + installHelp);
        } finally {
            setPending(null);
        }
    }

    async function handleUpdate() {
        const page = window.location.pathname;
        setPending('update');
        setStatus('');
        try {
            const result = await checkForPwaUpdate();
            if (result === 'updated') {
                if (window.location.pathname === page) window.location.reload();
                return;
            }
            setStatus(result === 'current' ? '当前已是最新版本。' : '更新服务暂不可用，请刷新页面后重试。');
        } catch {
            setStatus('检查更新失败，请稍后重试。');
        } finally {
            setPending(null);
        }
    }

    return <div className="about-page">
        <section className="about-overview" aria-labelledby="about-project-title">
            <img src={__SITE__.icon} width="56" height="56" alt="" />
            <div>
                <h2 id="about-project-title">{__SITE__.name}</h2>
                <p>基于 React 与 Vite 开发的在线工具集合，提供文本处理、数据转换、图片处理与日常计算功能。</p>
            </div>
        </section>

        <section className="about-section" aria-label="应用安装与更新">
            <div className="about-app-actions">
                <Button variant="primary" disabled={installed || pending !== null} onClick={handleInstall}>
                    <ToolIcon name="download" />{installed ? '已安装' : pending === 'install' ? '安装中…' : '安装应用'}
                </Button>
                <Button disabled={pending !== null} onClick={handleUpdate}>
                    <ToolIcon name="refresh" />{pending === 'update' ? '检查中…' : '检查更新'}
                </Button>
            </div>
            <p className="about-app-status" role="status">{status}</p>
        </section>

        <section className="about-section" aria-labelledby="about-build-title">
            <h2 id="about-build-title">构建信息</h2>
            <dl className="about-facts">
                <div><dt>工具数量</dt><dd>{tools.length}</dd></div>
                <div><dt>构建时间</dt><dd><time dateTime={buildTime.toISOString()}>{buildTime.format('YYYY-MM-DD HH:mm:ss Z')}</time></dd></div>
            </dl>
        </section>
        <footer className="about-footer">
            <a href="https://github.com/zjyl1994/my-web-tools">查看源码</a>
        </footer>
    </div>;
}
