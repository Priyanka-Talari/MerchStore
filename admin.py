from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import mysql.connector
import psycopg2
import psycopg2.extras


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Database Connection ---
def get_db_connection():
    return psycopg2.connect(
        host='dpg-d3ov6ae3jp1c739pfs9g-a',          # from your Render Internal DB URL
        database='merchstore_db',
        user='merchstore_db_user',
        password='YOUR_PASSWORD',                    # copy from Render
        port=5432
    )


# --- Utility ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---
@app.route('/')
def home():
    return jsonify({"message": "Server is running!"})

@app.route('/admin')
def admin_dashboard():
    return render_template('admin-dashboard.html')

@app.route('/get-products', methods=['GET'])
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM products')
        products = cursor.fetchall()
        cursor.close()
        conn.close()

        for p in products:
            if p.get('image_url'):
                p['image_url'] = f"/static/{p['image_url']}"
        return jsonify(products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/add-product', methods=['POST'])
def add_product():
    try:
        name = request.form['name']
        price = float(request.form['price'])
        stock = int(request.form['stock'])
        image = request.files['image']

        if not image or not allowed_file(image.filename):
            return jsonify({'error': 'Invalid image file'}), 400

        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(image_path)
        image_url = f"uploads/{filename}"

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO products (name, price, quantity, image_url) VALUES (%s, %s, %s, %s)',
            (name, price, stock, image_url)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Product added successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/static/uploads/<filename>')
def serve_uploaded_image(filename):
    return send_from_directory('static/uploads', filename)

if __name__ == '__main__':
    print("✅ Flask running at http://127.0.0.1:5000/admin")
    app.run(debug=True)
