import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Menu } from '@base-ui/react/menu';
import { Routes, Route, Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import FrontPage from '@/pages/frontpage';
import JsonPage from '@/pages/json';
import EncoderPage from '@/pages/encoder';
import KcalCalcPage from '@/pages/kcal';
import TextProcPage from '@/pages/textproc';
import AboutPage from '@/pages/about';
import { Container } from '@/components/ui';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CodeCalcPage = lazy(() => import('./pages/code'));
const SQLFmtPage = lazy(() => import('./pages/sqlfmt'));
const LotteryPage = lazy(() => import('./pages/lottery'));
const LazyGoPage = lazy(() => import('./pages/lazygo'));
const PriceCalcPage = lazy(() => import('./pages/pricecalc'));
const JwtPage = lazy(() => import('./pages/jwt'));
const RemoveBgPage = lazy(() => import('./pages/removebg'));

const primaryLinks = [
  { to: '/json', label: 'JSON' },
  { to: '/encoder', label: '编解码' },
  { to: '/textproc', label: '文本处理' },
  { to: '/kcal', label: '大卡计算' },
];

const otherLinks = [
  { to: '/code', label: '密码机' },
  { to: '/lazygo', label: 'Go 生成器' },
  { to: '/sqlfmt', label: 'SQL 格式化' },
  { to: '/lottery', label: '彩票选号机' },
  { to: '/pricecalc', label: '比价计算机' },
  { to: '/jwt', label: 'JWT 生成器' },
  { to: '/removebg', label: '去底速刷' },
];

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  const otherActive = useMemo(
    () => otherLinks.some((item) => item.to === location.pathname),
    [location.pathname],
  );

  return (
    <>
      <header className="app-shell-header">
        <Container>
          <div className="app-shell-header-row">
            <Link className="app-brand" to="/">
              <img src="/images/android-chrome-192x192.png" width="30" height="30" className="d-inline-block align-top me-2" />
              <span className={cn('app-brand-label', location.pathname === '/' && 'is-active')}>鱼 sifu 工具包</span>
            </Link>
            <button
              type="button"
              className="app-nav-toggle"
              aria-controls="app-nav-panel"
              aria-expanded={navOpen}
              onClick={() => setNavOpen((open) => !open)}
            >
              菜单
            </button>
            <div id="app-nav-panel" className={cn('app-nav-panel', navOpen && 'is-open')}>
              <nav className="app-nav" aria-label="主导航">
                <div className="app-nav-section">
                  {primaryLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) => cn('app-nav-link', isActive && 'is-active')}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                  <Menu.Root modal={false}>
                    <Menu.Trigger className={cn('app-nav-trigger', otherActive && 'is-active')}>
                      其他
                      <span className="app-nav-caret" aria-hidden="true">▾</span>
                    </Menu.Trigger>
                    <Menu.Portal>
                      <Menu.Positioner align="start" sideOffset={8}>
                        <Menu.Popup className="ui-dropdown-menu app-nav-dropdown">
                          {otherLinks.map((item) => (
                            <Menu.Item
                              key={item.to}
                              className={cn('app-nav-dropdown-item', location.pathname === item.to && 'is-active')}
                              onClick={() => navigate(item.to)}
                            >
                              {item.label}
                            </Menu.Item>
                          ))}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                </div>
                <div className="app-nav-section app-nav-section--end">
                  <NavLink to="/about" className={({ isActive }) => cn('app-nav-link', isActive && 'is-active')}>
                    关于
                  </NavLink>
                </div>
              </nav>
            </div>
          </div>
        </Container>
      </header>
      <Container className="my-3">
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/json" element={<JsonPage />} />
          <Route path="/encoder" element={<EncoderPage />} />
          <Route path="/kcal" element={<KcalCalcPage />} />
          <Route path="/code" element={<Suspense><CodeCalcPage /></Suspense>} />
          <Route path="/sqlfmt" element={<Suspense><SQLFmtPage /></Suspense>} />
          <Route path="/textproc" element={<TextProcPage />} />
          <Route path="/lottery" element={<Suspense><LotteryPage /></Suspense>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/lazygo" element={<Suspense><LazyGoPage /></Suspense>} />
          <Route path="/pricecalc" element={<Suspense><PriceCalcPage /></Suspense>} />
          <Route path="/jwt" element={<Suspense><JwtPage /></Suspense>} />
          <Route path="/removebg" element={<Suspense><RemoveBgPage /></Suspense>} />
        </Routes>
      </Container>
      <ToastContainer />
    </>
  )
}

export default App;
