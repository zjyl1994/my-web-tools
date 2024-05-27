import dayjs from 'dayjs'

const AboutPage: React.FC = () => {

    return (
        <>
            <h1>关于</h1>
            <hr />

            <p>日常开发中经常使用一系列 Web 工具，但是常见的工具较为散乱，且并不支持例如格式化内嵌了 JSON 字符串的 JSON 这种常见需求。</p>
            <p>正巧借着学习 React 的机会，把之前使用 Alpine.js 编写的工具站以现代前端技术重构，整合常见工具为单一站点，大大方便日常开发过程中的数据处理和变换。</p>

            <br />
            <div>构建时间: {dayjs(__BUILD_TIMESTAMP__).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div>源码：<a className="link-dark" href="https://github.com/zjyl1994/my-web-tools">my-web-tools</a></div>
            <div>作者：<a className="link-dark" href="https://www.zjyl1994.com/">zjyl1994</a></div>
            <div>特别感谢：<a className="link-dark" href="https://github.com/rexskz">RexSkz</a></div>
            <div>本站已支持 PWA 可以安装为桌面应用程序。</div>
        </>
    )
}

export default AboutPage
