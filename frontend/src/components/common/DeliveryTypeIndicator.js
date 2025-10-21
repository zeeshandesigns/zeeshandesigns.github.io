import React from 'react';
import { Badge } from 'react-bootstrap';
import { Flash, Schedule, Info } from '@mui/icons-material';

const DeliveryTypeIndicator = ({ deliveryType, showDescription = false }) => {
  if (deliveryType === 'automatic') {
    return (
      <div className="delivery-indicator">
        <Badge bg="success" className="p-2">
          <Flash /> Instant Automatic Delivery
        </Badge>
        {showDescription && (
          <div className="text-muted small mt-2">
            <Info fontSize="small" className="me-1" />
            Your voucher codes will be delivered immediately after payment confirmation
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="delivery-indicator">
        <Badge bg="warning" text="dark" className="p-2">
          <Schedule /> Manual Delivery (24-48 hours)
        </Badge>
        {showDescription && (
          <div className="text-muted small mt-2">
            <Info fontSize="small" className="me-1" />
            Your voucher codes will be manually verified and delivered within 24-48 hours
          </div>
        )}
      </div>
    );
  }
};

export default DeliveryTypeIndicator;
