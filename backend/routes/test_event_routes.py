import unittest
from flask import Flask
from flask_testing import TestCase
from mongoengine import connect, disconnect
from app import app
from models.event import Event
from models.category import Category

class TestEventRoutes(TestCase):

    def create_app(self):
        # Connect to a test database to avoid modifying the production DB
        app.config['TESTING'] = True
        app.config['MONGODB_SETTINGS'] = {'db': 'test_database'}
        return app

    def setUp(self):
        # Connect to the test database and create test data for categories and events
        connect('test_database', host='mongodb://localhost:27017/test_database')

        # Create category data
        self.category_data = {
            "title": "Test Category",
            "sub_title": "Test SubTitle",
            "code": "TEST",
            "image_url": "http://example.com/test_image.jpg"
        }
        category = Category(**self.category_data)
        category.save()

        # Create event data for the above category
        self.event_data = {
            "title": "Test Event",
            "description": "Test Description",
            "start_date": "2024-11-25T00:00:00Z",
            "end_date": "2024-11-29T23:59:59Z",
            "image_url": "http://example.com/test_event_image.jpg",
            "category_code": "TEST"
        }
        event = Event(**self.event_data)
        event.save()

    def tearDown(self):
        # Cleanup after test, remove all data from the test database
        Event.objects.delete()
        Category.objects.delete()
        disconnect()

    def test_get_events_by_category_code(self):
        response = self.client.get('/events/TEST')
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json), 0)  # Ensure that events are returned

    def test_get_events_by_category_code_not_found(self):
        response = self.client.get('/events/INVALID_CODE')
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', response.json)

if __name__ == '__main__':
    unittest.main()
