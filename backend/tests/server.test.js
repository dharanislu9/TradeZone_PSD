import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/product.js';

describe('Server API Endpoints', () => {
  let authToken = '';
  let testUserId = '';

  before(async () => {
    const mongoURI = 'mongodb://localhost:27017/testDatabase'; // Use test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    }
  });

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

  describe('User Profile Routes', () => {
    it('should fetch the user profile', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', 'test@example.com');
    });

    it('should not allow fetching user profile with an expired or invalid token', async () => {
      const res = await request(app)
        .get('/user')
        .set('Authorization', 'Bearer invalidToken');
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Invalid or malformed token');
    });

    it('should update the user profile', async () => {
      const res = await request(app)
        .put('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ firstName: 'UpdatedName' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('firstName', 'UpdatedName');
    });

    it('should not allow updating user profile with invalid fields', async () => {
      const res = await request(app)
        .put('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalidField: 'Invalid' });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid field provided');
    });
  });

  describe('Theme Settings', () => {
    it('should update the theme setting to dark', async () => {
      const res = await request(app)
        .put('/user/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'dark' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('theme', 'dark');
    });

    it('should fetch the user theme', async () => {
      const res = await request(app)
        .get('/user/theme')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('theme', 'light'); // Assuming 'light' is the default
    });

    it('should not update the theme setting with an invalid value', async () => {
      const res = await request(app)
        .put('/user/theme')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'invalid_theme' }); // Invalid theme value
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Invalid theme value');
    });
  });

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

  describe('Change Password', () => {
    it('should change the password with correct old password', async () => {
      const res = await request(app)
        .put('/user/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ oldPassword: 'password123', newPassword: 'newpassword123' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message', 'Password changed successfully');
    });

    it('should not change the password with incorrect old password', async () => {
      const res = await request(app)
        .put('/user/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ oldPassword: 'wrongpassword', newPassword: 'newpassword123' });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Incorrect old password');
    });
  });

  describe('Additional API Tests', () => {
    it('should return 404 for an unknown route', async () => {
      const res = await request(app)
        .get('/unknown-route')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(404);
    });

    it('should delete the user account and verify it no longer exists', async () => {
      const deleteRes = await request(app)
        .delete('/user')
        .set('Authorization', `Bearer ${authToken}`);
      expect(deleteRes.status).to.equal(200);
      expect(deleteRes.body).to.have.property('message', 'User deleted successfully');
  
      const getRes = await request(app)
        .get('/user')
        .set('Authorization', `Bearer ${authToken}`);
      expect(getRes.status).to.equal(404);
      expect(getRes.body).to.have.property('error', 'User not found');
    });
// Dharani - checks if a new product can be created with a worthiness level.
    it('should add a new product with a worthiness level', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Sample Product',
          price: 50,
          imagePath: 'https://example.com/image.jpg',
          worth: 75,  // Worthiness level
          sellerId: testUserId
        });
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('description', 'Sample Product');
      expect(res.body).to.have.property('worth', 75); // Verify worthiness level
    });

    // Dharani - to check if the worthiness level of an existing product can be updated.
    it('should update the worthiness level of an existing product', async () => {
      // Create a product first
      const product = new Product({
        description: 'Sample Product',
        price: 50,
        imagePath: 'https://example.com/image.jpg',
        worth: 50,
        sellerId: testUserId
      });
      await product.save();
    
      // Update the worthiness level
      const res = await request(app)
        .put(`/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ worth: 85 });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('worth', 85); // Updated worthiness level
    });
    

    //Test for Updating Product Details (Other than Worthiness) - dharani

    it('should update product description and price', async () => {
      // Create a product first
      const product = new Product({
        description: 'Old Description',
        price: 100,
        imagePath: 'https://example.com/old.jpg',
        worth: 70,
        sellerId: testUserId
      });
      await product.save();
    
      const res = await request(app)
        .put(`/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Updated Description', price: 120 });
    
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('description', 'Updated Description');
      expect(res.body).to.have.property('price', 120);
    });
    
    //check if the worthiness level falls within acceptable boundaries, such as 0-100.
    it('should not allow a worthiness level outside the valid range', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Invalid Product',
          price: 20,
          imagePath: 'https://example.com/image.jpg',
          worth: 150,  // Invalid worthiness level
          sellerId: testUserId
        });
      expect(res.status).to.equal(400); // Expecting a validation error
      expect(res.body).to.have.property('error', 'Worthiness level must be between 0 and 100');
    });
    
    //Dharani - check if a product with a worthiness level can be retrieved correctly.
    it('should retrieve a product with a worthiness level', async () => {
      // Create a product first
      const product = new Product({
        description: 'Sample Product',
        price: 75,
        imagePath: 'https://example.com/image.jpg',
        worth: 60,  // Set worthiness level
        sellerId: testUserId
      });
      await product.save();
    
      const res = await request(app)
        .get(`/products/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('worth', 60); // Verify worthiness level
    });
    
    
  });
});
//d
it('should fetch a list of products with pagination', async () => {
  // Add some products to the database
  await Product.insertMany([
    { description: 'Product 1', price: 10, imagePath: 'https://example.com/img1.jpg', worth: 70, sellerId: testUserId },
    { description: 'Product 2', price: 20, imagePath: 'https://example.com/img2.jpg', worth: 80, sellerId: testUserId },
    { description: 'Product 3', price: 30, imagePath: 'https://example.com/img3.jpg', worth: 60, sellerId: testUserId },
  ]);

  const res = await request(app)
    .get('/products?page=1&limit=2')
    .set('Authorization', `Bearer ${authToken}`);

  expect(res.status).to.equal(200);
  expect(res.body.products).to.have.lengthOf(2); // Verify the number of products per page
  expect(res.body).to.have.property('totalPages');
});


//d - reset password
it('should send a password reset email', async () => {
  const res = await request(app)
    .post('/user/reset-password')
    .send({ email: 'test@example.com' });

  expect(res.status).to.equal(200);
  expect(res.body).to.have.property('message', 'Password reset email sent successfully');
});



export default app;
