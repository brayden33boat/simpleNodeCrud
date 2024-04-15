const pg = jest.createMockFromModule('pg') as any;

// Mock pool functionality
pg.Pool = jest.fn().mockImplementation(() => ({
  connect: jest.fn().mockResolvedValue({
    release: jest.fn(),
    query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: 'John Doe', email: 'john@example.com', profile: 'Developer' }] }),
  }),
}));

module.exports = pg;
