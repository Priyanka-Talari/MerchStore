from flask import Flask, render_template, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import mysql.connector

app = Flask(__name__)
CORS(app)

# File upload settings
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.environ['localhost'],
        user=os.environ['root'],
        password=os.environ['Priyank@1613'],
        database=os.environ['merchstore']
    )

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ===== ROUTES =====

# Main pages
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/customize')
def customize():
    return render_template('customize.html')


@app.route('/series')
def series():
    return render_template('series.html')



@app.route('/admin')
def admin():
    return render_template('admin-dashboard.html')

    # Keep existing routes
@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/login')
def login():
    return render_template('login.html')

# ADD THESE EXTRA ROUTES
@app.route('/register.html')
def register_html():
    return render_template('register.html')

@app.route('/login.html')
def login_html():
    return render_template('login.html')


# Products API for store frontend
@app.route('/products')
def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM products')
        products = cursor.fetchall()
        cursor.close()
        conn.close()

        # Format products for frontend
        store_products = []
        for product in products:
            image_url = product.get('image_url', '')
            if image_url and image_url.startswith('uploads/'):
                image_url = f"/static/{image_url}"
            elif not image_url:
                image_url = '/static/images/placeholder.jpg'

            store_products.append({
                'id': product.get('id'),
                'name': product.get('name', 'Unknown'),
                'price': float(product.get('price', 0)),
                'stock': product.get('quantity', 0),
                'image': image_url,
                'description': product.get('description', '')
            })

        return jsonify(store_products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Admin products API
@app.route('/get-products')
def get_admin_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM products')
        products = cursor.fetchall()
        cursor.close()
        conn.close()

        for product in products:
            product['stock'] = product.pop('quantity', 0)
            if product.get('image_url'):
                product['image'] = product['image_url'].split('/')[-1]

        return jsonify(products)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add product (Admin)
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

# Edit product (Admin)
@app.route('/edit-product/<int:product_id>', methods=['POST'])
def edit_product(product_id):
    try:
        data = request.get_json()
        name = data['name']
        price = float(data['price'])
        stock = int(data['stock'])

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'UPDATE products SET name = %s, price = %s, quantity = %s WHERE id = %s',
            (name, price, stock, product_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Product updated successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delete product (Admin)
@app.route('/delete-product/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM products WHERE id = %s', (product_id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({'message': 'Product deleted successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded images
@app.route('/static/uploads/<filename>')
def serve_uploaded_image(filename):
    return send_from_directory('static/uploads', filename)

# Serve static files (CSS, JS, Images)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Health check
@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    print("🚀 MerchStore Flask Server Started!")
    print("📍 Store: http://127.0.0.1:5000")
    print("🔐 login: http://127.0.0.1:5000/login")  # Added login URL
    print("📝 register: http://127.0.0.1:5000/register")
    print("🛒 Cart: http://127.0.0.1:5000/cart")
    print("⚙️  Admin: http://127.0.0.1:5000/admin")
    print("📦 Products API: http://127.0.0.1:5000/products")
    app.run(debug=True, host='127.0.0.1', port=5000)