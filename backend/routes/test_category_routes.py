import unittest
from flask import Flask
from flask_testing import TestCase
from mongoengine import connect, disconnect
from app import app
from models.category import Category

class TestCategoryRoutes(TestCase):

    def create_app(self):
        # Connect to a test database to avoid modifying the production DB
        app.config['TESTING'] = True
        app.config['MONGODB_SETTINGS'] = {'db': 'test_database'}
        return app

    def setUp(self):
        # Connect to the test database and create test data
        connect('test_database', host='mongodb://localhost:27017/test_database')
        self.category_data = {
            "title": "Test Category",
            "sub_title": "Test SubTitle",
            "code": "TEST",
            "image_url": "http://example.com/test_image.jpg"
        }
        category = Category(**self.category_data)
        category.save()

    def tearDown(self):
        # Cleanup after test, remove all data from the test database
        Category.objects.delete()
        disconnect()

    def test_get_categories(self):
        response = self.client.get('/categories')
        self.assertEqual(response.status_code, 200)
        self.assertIn('categories', response.json)

    def test_get_category_by_code(self):
        response = self.client.get('/categories/TEST')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['title'], self.category_data['title'])

    def test_get_category_by_code_not_found(self):
        response = self.client.get('/categories/INVALID_CODE')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.json)

if __name__ == '__main__':
    unittest.main()
