import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Flash, Schedule } from '@mui/icons-material';

const ProductCard = ({ product }) => {
  const { 
    slug, 
    name, 
    price, 
    discount_percentage, 
    image_url, 
    delivery_type,
    stock_count 
  } = product;

  const discountedPrice = discount_percentage > 0 
    ? price * (1 - discount_percentage / 100) 
    : price;

  const isOutOfStock = stock_count === 0;

  return (
    <Card className="h-100 product-card shadow-sm">
      <Link to={`/product/${slug}`} className="text-decoration-none text-dark">
        <div className="position-relative">
          <Card.Img 
            variant="top" 
            src={image_url || '/placeholder-product.jpg'} 
            style={{ height: '200px', objectFit: 'cover' }}
          />
          {discount_percentage > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 end-0 m-2"
            >
              {discount_percentage}% OFF
            </Badge>
          )}
          {isOutOfStock && (
            <div 
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <Badge bg="secondary">Out of Stock</Badge>
            </div>
          )}
        </div>
        <Card.Body>
          <Card.Title className="h6">{name}</Card.Title>
          
          <div className="mb-2">
            {delivery_type === 'automatic' ? (
              <Badge bg="success" className="me-2">
                <Flash fontSize="small" /> Instant Delivery
              </Badge>
            ) : (
              <Badge bg="warning" text="dark" className="me-2">
                <Schedule fontSize="small" /> Manual Delivery
              </Badge>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {discount_percentage > 0 && (
              <span className="text-muted text-decoration-line-through small">
                PKR {price.toFixed(2)}
              </span>
            )}
            <span className="fw-bold text-primary">
              PKR {discountedPrice.toFixed(2)}
            </span>
          </div>
        </Card.Body>
      </Link>
    </Card>
  );
};

export default ProductCard;
