import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import ManualDeliveryQueue from './ManualDeliveryQueue';

const AdminPanel = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Admin Panel</h1>
      <Tabs defaultActiveKey="delivery-queue" className="mb-3">
        <Tab eventKey="delivery-queue" title="Manual Delivery Queue">
          <ManualDeliveryQueue />
        </Tab>
        <Tab eventKey="products" title="Products">
          <p>Product management will be implemented here.</p>
        </Tab>
        <Tab eventKey="orders" title="Orders">
          <p>Order management will be implemented here.</p>
        </Tab>
        <Tab eventKey="inventory" title="Inventory">
          <p>Inventory management will be implemented here.</p>
        </Tab>
        <Tab eventKey="payments" title="Payments">
          <p>Payment verification will be implemented here.</p>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminPanel;
