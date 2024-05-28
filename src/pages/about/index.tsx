import dayjs from 'dayjs'

const AboutPage: React.FC = () => {

    return (
        <>
            <h1>关于</h1>
            <hr />

            <p>Hello world!</p>
            <p>这是我用 React 构建的第一个完整 Web 应用程序，整合了一些工作中常见的在线工具。</p>
            <p>如果觉得好用，欢迎分享给你的朋友们，让他们省事省力一起早点下班。</p>

            <br />
            <div>构建时间: {dayjs(__BUILD_TIMESTAMP__).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div>源码：<a className="link-dark" href="https://github.com/zjyl1994/my-web-tools">my-web-tools</a></div>
            <div>开源协议：<a className="link-dark" href="https://github.com/zjyl1994/my-web-tools/blob/master/LICENSE">GPL v3</a></div>
            <div>作者主页：<a className="link-dark" href="https://www.zjyl1994.com/">zjyl1994</a></div>
            <div>特别感谢：<a className="link-dark" href="https://www.rexskz.info/">RexSkz</a></div>
            <div>(本站已支持 PWA 可以安装为桌面应用程序)</div>
        </>
    )
}

export default AboutPage
