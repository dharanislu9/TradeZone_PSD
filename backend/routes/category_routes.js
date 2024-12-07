from flask import Blueprint, jsonify, request
from models.category import Category

category_routes = Blueprint('category_routes', __name__)

# Route to get all categories
@category_routes.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.objects.all()
        categories_data = [{'id': str(category.id), 'title': category.title, 'subTitle': category.sub_title, 'code': category.code, 'imageUrl': category.image_url} for category in categories]
        return jsonify({'categories': categories_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to get category by its code
@category_routes.route('/categories/<category_code>', methods=['GET'])
def get_category_by_code(category_code):
    try:
        category = Category.objects.get(code=category_code)
        return jsonify({'id': str(category.id), 'title': category.title, 'subTitle': category.sub_title, 'code': category.code, 'imageUrl': category.image_url}), 200
    except Category.DoesNotExist:
        return jsonify({'error': 'Category not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
