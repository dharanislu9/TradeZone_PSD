# blip_caption_api.py
from flask import Flask, request, jsonify
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import requests

app = Flask(__name__)

@app.route("/", methods=["GET"])
def root():
    return jsonify("Health check: Active")

# Load the BLIP model and processor 
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

@app.route('/caption', methods=['POST'])
def caption_image():
    print("Received a request on /caption endpoint")
    
    data = request.get_json()
    print("Request data:", data)
    
    image_url = data.get('imageUrl')

    if not image_url:
         print("Image URL is missing in the request")
         return jsonify({"error": "Image URL is required"}), 400

    try:
        # Load the image from the URL
        print("Fetching image from URL:", image_url)
        image = Image.open(requests.get(image_url, stream=True).raw)

        # Process the image and generate a caption
        print("Processing the image...")
        inputs = processor(image, return_tensors="pt")
        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        
        print("Generated caption:", caption)
        return jsonify({"caption": caption})

    except Exception as e:
        print("Error during processing:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=4301, debug=True)
