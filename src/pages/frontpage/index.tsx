import { Link } from 'react-router-dom';
import ToolIcon from '@/components/layout/tool-icon';
import { tools, toolGroups } from '@/components/layout/tools';

export default function FrontPage() {
  return (
    <div className="home-page">
      <section className="tool-directory" aria-labelledby="tool-directory-title">
        <div className="section-heading"><h1 id="tool-directory-title">全部工具</h1><span>{tools.length} 个工具</span></div>
        {toolGroups.map((group) => (
          <div className="directory-group" key={group}>
            <h2>{group}</h2>
            <div className="tool-directory-grid">
              {tools.filter((tool) => tool.group === group).map((tool) => (
                <Link className="tool-directory-item" to={tool.path} key={tool.path}>
                  <span className="tool-directory-icon"><ToolIcon name={tool.icon} /></span>
                  <span className="tool-directory-copy"><strong>{tool.title}</strong><span>{tool.description}</span></span>
                  <ToolIcon name="arrow" className="tool-directory-arrow" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

    </div>
  );
}
