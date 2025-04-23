import dayjs from 'dayjs'
import ReactMarkdown from 'react-markdown'

const AboutPage: React.FC = () => {
    return (
        <>
            <ReactMarkdown>{__README_CONTENT__}</ReactMarkdown>
            <hr />
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
