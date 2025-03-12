from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import trimesh

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'
ALLOWED_EXTENSIONS = {'stl', 'obj'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'model' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['model']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Create unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Save the file
        file.save(file_path)
        
        # Return the URL to access the file
        return jsonify({
            'message': 'File uploaded successfully',
            'modelUrl': f"http://localhost:5000/uploads/{unique_filename}"
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_file(os.path.join(UPLOAD_FOLDER, filename))

@app.route('/api/export', methods=['GET'])
def export_model():
    model_url = request.args.get('modelUrl')
    target_format = request.args.get('format', 'obj')  # Default to OBJ
    
    if not model_url:
        return jsonify({'error': 'No model URL provided'}), 400
    
    # Extract filename from URL
    filename = model_url.split('/')[-1]
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    source_format = filename.rsplit('.', 1)[1].lower()
    
    # Generate output filename
    output_filename = f"{uuid.uuid4()}.{target_format}"
    output_path = os.path.join(CONVERTED_FOLDER, output_filename)
    
    try:
        # Load the mesh
        mesh = trimesh.load(file_path)
        
        # Export in the target format
        mesh.export(output_path)
        
        return send_file(
            output_path,
            as_attachment=True,
            download_name=f"converted_model.{target_format}"
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
