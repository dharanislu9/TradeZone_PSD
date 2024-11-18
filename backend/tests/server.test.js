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

  describe('Password Recovery', () => {
    it('should not send a password reset email for an unregistered email', async () => {
      const res = await request(app)
        .post('/forgot-password')
        .send({ email: 'unregistered@example.com' });
      expect(res.status).to.equal(404);
      expect(res.body).to.have.property('error', 'User not found');
    });
  });

  describe('Invalid Routes', () => {
    it('should return 404 for an unknown route', async () => {
      const res = await request(app)
        .get('/unknown-route')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(404);
    });
  });

  // Additional Test Cases
  describe('Additional API Endpoints Tests', () => {
    // 1. Update User's Email and check the updated value
    it('should update the user email', async () => {
      const newEmail = 'new.email@example.com';
      const res = await request(app)
        .put('/user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: newEmail });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', newEmail);
    });

    // 2. Fetch the user's cart and ensure it is initially empty
    it('should fetch the user cart, initially empty', async () => {
      const res = await request(app)
        .get('/user/cart')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).to.equal(200);
      expect(res.body.cart).to.be.an('array').that.is.empty;
    });

    // 3. Attempt to add a product without authorization
    it('should not add a product without authorization', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          description: 'Test Product',
          price: 20,
        });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
    });

    // 4. Add a payment method and retrieve it successfully
    // Add to your `server.test.js` file under the describe block
    it('should add a payment method and retrieve it successfully', async () => {
      // Define payment method data
      const paymentMethod = {
        cardNumber: '1234567812345678',
        expDate: '12/25',
        cvv: '123',
        country: 'USA'
      };
    
      // First, add the payment method
      const addRes = await request(app)
        .put('/user/payment-method')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentMethod);
    
      // Verify that the payment method was added successfully
      expect(addRes.status).to.equal(200);
      expect(addRes.body).to.have.property('message', 'Payment method added successfully');
    
      // Then, retrieve the payment methods to confirm the addition
      const getRes = await request(app)
        .get('/user/payment-methods')
        .set('Authorization', `Bearer ${authToken}`);
    
      // Extract payment method details for comparison
      const retrievedPaymentMethods = getRes.body.paymentMethods.map(pm => ({
        cardNumber: pm.cardNumber,
        expDate: pm.expDate,
        cvv: pm.cvv,
        country: pm.country
      }));
    
      // Verify that the payment methods list includes the one we just added
      expect(getRes.status).to.equal(200);
      expect(retrievedPaymentMethods).to.deep.include(paymentMethod);
    });



    // Add this test case to your `server.test.js` file within the describe block

    it('should update multiple locations and retrieve them correctly', async () => {
      // Define multiple location data
      const locationsData = [
        { city: 'New York', radius: '10 miles' },
        { city: 'Los Angeles', radius: '15 miles' },
        { city: 'Chicago', radius: '5 miles' }
      ];
    
      // First, update the locations array
      const updateRes = await request(app)
        .put('/user/locations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ locations: locationsData });
      
      // Check the response to ensure the locations were updated
      expect(updateRes.status).to.equal(200);
      expect(updateRes.body).to.have.property('message', 'Locations updated successfully');
    
      // Then, retrieve the locations to confirm they were updated correctly
      const getRes = await request(app)
        .get('/user/locations')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Extract only city and radius fields from the response for comparison
      const retrievedLocations = getRes.body.locations.map(loc => ({
        city: loc.city,
        radius: loc.radius
      }));
    
      // Check that the retrieved locations match the locations we added
      expect(getRes.status).to.equal(200);
      expect(retrievedLocations).to.deep.equal(locationsData);
    });

    // 6. Clear all items from the cart and verify it is empty
    it('should clear all items from the cart and verify it is empty', async () => {
      // First, add an item to the cart
      const product = new Product({
        description: 'Test Product',
        price: 20,
        sellerId: testUserId
      });
      await product.save();

      await request(app)
        .post('/user/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ productId: product._id });

      // Verify the cart has the item
      let cartRes = await request(app)
        .get('/user/cart')
        .set('Authorization', `Bearer ${authToken}`);
      expect(cartRes.body.cart).to.have.lengthOf(1);

      // Clear the cart
      const clearRes = await request(app)
        .delete(`/user/cart/${product._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(clearRes.status).to.equal(200);
      expect(clearRes.body).to.have.property('message', 'Product removed from cart');

      // Verify cart is empty
      cartRes = await request(app)
        .get('/user/cart')
        .set('Authorization', `Bearer ${authToken}`);
      expect(cartRes.status).to.equal(200);
      expect(cartRes.body.cart).to.be.an('array').that.is.empty;
    });
  });

  it('should delete the user account and verify it no longer exists', async () => {
    // First, delete the user account
    const deleteRes = await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${authToken}`);
  
    // Verify the response confirms deletion
    expect(deleteRes.status).to.equal(200);
    expect(deleteRes.body).to.have.property('message', 'User deleted successfully');
  
    // Attempt to fetch the deleted user profile
    const getRes = await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${authToken}`);
    
    // Verify that fetching the deleted user profile fails
    expect(getRes.status).to.equal(404);
    expect(getRes.body).to.have.property('error', 'User not found');
  });

  describe('Additional API Endpoints Tests', () => {
  
    // 1. Retrieve payment methods without adding any
    it('should return an empty list when retrieving payment methods if none have been added', async () => {
      const res = await request(app)
        .get('/user/payment-methods')
        .set('Authorization', `Bearer ${authToken}`);
  
      // Verify that payment methods are empty
      expect(res.status).to.equal(200);
      expect(res.body.paymentMethods).to.be.an('array').that.is.empty;
    });

  });

});

export default app;
