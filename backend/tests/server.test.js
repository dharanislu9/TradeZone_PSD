import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/product.js';
import jwt from 'jsonwebtoken';

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

    describe('Orders and Buy Now API', () => {
      let productId;
      let testOrder;
    
      beforeEach(async () => {
        // Create a product to use in orders
        const product = new Product({
          description: 'Test Product',
          price: 50,
          imagePath: 'test-image.jpg',
          sellerId: testUserId,
        });
        await product.save();
        productId = product._id;
    
        // Create an order for fetching tests
        testOrder = {
          productId,
          shippingAddress: '123 Test Street',
          paymentMethod: 'Credit Card',
          quantity: 2,
        };
      });
    
      afterEach(async () => {
        await Product.deleteMany({});
        await mongoose.connection.collection('orders').deleteMany({});
      });
    
      // Place a new order
      it('should place a new order', async () => {
        const response = await request(app)
          .post('/user/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testOrder);
    
        expect(response.status).to.equal(201);
        expect(response.body.message).to.equal('Order placed successfully!');
        expect(response.body.order).to.have.property('_id');
        expect(response.body.order.totalPrice).to.equal(100); // 50 * 2
      });
    
      // Place order with missing fields
      it('should return an error when required fields are missing', async () => {
        const response = await request(app)
          .post('/user/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId,
            shippingAddress: '123 Test Street',
            paymentMethod: 'Credit Card',
          }); // Missing quantity
    
        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal('All fields are required.');
      });
    
      // Place order with an invalid product ID
      it('should return an error for an invalid product ID', async () => {
        const response = await request(app)
          .post('/user/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: 'invalidId',
            shippingAddress: '123 Test Street',
            paymentMethod: 'Credit Card',
            quantity: 2,
          });
    
        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal('Invalid product ID format.');
      });
    
      // Fetch all orders for the logged-in user
      it('should fetch all orders for the logged-in user', async () => {
        // Place an order first
        await request(app)
          .post('/user/orders')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testOrder);
    
        const response = await request(app)
          .get('/user/orders')
          .set('Authorization', `Bearer ${authToken}`);
    
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body.length).to.be.greaterThan(0);
        expect(response.body[0]).to.have.property('productId');
      });
    
      // Fetch orders without authorization
      it('should return an error for fetching orders without authorization', async () => {
        const response = await request(app)
          .get('/user/orders');
    
        expect(response.status).to.equal(401);
        expect(response.body.error).to.equal('Authorization header missing or malformed');
      });
    
      // Buy Now test case
      it('should place an order using Buy Now', async () => {
        const response = await request(app)
          .post('/buy-now')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId,
            shippingAddress: '123 Test Street',
            paymentMethod: 'Credit Card',
            quantity: 1,
          });
    
        expect(response.status).to.equal(201);
        expect(response.body.message).to.equal('Order placed successfully');
        expect(response.body.order).to.have.property('productId');
        expect(response.body.order.totalPrice).to.equal(50); // 50 * 1
      });
    
      // Buy Now with missing fields
      it('should return an error for missing fields in Buy Now request', async () => {
        const response = await request(app)
          .post('/buy-now')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId,
            shippingAddress: '123 Test Street',
            paymentMethod: 'Credit Card',
          }); // Missing quantity
    
        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal('All fields are required');
      });
    
      // Buy Now with an invalid product ID
      it('should return an error for an invalid product ID in Buy Now', async () => {
        const response = await request(app)
          .post('/buy-now')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            productId: 'invalidId',
            shippingAddress: '123 Test Street',
            paymentMethod: 'Credit Card',
            quantity: 1,
          });
      
        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal('Invalid product ID format.');
      });

      describe('Cart API Endpoints', () => {
        it('should add a product to the cart', async () => {
          const res = await request(app)
            .post('/user/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productId });
          
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Product added to cart');
          expect(res.body.cart).to.be.an('array').that.has.lengthOf(1);
          expect(res.body.cart[0].productId).to.equal(String(productId));
        });
    
        
        
    
        it('should remove a product from the cart', async () => {
          // Add product to the cart first
          await request(app)
            .post('/user/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productId });
    
          // Remove the product from the cart
          const res = await request(app)
            .delete(`/user/cart/${productId}`)
            .set('Authorization', `Bearer ${authToken}`);
    
          expect(res.status).to.equal(200);
          expect(res.body.message).to.equal('Product removed from cart');
    
          // Verify the cart is empty
          const cartRes = await request(app)
            .get('/user/cart')
            .set('Authorization', `Bearer ${authToken}`);
          
          expect(cartRes.status).to.equal(200);
          expect(cartRes.body.cart).to.be.an('array').that.is.empty;
        });
    
        it('should return an error when adding a non-existent product to the cart', async () => {
          const fakeProductId = new mongoose.Types.ObjectId(); // Generate a random ObjectId
          const res = await request(app)
            .post('/user/cart')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ productId: fakeProductId });
    
          expect(res.status).to.equal(404);
          expect(res.body.error).to.equal('Product not found');
        });
    
        it('should return an error when removing a product not in the cart', async () => {
          const fakeProductId = new mongoose.Types.ObjectId(); // Generate a random ObjectId
          const res = await request(app)
            .delete(`/user/cart/${fakeProductId}`)
            .set('Authorization', `Bearer ${authToken}`);
    
          expect(res.status).to.equal(404);
          expect(res.body.error).to.equal('Item not found in cart');
        });

        describe('Home Route', () => {
          it('should return a welcome message', async () => {
            const res = await request(app)
              .get('/'); // Accessing the home route
            expect(res.status).to.equal(200); // Expect a 200 status code
            expect(res.body).to.have.property('message', 'Welcome to the API Home Page');
          });
        
          it('should return 404 for an invalid route', async () => {
            const res = await request(app)
              .get('/invalid-route'); // Accessing a route that doesn't exist
            expect(res.status).to.equal(404); // Expect a 404 status code
          });

          

          it('should reject access to protected routes without a token', async () => {
            const res = await request(app).get('/user');
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
          });

          it('should update multiple fields in the user profile', async () => {
            const res = await request(app)
              .put('/user')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ firstName: 'NewName', lastName: 'NewLastName' });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('firstName', 'NewName');
            expect(res.body).to.have.property('lastName', 'NewLastName');
          });

          

          
          it('should return an error for fetching a product with invalid ID format', async () => {
            const res = await request(app).get('/products/invalidId');
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid product ID format.');
          });

          it('should return an error when adding a product without all required fields', async () => {
            const res = await request(app)
              .post('/products')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ description: 'Test Product' }); // Missing price and image
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'All fields including image are required');
          });

          it('should return an empty array when no orders exist for the user', async () => {
            const res = await request(app)
              .get('/user/orders')
              .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').that.is.empty;
          });

          
          

          
          it('should update the quantity of a product in the cart when added multiple times', async () => {
            const product = new Product({
              description: 'Repeatable Product',
              price: 25,
              sellerId: testUserId,
            });
            await product.save();
          
            await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product._id });
          
            const res = await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product._id });
          
            expect(res.status).to.equal(200);
            expect(res.body.cart[0]).to.have.property('quantity', 2);
          });

          
          it('should return an error when removing a non-existent product from the cart', async () => {
            const fakeProductId = new mongoose.Types.ObjectId();
            const res = await request(app)
              .delete(`/user/cart/${fakeProductId}`)
              .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Item not found in cart');
          });

          
          it('should return an error when adding a duplicate payment method', async () => {
            const paymentMethod = {
              cardNumber: '1111222233334444',
              expDate: '01/26',
              cvv: '123',
              country: 'USA',
            };
          
            await request(app)
              .put('/user/payment-method')
              .set('Authorization', `Bearer ${authToken}`)
              .send(paymentMethod);
          
            const res = await request(app)
              .put('/user/payment-method')
              .set('Authorization', `Bearer ${authToken}`)
              .send(paymentMethod);
          
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Duplicate payment method');
          });

          
          it('should not allow registration with an already registered email', async () => {
            const res = await request(app)
              .post('/register')
              .send({
                firstName: 'Duplicate',
                lastName: 'User',
                email: 'test@example.com', // Already registered email
                password: 'password123',
                phone: '1234567890',
                address: '123 Test St',
              });
            expect(res.status).to.equal(500);
            expect(res.body).to.have.property('error', 'Internal server error');
          });

          it('should not allow login with an incorrect password', async () => {
            const res = await request(app)
              .post('/login')
              .send({
                email: 'test@example.com',
                password: 'wrongpassword',
              });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid credentials');
          });

          it('should increase the quantity of an existing product in the cart', async () => {
            const product = new Product({
              description: 'Cart Product',
              price: 30,
              sellerId: testUserId,
            });
            await product.save();
          
            await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product._id });
          
            const res = await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product._id });
          
            expect(res.status).to.equal(200);
            expect(res.body.cart[0]).to.have.property('quantity', 2);
          });

          it('should return an empty list if the user has no orders', async () => {
            const res = await request(app)
              .get('/user/orders')
              .set('Authorization', `Bearer ${authToken}`);
          
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').that.is.empty;
          });

          

          it('should reject unauthorized access to a protected route', async () => {
            const res = await request(app)
              .get('/user');
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
          });

          it('should fetch details of a product by valid ID', async () => {
            const product = new Product({
              description: 'Valid Product',
              price: 40,
              sellerId: testUserId,
            });
            await product.save();
          
            const res = await request(app).get(`/products/${product._id}`);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('description', 'Valid Product');
          });
          
          it('should return 404 for a non-existent product ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app).get(`/products/${fakeId}`);
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Product not found.');
          });

          it('should reject requests with an invalid token', async () => {
            const invalidToken = 'invalidToken123';
          
            const res = await request(app)
              .get('/user')
              .set('Authorization', `Bearer ${invalidToken}`);
              
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Invalid or malformed token');
          });

          

          it('should fetch cart with populated product details', async () => {
            const product = new Product({
              description: 'Cart Product',
              price: 50,
              sellerId: testUserId,
            });
            await product.save();
          
            // Add product to the cart
            await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product._id });
          
            const res = await request(app)
              .get('/user/cart')
              .set('Authorization', `Bearer ${authToken}`);
          
            expect(res.status).to.equal(200);
            expect(res.body.cart[0]).to.have.property('productId');
            expect(res.body.cart[0].productId.description).to.equal('Cart Product');
          });

          it('should not allow registration with missing required fields', async () => {
            const res = await request(app)
              .post('/register')
              .send({
                firstName: 'MissingFieldsUser',
              }); // Missing email, password, etc.
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid email format');
          });

          it('should not allow creating a product without all required fields', async () => {
            const res = await request(app)
              .post('/products')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                description: 'Incomplete Product',
              }); // Missing price and image
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'All fields including image are required');
          });
          

          it('should return an error if the product to be added to the cart does not exist', async () => {
            const fakeProductId = new mongoose.Types.ObjectId(); // Generate a non-existent ObjectId
            const res = await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: fakeProductId });
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Product not found');
          });
          
          it('should not allow accessing the cart without a token', async () => {
            const res = await request(app).get('/user/cart');
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
          });

          it('should not allow placing an order for a non-existent product', async () => {
            const fakeProductId = new mongoose.Types.ObjectId(); // Non-existent product ID
            const res = await request(app)
              .post('/user/orders')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                productId: fakeProductId,
                shippingAddress: '123 Test Address',
                paymentMethod: 'Credit Card',
                quantity: 1,
              });
            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('error', 'Product not found.');
          });

          it('should not allow updating the user profile with invalid fields', async () => {
            const res = await request(app)
              .put('/user')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ invalidField: 'InvalidValue' });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Invalid field provided');
          });

          

          it('should revert to the default theme if no theme is set by the user', async () => {
            const res = await request(app)
              .get('/user/theme')
              .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.theme).to.equal('light'); // Assuming 'light' is the default
          });

          it('should return an error for accessing any protected route without a token', async () => {
            const res = await request(app).get('/user/orders');
            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
          });

          it('should calculate the correct total price of items in the cart', async () => {
            const product1 = await new Product({ description: 'Product1', price: 10, sellerId: testUserId }).save();
            const product2 = await new Product({ description: 'Product2', price: 20, sellerId: testUserId }).save();
          
            await request(app).post('/user/cart').set('Authorization', `Bearer ${authToken}`).send({ productId: product1._id });
            await request(app).post('/user/cart').set('Authorization', `Bearer ${authToken}`).send({ productId: product2._id });
          
            const res = await request(app).get('/user/cart').set('Authorization', `Bearer ${authToken}`);
            const cartTotal = res.body.cart.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
          
            expect(res.status).to.equal(200);
            expect(cartTotal).to.equal(30); // 10 + 20
          });

          it('should not add the same product to the cart twice', async () => {
            const product = new Product({ description: 'Product1', price: 50, sellerId: testUserId });
            await product.save();
          
            await request(app).post('/user/cart').set('Authorization', `Bearer ${authToken}`).send({ productId: product._id });
            const res = await request(app).post('/user/cart').set('Authorization', `Bearer ${authToken}`).send({ productId: product._id });
          
            expect(res.status).to.equal(200);
            expect(res.body.cart[0]).to.have.property('quantity', 2); // Quantity should increase, not duplicate
          });

          it('should calculate the total price of an order correctly', async () => {
            const product = await new Product({ description: 'Product1', price: 100, sellerId: testUserId }).save();
          
            const res = await request(app)
              .post('/user/orders')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                productId: product._id,
                shippingAddress: '123 Test St',
                paymentMethod: 'Credit Card',
                quantity: 2,
              });
          
            expect(res.status).to.equal(201);
            expect(res.body.order).to.have.property('totalPrice', 200); // 100 * 2
          });

          

          it('should return an error if product is submitted without an image', async () => {
            const res = await request(app)
              .post('/products')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ description: 'Product1', price: 100 });
          
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('All fields including image are required');
          });

          
          
          it('should fetch all payment methods for the user', async () => {
            await request(app)
              .put('/user/payment-method')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ cardNumber: '1234567890123456', expDate: '12/25', cvv: '123', country: 'USA' });
          
            await request(app)
              .put('/user/payment-method')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ cardNumber: '9876543210987654', expDate: '01/26', cvv: '456', country: 'Canada' });
          
            const res = await request(app)
              .get('/user/payment-methods')
              .set('Authorization', `Bearer ${authToken}`);
          
            expect(res.status).to.equal(200);
            expect(res.body.paymentMethods).to.have.lengthOf(2);
          });


          it('should add multiple products to the cart and verify quantities', async () => {
            const product1 = await new Product({ description: 'Product1', price: 30, sellerId: testUserId }).save();
            const product2 = await new Product({ description: 'Product2', price: 50, sellerId: testUserId }).save();
          
            await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product1._id });
          
            await request(app)
              .post('/user/cart')
              .set('Authorization', `Bearer ${authToken}`)
              .send({ productId: product2._id });
          
            const res = await request(app)
              .get('/user/cart')
              .set('Authorization', `Bearer ${authToken}`);
          
            expect(res.status).to.equal(200);
            expect(res.body.cart).to.have.lengthOf(2);
            expect(res.body.cart[0].productId.description).to.equal('Product1');
            expect(res.body.cart[1].productId.description).to.equal('Product2');
          });

          it('should not allow login with empty fields', async () => {
            const res = await request(app)
                .post('/login')
                .send({ email: '', password: '' });
            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('error', 'Email and password are required');
        });

        it('should not allow login for a non-existent user', async () => {
          const res = await request(app)
              .post('/login')
              .send({ email: 'nonexistent@example.com', password: 'password123' });
          expect(res.status).to.equal(400);
          expect(res.body).to.have.property('error', 'User not found');
      });
      
    it('should return the default theme for a user with no theme set', async () => {
    const res = await request(app)
      .get('/user/theme')
      .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).to.equal(200);
  expect(res.body.theme).to.equal('light'); // Assuming light is the default
});

it('should not allow login with missing email', async () => {
  const res = await request(app)
    .post('/login')
    .send({ password: 'password123' }); // Missing email
  expect(res.status).to.equal(400);
  expect(res.body).to.have.property('error', 'Email and password are required');
});

it('should return an error when placing an order without quantity', async () => {
  const res = await request(app)
    .post('/user/orders')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      productId,
      shippingAddress: '123 Test St',
      paymentMethod: 'Credit Card',
    });
  expect(res.status).to.equal(400);
  expect(res.body).to.have.property('error', 'All fields are required.');
});

it('should return an empty list when fetching orders for a user with no orders', async () => {
  const res = await request(app)
    .get('/user/orders')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).to.equal(200);
  expect(res.body).to.be.an('array').that.is.empty;
});



it('should return an empty list when no payment methods exist', async () => {
  const res = await request(app)
    .get('/user/payment-methods')
    .set('Authorization', `Bearer ${authToken}`);
  expect(res.status).to.equal(200);
  expect(res.body.paymentMethods).to.be.an('array').that.is.empty;
});





it('should return an error for accessing a protected route without headers', async () => {
  const res = await request(app).get('/user');
  expect(res.status).to.equal(401);
  expect(res.body).to.have.property('error', 'Authorization header missing or malformed');
});

it('should return 404 for a nonexistent endpoint', async () => {
  const res = await request(app).get('/nonexistent-route');
  expect(res.status).to.equal(404);
});

        });
      });
    });
  });
});

export default app;
