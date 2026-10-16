import dayjs from 'dayjs';
import { tools } from '@/components/layout/tools';
import './style.css';

const projectLinks = [
    { title: '源代码', detail: 'GitHub · zjyl1994/my-web-tools', href: 'https://github.com/zjyl1994/my-web-tools' },
    { title: '更新记录', detail: '查看项目提交历史', href: 'https://github.com/zjyl1994/my-web-tools/commits' },
    { title: '开源协议', detail: 'GNU GPL v3', href: 'https://github.com/zjyl1994/my-web-tools/blob/master/LICENSE' },
    { title: '作者主页', detail: 'zjyl1994', href: 'https://www.zjyl1994.com/' },
];

export default function AboutPage() {
    const buildTime = dayjs(__BUILD_TIMESTAMP__);
    return <div className="about-page">
        <section className="about-overview" aria-labelledby="about-project-title">
            <img src="/images/android-chrome-192x192.png" width="56" height="56" alt="" />
            <div>
                <h2 id="about-project-title">MyWebTools</h2>
                <p>基于 React 与 Vite 开发的在线工具集合，提供文本处理、数据转换、图片处理与日常计算功能。</p>
            </div>
        </section>

        <section className="about-section" aria-labelledby="about-usage-title">
            <h2 id="about-usage-title">使用与安装</h2>
            <dl className="about-facts">
                <div><dt>工具导航</dt><dd>通过侧边导航选择工具，或使用 Ctrl / ⌘ K 搜索。</dd></div>
                <div><dt>本地保存</dt><dd>部分工具会在当前浏览器中保存输入与设置。清除站点数据会移除这些记录。</dd></div>
                <div><dt>安装应用</dt><dd>支持 PWA。可通过浏览器的安装应用或添加到主屏幕功能安装，具体入口取决于浏览器。</dd></div>
            </dl>
        </section>

        <section className="about-section" aria-labelledby="about-links-title">
            <h2 id="about-links-title">项目链接</h2>
            <div className="about-project-links">
                {projectLinks.map(link => <a key={link.href} href={link.href}>
                    <span><strong>{link.title}</strong><small>{link.detail}</small></span>
                    <span aria-hidden="true">↗</span>
                </a>)}
            </div>
        </section>

        <section className="about-section" aria-labelledby="about-build-title">
            <h2 id="about-build-title">构建信息</h2>
            <dl className="about-facts">
                <div><dt>工具数量</dt><dd>{tools.length}</dd></div>
                <div><dt>构建时间</dt><dd><time dateTime={buildTime.toISOString()}>{buildTime.format('YYYY-MM-DD HH:mm:ss Z')}</time></dd></div>
            </dl>
        </section>
        <p className="about-credit">感谢 <a href="https://www.rexskz.info/">RexSkz</a> 参与部分代码重构。</p>
    </div>;
}
