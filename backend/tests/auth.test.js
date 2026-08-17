const request = require('supertest');
const app = require('../server');
const db = require('./setup/db');
const User = require('../models/User');

beforeAll(async () => {
    await db.connect();
});

afterEach(async () => {
    await db.clearDatabase();
});

afterAll(async () => {
    await db.closeDatabase();
});

describe('Auth API Endpoints', () => {
    const validUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
    };

    describe('POST /api/auth/register/user', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register/user')
                .send(validUser);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User Registered Successfully');
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', validUser.email);
            expect(res.body.user.role).toEqual('user');
        });

        it('should fail if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register/user')
                .send({ name: 'Test User' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'All registration fields are required');
        });
        
        it('should fail if user already exists', async () => {
            await request(app).post('/api/auth/register/user').send(validUser);
            
            const res = await request(app)
                .post('/api/auth/register/user')
                .send(validUser);

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('POST /api/auth/login/user', () => {
        beforeEach(async () => {
            await request(app).post('/api/auth/register/user').send(validUser);
        });

        it('should login successfully with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login/user')
                .send({
                    email: validUser.email,
                    password: validUser.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Login Successful');
            expect(res.body).toHaveProperty('token');
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login/user')
                .send({
                    email: validUser.email,
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message', 'Invalid Password');
        });
    });
});
