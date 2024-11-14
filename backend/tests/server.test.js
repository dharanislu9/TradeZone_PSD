import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/product.js';

describe('Server API Endpoints', () => {
  let authToken = '';
  let testUserId = '';

  // Connect to the database once before all tests
  before(async () => {
    const mongoURI = 'mongodb://localhost:27017/testDatabase'; // Use test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    }
  });

  // Disconnect from the database after all tests are completed
  after(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    const res = await request(app)
      .post('/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        phone: '1234567890',
        address: '123 Test St',
        location: 'City',
        radius: '5 miles'
      });
    testUserId = res.body._id;

    const loginRes = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'password123' });
    authToken = loginRes.body.token;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  describe('Auth Routes', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '0987654321',
          address: '456 Another St'
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('message', 'User registered successfully');
    });

    it('should not allow registration with an invalid email format', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          firstName: 'Invalid',
          lastName: 'Email',
          email: 'invalid-email',
          password: 'password123',
          phone: '1234567890',
          address: '789 Test St'
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid email format');
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      authToken = res.body.token;
    });

    it('should not allow login with an unregistered email', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'unregistered@example.com',
          password: 'password123'
        });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'User not found');
    });
  });

  // Other test cases remain the same
  // ...

  describe('Location Routes', () => {
    it('should add a location', async () => {
      const res = await request(app)
        .put('/user/location')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ city: 'New City', radius: '10 miles' });
      expect(res.status).to.equal(200);
      expect(res.body.location).to.deep.include({ city: 'New City', radius: '10 miles' });
    });

    it('should not allow adding a location without authorization', async () => {
      const res = await request(app)
        .put('/user/location')
        .send({ city: 'Unauthorized City', radius: '5 miles' });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
    });

    it('should fetch user locations', async () => {
      await request(app)
        .put('/user/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ locations: [{ city: 'City1', radius: '5 miles' }] });

      const res = await request(app)
        .get('/user/locations')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.locations).to.have.lengthOf(1);
      expect(res.body.locations[0]).to.have.property('city', 'City1');
    });
  });

  // Additional tests...
});
