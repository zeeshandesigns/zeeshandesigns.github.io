import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle } from '@mui/icons-material';
import DeliveryTypeIndicator from '../common/DeliveryTypeIndicator';

const ProductPage = () => {
  const { productSlug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch product details from API
    // For now, using mock data
    const mockProduct = {
      product_id: '1',
      name: 'Steam Gift Card - PKR 1000',
      slug: productSlug,
      description: 'Steam Wallet Gift Card allows you to add funds to your Steam Wallet. Use it to purchase games, software, and other content on Steam.',
      price: 1100,
      discount_percentage: 0,
      delivery_type: 'automatic',
      region: 'Global',
      image_url: '/steam-card.jpg',
      stock_count: 50,
      terms_conditions: 'This is a digital product. No physical item will be shipped. Code is non-refundable once delivered.',
      category_name: 'Gaming',
      is_active: true
    };
    
    setProduct(mockProduct);
    setLoading(false);
  }, [productSlug]);

  const handleAddToCart = () => {
    // Add to cart logic
    alert(`Added ${quantity} x ${product.name} to cart`);
  };

  const handleBuyNow = () => {
    // Navigate to checkout
    navigate('/checkout', { 
      state: { 
        items: [{ ...product, quantity }] 
      } 
    });
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Product not found</Alert>
      </Container>
    );
  }

  const isOutOfStock = product.stock_count === 0;

  return (
    <Container className="py-5">
      <Row>
        <Col md={6}>
          <Card>
            <Card.Img 
              variant="top" 
              src={product.image_url} 
              alt={product.name}
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
          </Card>
        </Col>
        
        <Col md={6}>
          <h1 className="h3">{product.name}</h1>
          
          <div className="my-3">
            <DeliveryTypeIndicator 
              deliveryType={product.delivery_type} 
              showDescription={true} 
            />
          </div>

          <div className="my-3">
            <h4 className="text-primary">PKR {product.price.toFixed(2)}</h4>
            {product.discount_percentage > 0 && (
              <span className="text-muted text-decoration-line-through">
                PKR {(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
              </span>
            )}
          </div>

          <Card className="mb-3">
            <Card.Body>
              <h6>Product Details</h6>
              <p className="mb-1"><strong>Region:</strong> {product.region}</p>
              <p className="mb-1"><strong>Category:</strong> {product.category_name}</p>
              <p className="mb-1">
                <strong>Availability:</strong> 
                {isOutOfStock ? (
                  <span className="text-danger"> Out of Stock</span>
                ) : (
                  <span className="text-success"> In Stock ({product.stock_count} available)</span>
                )}
              </p>
            </Card.Body>
          </Card>

          {!isOutOfStock && (
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max={Math.min(product.stock_count, 10)}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{ width: '100px' }}
              />
            </Form.Group>
          )}

          <div className="d-flex gap-2 mb-4">
            <Button 
              variant="primary" 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex-grow-1"
            >
              <CheckCircle className="me-2" />
              Buy Now
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="me-2" />
              Add to Cart
            </Button>
          </div>

          <Card>
            <Card.Body>
              <h6>Description</h6>
              <p>{product.description}</p>
              
              <h6 className="mt-3">Terms & Conditions</h6>
              <p className="small text-muted">{product.terms_conditions}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;
