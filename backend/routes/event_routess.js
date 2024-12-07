from flask import Blueprint, jsonify, request
from models.event import Event

event_routes = Blueprint('event_routes', __name__)

# Route to get events by category code
@event_routes.route('/events/<category_code>', methods=['GET'])
def get_events_by_category_code(category_code):
    try:
        events = Event.objects(category_code=category_code)
        events_data = [{
            'id': str(event.id),
            'title': event.title,
            'description': event.description,
            'startDate': event.start_date.isoformat(),
            'endDate': event.end_date.isoformat(),
            'imageUrl': event.image_url
        } for event in events]
        return jsonify(events_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
