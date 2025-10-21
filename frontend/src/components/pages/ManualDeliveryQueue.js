import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { Schedule, CheckCircle, Warning, AssignmentInd } from '@mui/icons-material';

const ManualDeliveryQueue = () => {
  const [queueItems, setQueueItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [voucherCodes, setVoucherCodes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchQueueItems();
  }, []);

  const fetchQueueItems = async () => {
    // In production, fetch from API
    // For now, using mock data
    const mockData = [
      {
        queue_id: '1',
        order_number: 'ORD-2025-001',
        product_name: 'Netflix Premium 1 Month',
        customer_name: 'Ahmed Khan',
        customer_email: 'ahmed@example.com',
        quantity: 1,
        priority: 'high',
        status: 'pending',
        created_at: '2025-10-21T10:30:00Z',
        payment_status: 'verified'
      },
      {
        queue_id: '2',
        order_number: 'ORD-2025-002',
        product_name: 'Spotify Premium 3 Months',
        customer_name: 'Sara Ali',
        customer_email: 'sara@example.com',
        quantity: 2,
        priority: 'normal',
        status: 'pending',
        created_at: '2025-10-21T11:15:00Z',
        payment_status: 'verified'
      },
      {
        queue_id: '3',
        order_number: 'ORD-2025-003',
        product_name: 'Amazon Gift Card PKR 5000',
        customer_name: 'Ali Hassan',
        customer_email: 'ali@example.com',
        quantity: 1,
        priority: 'urgent',
        status: 'processing',
        created_at: '2025-10-21T09:00:00Z',
        payment_status: 'verified',
        assigned_to: 'Admin User'
      }
    ];
    
    setQueueItems(mockData);
  };

  const handleProcessClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
    setVoucherCodes('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmitCodes = async () => {
    setLoading(true);
    setError(null);

    try {
      const codes = voucherCodes.split('\n').filter(c => c.trim());
      
      if (codes.length !== selectedItem.quantity) {
        setError(`Please enter exactly ${selectedItem.quantity} voucher code(s)`);
        setLoading(false);
        return;
      }

      // In production, call API to process delivery
      // await deliveryService.processManualDeliveryItem(selectedItem.queue_id, adminId, codes);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Voucher codes delivered successfully!');
      setTimeout(() => {
        setShowModal(false);
        fetchQueueItems();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to process delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (queueId) => {
    // In production, call API to assign item
    // await deliveryService.assignManualDeliveryItem(queueId, adminId);
    
    alert('Item assigned to you');
    fetchQueueItems();
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      urgent: 'danger',
      high: 'warning',
      normal: 'info',
      low: 'secondary'
    };
    return <Badge bg={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'danger'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <Schedule className="me-2" />
          Manual Delivery Queue
        </h2>
        <Button variant="outline-primary" onClick={fetchQueueItems}>
          Refresh
        </Button>
      </div>

      {queueItems.length === 0 ? (
        <Alert variant="info">
          No items in the manual delivery queue
        </Alert>
      ) : (
        <Table responsive striped bordered hover>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Product</th>
              <th>Customer</th>
              <th>Qty</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queueItems.map(item => (
              <tr key={item.queue_id}>
                <td>{item.order_number}</td>
                <td>{item.product_name}</td>
                <td>
                  <div>{item.customer_name}</div>
                  <small className="text-muted">{item.customer_email}</small>
                </td>
                <td>{item.quantity}</td>
                <td>{getPriorityBadge(item.priority)}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  {item.status === 'pending' ? (
                    <Button 
                      size="sm" 
                      variant="outline-primary"
                      onClick={() => handleAssign(item.queue_id)}
                    >
                      <AssignmentInd fontSize="small" /> Assign
                    </Button>
                  ) : item.status === 'processing' ? (
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={() => handleProcessClick(item)}
                    >
                      <CheckCircle fontSize="small" /> Process
                    </Button>
                  ) : (
                    <span className="text-muted">Completed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Process Delivery Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Process Manual Delivery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <>
              <Alert variant="info">
                <strong>Order:</strong> {selectedItem.order_number}<br />
                <strong>Product:</strong> {selectedItem.product_name}<br />
                <strong>Quantity Required:</strong> {selectedItem.quantity}<br />
                <strong>Customer:</strong> {selectedItem.customer_name} ({selectedItem.customer_email})
              </Alert>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form.Group className="mb-3">
                <Form.Label>
                  Enter Voucher Codes (one per line):
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={selectedItem.quantity + 2}
                  value={voucherCodes}
                  onChange={(e) => setVoucherCodes(e.target.value)}
                  placeholder="Enter voucher codes here, one per line"
                  disabled={loading || success}
                />
                <Form.Text className="text-muted">
                  Please enter exactly {selectedItem.quantity} code(s)
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitCodes}
            disabled={loading || success}
          >
            {loading ? 'Processing...' : 'Submit & Deliver'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManualDeliveryQueue;
