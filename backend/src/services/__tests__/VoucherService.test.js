const VoucherService = require('../VoucherService');
const { Pool } = require('pg');

describe('VoucherService', () => {
  let voucherService;
  let mockPool;

  beforeEach(() => {
    // Mock database pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn()
    };

    // Create service instance
    const encryptionKey = '0123456789abcdef0123456789abcdef'; // 32 char hex key
    voucherService = new VoucherService(mockPool, encryptionKey);
  });

  describe('encryptCode', () => {
    test('should encrypt a voucher code', () => {
      const code = 'TEST-CODE-1234';
      const encrypted = voucherService.encryptCode(code);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).toContain(':');
      expect(encrypted).not.toBe(code);
    });
  });

  describe('decryptCode', () => {
    test('should decrypt an encrypted code', () => {
      const originalCode = 'TEST-CODE-1234';
      const encrypted = voucherService.encryptCode(originalCode);
      const decrypted = voucherService.decryptCode(encrypted);
      
      expect(decrypted).toBe(originalCode);
    });
  });

  describe('hashCode', () => {
    test('should generate a consistent hash for a code', () => {
      const code = 'TEST-CODE-1234';
      const hash1 = voucherService.hashCode(code);
      const hash2 = voucherService.hashCode(code);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    test('should generate different hashes for different codes', () => {
      const code1 = 'TEST-CODE-1234';
      const code2 = 'TEST-CODE-5678';
      const hash1 = voucherService.hashCode(code1);
      const hash2 = voucherService.hashCode(code2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getAvailableStock', () => {
    test('should return available stock count', async () => {
      const productId = 'test-product-id';
      const expectedCount = 42;

      mockPool.query.mockResolvedValue({
        rows: [{ available_count: expectedCount }]
      });

      const result = await voucherService.getAvailableStock(productId);

      expect(result).toBe(expectedCount);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*)'),
        [productId]
      );
    });
  });
});

describe('Encryption/Decryption Integration', () => {
  test('should handle multiple codes correctly', () => {
    const encryptionKey = '0123456789abcdef0123456789abcdef';
    const voucherService = new VoucherService({}, encryptionKey);
    
    const codes = [
      'STEAM-XXXX-YYYY-ZZZZ',
      'PUBG-1234-5678-9012',
      'PSN-ABCD-EFGH-IJKL'
    ];

    codes.forEach(code => {
      const encrypted = voucherService.encryptCode(code);
      const decrypted = voucherService.decryptCode(encrypted);
      expect(decrypted).toBe(code);
    });
  });
});
