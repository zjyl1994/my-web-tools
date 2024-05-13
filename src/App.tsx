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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" sticky="top" collapseOnSelect>
        <Container>
          <Navbar.Brand as={Link} to="/">鱼 sifu 工具包</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/json" active={Boolean(useMatch('/json'))}  eventKey="1">JSON</Nav.Link>
              <Nav.Link as={Link} to="/encoder" active={Boolean(useMatch('/encoder'))}  eventKey="2">编解码</Nav.Link>
              <Nav.Link as={Link} to="/kcal" active={Boolean(useMatch('/kcal'))}  eventKey="3">大卡计算</Nav.Link>
              <NavDropdown title="其他" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/code" active={Boolean(useMatch('/code'))}  eventKey="4">密码机</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/sqlfmt" active={Boolean(useMatch('/sqlfmt'))}  eventKey="5">SQL 格式化</NavDropdown.Item>
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
        </Routes>
      </Container>
      <ToastContainer />
    </>
  )
}

export default App;