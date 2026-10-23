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
import { useStoredState } from '@/hooks/use-stored-state';
import { usePrefersDark } from '@/hooks/use-prefers-dark';
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

function PageSkeleton() {
  return (
    <div className="page-skeleton" role="status">
      <span className="app-visually-hidden">正在加载工具…</span>
      <span className="page-skeleton__bar page-skeleton__bar--block" />
      <span className="page-skeleton__bar page-skeleton__bar--line-wide" />
      <span className="page-skeleton__bar page-skeleton__bar--line" />
    </div>
  );
}

function App() {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useStoredState('layout.sidebarExpanded', window.matchMedia('(min-width: 1181px)').matches);
  const [navOpenPath, setNavOpenPath] = useState<string | null>(null);
  const prefersDark = usePrefersDark();
  const navOpen = navOpenPath === location.pathname;
  const currentTool = tools.find((tool) => tool.path === location.pathname);
  const isHome = location.pathname === '/';
  const pageTitle = currentTool?.title ?? (isHome ? '工具总览' : '关于工具包');

  useEffect(() => {
    document.title = `${pageTitle} · ${__SITE__.name}`;
  }, [pageTitle]);

  const navigation = (
    <Tooltip.Provider delay={300}><nav className="tool-navigation" aria-label="工具导航">
      <ToolNavItem to="/" label="工具总览" icon="home" expanded={sidebarExpanded} />
      {toolGroups.map((group) => (
        <div className="tool-nav-group" role="group" aria-label={group} key={group}>
          <div className="tool-nav-group-label" aria-hidden="true">{group}</div>
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
            <Dialog.Popup id="app-mobile-drawer" className="app-mobile-drawer">
              <div className="app-mobile-drawer__header">
                <Dialog.Title className="app-mobile-drawer__title">工具导航</Dialog.Title>
                <Dialog.Close className="ui-close-button" aria-label="关闭工具导航">
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
            onClick={() => setSidebarExpanded((expanded) => !expanded)}
          >
            <ToolIcon name="sidebar" /><span>{sidebarExpanded ? '收起导航' : '展开导航'}</span>
          </button>
          {navigation}
        </aside>
        <main id="main-content" className="app-shell-content" tabIndex={-1}>
          <div className={cn(
            'page-shell',
            isHome && 'page-shell--home',
            currentTool && `page-shell--${currentTool.layout}`,
            location.pathname === '/about' && 'page-shell--about',
          )}>
            {!isHome && <div className="page-heading">
              <h1>{pageTitle}</h1>
              {currentTool?.description && <p className="page-heading__description">{currentTool.description}</p>}
            </div>}
            <div className={cn('page-workspace', currentTool && `page-workspace--${currentTool.layout}`, location.pathname === '/about' && 'page-workspace--about')}>
              <Suspense fallback={<PageSkeleton />}>
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
          </div>
        </main>
      </div>
      <ToastContainer theme={prefersDark ? 'dark' : 'light'} limit={3} />
    </>
  )
}

export default App;
