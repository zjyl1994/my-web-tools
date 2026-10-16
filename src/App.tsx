import { Suspense, lazy, useEffect, useState } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Tooltip } from '@base-ui/react/tooltip';
import { Routes, Route, Link, useLocation } from "react-router-dom";

import FrontPage from '@/pages/frontpage';
import KcalCalcPage from '@/pages/kcal';
import AboutPage from '@/pages/about';
import ToolIcon from '@/components/layout/tool-icon';
import ToolNavItem from '@/components/layout/tool-nav-item';
import ToolSearch from '@/components/layout/tool-search';
import ToolDescription from '@/components/layout/tool-description';
import { useStoredState } from '@/hooks/use-stored-state';
import { tools, toolGroups } from '@/components/layout/tools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TimestampPage = lazy(() => import('./pages/timestamp'));
const RandomPage = lazy(() => import('./pages/random'));
const UuidPage = lazy(() => import('./pages/uuid'));
const ComparePage = lazy(() => import('./pages/compare'));
const JsonPage = lazy(() => import('./pages/json'));
const EncoderPage = lazy(() => import('./pages/encoder'));
const TextProcPage = lazy(() => import('./pages/textproc'));
const CodeCalcPage = lazy(() => import('./pages/code'));
const SQLFmtPage = lazy(() => import('./pages/sqlfmt'));
const LotteryPage = lazy(() => import('./pages/lottery'));
const LazyGoPage = lazy(() => import('./pages/lazygo'));
const PriceCalcPage = lazy(() => import('./pages/pricecalc'));
const JwtPage = lazy(() => import('./pages/jwt'));
const BarcodePage = lazy(() => import('./pages/barcode'));
const ImageCompressPage = lazy(() => import('./pages/imagecompress'));

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

function App() {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useStoredState('layout.sidebarExpanded', false);
  const [navOpenPath, setNavOpenPath] = useState<string | null>(null);
  const navOpen = navOpenPath === location.pathname;
  const currentTool = tools.find((tool) => tool.path === location.pathname);
  const isHome = location.pathname === '/';

  useEffect(() => {
    document.title = `${currentTool?.title ?? (isHome ? '工具总览' : '关于')} · ${__SITE__.name}`;
  }, [currentTool, isHome]);

  const navigation = (
    <Tooltip.Provider delay={300}><nav className="tool-navigation" aria-label="工具导航">
      <ToolNavItem to="/" label="工具总览" icon="home" expanded={sidebarExpanded} />
      {toolGroups.map((group) => (
        <div className="tool-nav-group" key={group}>
          <div className="tool-nav-group-label">{group}</div>
          {tools.filter((tool) => tool.group === group).map((tool) => (
            <ToolNavItem key={tool.path} to={tool.path} label={tool.title} icon={tool.icon} expanded={sidebarExpanded} />
          ))}
        </div>
      ))}
      <div className="tool-nav-group">
        <ToolNavItem to="/about" label="关于工具包" icon="info" expanded={sidebarExpanded} />
      </div>
    </nav></Tooltip.Provider>
  );

  return (
    <>
      <a className="app-skip-link" href="#main-content">跳转到内容</a>
      <header className="app-shell-header">
        <div className="app-shell-header-row">
          <Link className="app-brand" to="/">
            <img src={__SITE__.icon} width="32" height="32" alt="" />
            <span title={__SITE__.name}>{__SITE__.name}</span>
          </Link>
          <ToolSearch />
          <button type="button" className="app-nav-toggle" aria-label="打开工具导航" aria-controls="app-mobile-drawer" aria-expanded={navOpen} onClick={() => setNavOpenPath(navOpen ? null : location.pathname)}>
            <span className="app-nav-toggle-icon" aria-hidden="true"><span /><span /><span /></span>
          </button>
        </div>
      </header>
      <Dialog.Root
        open={navOpen}
        onOpenChange={(open) => setNavOpenPath(open ? location.pathname : null)}
      >
        <Dialog.Portal>
          <div className="app-mobile-drawer-layer">
            <Dialog.Backdrop className="app-mobile-drawer-backdrop" />
            <Dialog.Popup id="app-mobile-drawer" className="app-mobile-drawer" aria-label="移动端导航">
              <div className="app-mobile-drawer__header">
                <div className="app-mobile-drawer__title">菜单</div>
                <Dialog.Close className="ui-close-button" aria-label="关闭菜单">
                  <span aria-hidden="true">×</span>
                </Dialog.Close>
              </div>
              <div className="app-mobile-drawer__body">{navigation}</div>
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
      <div className={cn('app-layout', sidebarExpanded && 'is-sidebar-expanded')}>
        <aside id="app-desktop-sidebar" className="app-sidebar">
          <button
            type="button"
            className="app-sidebar-toggle"
            aria-label={sidebarExpanded ? '收起导航' : '展开导航'}
            title={sidebarExpanded ? '收起导航' : '展开导航'}
            aria-expanded={sidebarExpanded}
            aria-controls="app-desktop-sidebar"
            onClick={() => setSidebarExpanded((expanded) => !expanded)}
          >
            <ToolIcon name="sidebar" /><span>收起导航</span>
          </button>
          {navigation}
        </aside>
        <main id="main-content" className="app-shell-content" tabIndex={-1}>
          {!isHome && <div className="page-heading">
            <h1>{currentTool?.title ?? '关于工具包'}</h1>
            {currentTool?.description && <ToolDescription key={currentTool.path} title={currentTool.title} description={currentTool.description} />}
          </div>}
          <div className={cn('page-workspace', currentTool && `page-workspace--${currentTool.layout}`, location.pathname === '/about' && 'page-workspace--about')}>
            <Suspense fallback={<div className="page-loading" role="status">正在加载工具…</div>}>
              <Routes>
                <Route path="/" element={<FrontPage />} />
                <Route path="/timestamp" element={<TimestampPage />} />
                <Route path="/random" element={<RandomPage />} />
                <Route path="/uuid" element={<UuidPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/json" element={<JsonPage />} />
                <Route path="/encoder" element={<EncoderPage />} />
                <Route path="/kcal" element={<KcalCalcPage />} />
                <Route path="/code" element={<CodeCalcPage />} />
                <Route path="/sqlfmt" element={<SQLFmtPage />} />
                <Route path="/textproc" element={<TextProcPage />} />
                <Route path="/lottery" element={<LotteryPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/lazygo" element={<LazyGoPage />} />
                <Route path="/pricecalc" element={<PriceCalcPage />} />
                <Route path="/jwt" element={<JwtPage />} />
                <Route path="/imagecompress" element={<ImageCompressPage />} />
                <Route path="/qrcode" element={<BarcodePage />} />
              </Routes>
            </Suspense>
          </div>
          <footer className="app-footer"><span>{__SITE__.name}</span></footer>
        </main>
      </div>
      <ToastContainer />
    </>
  )
}

export default App;
