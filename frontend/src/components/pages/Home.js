import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../common/ProductCard';
import { Category, Star } from '@mui/icons-material';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Fetch categories and featured products
    // For now, using mock data
    setCategories([
      { category_id: '1', name: 'Gaming', slug: 'gaming', icon_url: '🎮', description: 'Game gift cards and credits' },
      { category_id: '2', name: 'Entertainment', slug: 'entertainment', icon_url: '🎬', description: 'Streaming services' },
      { category_id: '3', name: 'Shopping', slug: 'shopping', icon_url: '🛍️', description: 'Online shopping vouchers' },
      { category_id: '4', name: 'Mobile Top-up', slug: 'mobile', icon_url: '📱', description: 'Mobile credit and packages' }
    ]);

    setFeaturedProducts([
      {
        product_id: '1',
        name: 'Steam Gift Card - PKR 1000',
        slug: 'steam-1000',
        price: 1100,
        discount_percentage: 0,
        delivery_type: 'automatic',
        stock_count: 50,
        image_url: '/steam-card.jpg'
      },
      {
        product_id: '2',
        name: 'Netflix Premium 1 Month',
        slug: 'netflix-premium-1m',
        price: 2500,
        discount_percentage: 10,
        delivery_type: 'manual',
        stock_count: 20,
        image_url: '/netflix-card.jpg'
      },
      {
        product_id: '3',
        name: 'PUBG UC 600',
        slug: 'pubg-uc-600',
        price: 1200,
        discount_percentage: 5,
        delivery_type: 'automatic',
        stock_count: 100,
        image_url: '/pubg-uc.jpg'
      },
      {
        product_id: '4',
        name: 'PlayStation Network PKR 1500',
        slug: 'psn-1500',
        price: 1650,
        discount_percentage: 0,
        delivery_type: 'automatic',
        stock_count: 30,
        image_url: '/psn-card.jpg'
      }
    ]);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-4 fw-bold">Welcome to PakGifts</h1>
              <p className="lead">
                Your trusted source for digital gift cards in Pakistan. 
                Get instant delivery for gaming, entertainment, and shopping vouchers.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Categories Section */}
      <Container className="py-5">
        <h2 className="mb-4">
          <Category className="me-2" />
          Browse by Category
        </h2>
        <Row>
          {categories.map(category => (
            <Col md={3} sm={6} key={category.category_id} className="mb-4">
              <Link 
                to={`/category/${category.slug}`} 
                className="text-decoration-none"
              >
                <Card className="h-100 text-center hover-shadow">
                  <Card.Body>
                    <div style={{ fontSize: '3rem' }}>{category.icon_url}</div>
                    <Card.Title className="h5 mt-3">{category.name}</Card.Title>
                    <Card.Text className="text-muted small">
                      {category.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Featured Products Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="mb-4">
            <Star className="me-2 text-warning" />
            Featured Products
          </h2>
          <Row>
            {featuredProducts.map(product => (
              <Col md={3} sm={6} key={product.product_id} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="text-center">
          <Col md={4} className="mb-4">
            <div style={{ fontSize: '3rem' }}>⚡</div>
            <h5>Instant Delivery</h5>
            <p className="text-muted">Get your codes instantly for automatic delivery products</p>
          </Col>
          <Col md={4} className="mb-4">
            <div style={{ fontSize: '3rem' }}>🔒</div>
            <h5>Secure Payments</h5>
            <p className="text-muted">Multiple payment options including JazzCash and EasyPaisa</p>
          </Col>
          <Col md={4} className="mb-4">
            <div style={{ fontSize: '3rem' }}>💯</div>
            <h5>100% Authentic</h5>
            <p className="text-muted">All voucher codes are verified and genuine</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
