import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>PakGifts</h5>
            <p>Your trusted source for digital gift cards in Pakistan.</p>
            <div className="d-flex gap-3">
              <a href="#facebook" className="text-light"><Facebook /></a>
              <a href="#twitter" className="text-light"><Twitter /></a>
              <a href="#instagram" className="text-light"><Instagram /></a>
              <a href="#email" className="text-light"><Email /></a>
            </div>
          </Col>
          <Col md={4}>
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="#about" className="text-light text-decoration-none">About Us</a></li>
              <li><a href="#contact" className="text-light text-decoration-none">Contact</a></li>
              <li><a href="#faq" className="text-light text-decoration-none">FAQ</a></li>
              <li><a href="#terms" className="text-light text-decoration-none">Terms & Conditions</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Payment Methods</h5>
            <p>JazzCash, EasyPaisa, Bank Transfer</p>
            <p className="small mt-3">
              &copy; 2025 PakGifts. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
