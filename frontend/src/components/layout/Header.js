import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ShoppingCart, Person, Search } from '@mui/icons-material';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <strong>PakGifts</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/category/gaming">Gaming</Nav.Link>
            <Nav.Link as={Link} to="/category/entertainment">Entertainment</Nav.Link>
            <Nav.Link as={Link} to="/category/shopping">Shopping</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link href="#search">
              <Search />
            </Nav.Link>
            <Nav.Link as={Link} to="/dashboard">
              <Person /> Account
            </Nav.Link>
            <Nav.Link as={Link} to="/cart">
              <ShoppingCart /> 
              <Badge bg="danger" className="ms-1">0</Badge>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
