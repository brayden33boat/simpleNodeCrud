// src/index.test.ts
import request from 'supertest';
import app from './index'; // Import the Express application

jest.mock('pg', () => {
    const mPool = {
        connect: jest.fn().mockResolvedValue({
            release: jest.fn(),
            query: jest.fn().mockResolvedValue({
                rows: [{ id: '1', name: 'John Doe', email: 'john.doe@example.com' }]
            })
        })
    };
    return { Pool: jest.fn(() => mPool) };
});

describe('/user/:id endpoint', () => {
    test('should return user data if the user exists', async () => {
        const response = await request(app).get('/user/1');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ id: '1', name: 'John Doe', email: 'john.doe@example.com' });
    });

    test('should return 404 if the user does not exist', async () => {
        // Override the default mock implementation for this test case
        require('pg').Pool().connect().query.mockResolvedValue({ rows: [] });
        const response = await request(app).get('/user/999');
        expect(response.status).toBe(404);
    });
});
