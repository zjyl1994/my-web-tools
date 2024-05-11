import { Routes, Route, Link,useMatch  } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

import FrontPage from './pages/frontpage'
import JsonPage from './pages/json.tsx'
import EncoderPage from './pages/encoder'
import KcalCalcPage from './pages/kcal.tsx'
import CodeCalcPage from './pages/code'

function App() {
  return (
    <>
      <Navbar expand="lg" bg="dark" data-bs-theme="dark" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">鱼sifu工具包</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/json" active={Boolean(useMatch('/json'))}>JSON</Nav.Link>
              <Nav.Link as={Link} to="/encoder" active={Boolean(useMatch('/encoder'))}>编解码</Nav.Link>
              <Nav.Link as={Link} to="/kcal" active={Boolean(useMatch('/kcal'))}>大卡计算</Nav.Link>
              <NavDropdown title="其他" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/code" active={Boolean(useMatch('/code'))}>密码机</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-3">
        <Routes>
          <Route path="/" element={<FrontPage />} />
          <Route path="/json" element={<JsonPage />} />
          <Route path="/encoder" element={<EncoderPage />} />
          <Route path="/kcal" element={<KcalCalcPage />} />
          <Route path="/code" element={<CodeCalcPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
