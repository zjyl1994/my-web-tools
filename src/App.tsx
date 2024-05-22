import { Routes, Route, Link, useMatch } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import FrontPage from '@/pages/frontpage';
import JsonPage from '@/pages/json';
import EncoderPage from '@/pages/encoder';
import KcalCalcPage from '@/pages/kcal';
import CodeCalcPage from '@/pages/code';
import SQLFmtPage from '@/pages/sqlfmt';
import TextProcPage from '@/pages/textproc';
import LotteryPage from '@/pages/lottery';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import dayjs from 'dayjs'

function App() {
  return (
    <>
      <Navbar expand="lg" sticky="top" bg="light" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src="/android-chrome-192x192.png" width="30" height="30" className="d-inline-block align-top me-2" />
            <span>鱼 sifu 工具包</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/json" active={Boolean(useMatch('/json'))} eventKey="json">JSON</Nav.Link>
              <Nav.Link as={Link} to="/encoder" active={Boolean(useMatch('/encoder'))} eventKey="encoder">编解码</Nav.Link>
              <Nav.Link as={Link} to="/textproc" active={Boolean(useMatch('/textproc'))} eventKey="textproc">文本处理</Nav.Link>
              <Nav.Link as={Link} to="/kcal" active={Boolean(useMatch('/kcal'))} eventKey="kcal">大卡计算</Nav.Link>
              <NavDropdown title="其他" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/code" active={Boolean(useMatch('/code'))} eventKey="code">密码机</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/sqlfmt" active={Boolean(useMatch('/sqlfmt'))} eventKey="sqlfmt">SQL 格式化</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/lottery" active={Boolean(useMatch('/lottery'))} eventKey="lottery">彩票选号机</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="my-3">
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/json" element={<JsonPage />} />
          <Route path="/encoder" element={<EncoderPage />} />
          <Route path="/kcal" element={<KcalCalcPage />} />
          <Route path="/code" element={<CodeCalcPage />} />
          <Route path="/sqlfmt" element={<SQLFmtPage />} />
          <Route path="/textproc" element={<TextProcPage />} />
          <Route path="/lottery" element={<LotteryPage />} />
        </Routes>
        <footer className="text-center mt-2" style={{ color: 'grey' }}>BUILD_TIME: {dayjs(BUILD_DATE).format('YYYY-MM-DD HH:mm:ss')}</footer>
      </Container>
      <ToastContainer />
    </>
  )
}

export default App;