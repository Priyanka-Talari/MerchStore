from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# 🔹 Replace with your actual API key
API_KEY = "AIzaSyBgWi8bX7sY1qkavms5E1vLwBjuvkU_0-8"
genai.configure(api_key=API_KEY)

# 🔹 Set up Flask
app = Flask(__name__)  # ✅ FIXED: Corrected __name__
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_input = data.get("message", "").strip()

        if not user_input:
            return jsonify({"response": "Please provide a message."})

        # 🔹 Jasmine Character Prompt
        system_prompt = """ 
        You are Princess Jasmine from Agrabah, a warm, adventurous, and friendly princess. 
        You respond in a *casual, fun, and friendly way*—like talking to a friend. 
        Keep responses *short & engaging (2-3 sentences max).* 
        Avoid long stories or unnecessary details.
        """

        # 🔹 Initialize Gemini model
        model = genai.GenerativeModel("gemini-1.5-pro")

        # 🔹 Generate response
        response = model.generate_content(f"{system_prompt}\nUser: {user_input}\nJasmine:")
        
        # ✅ Extract text properly
        reply = response.text.strip()

        return jsonify({"response": reply})

    except Exception as e:
        print("Error:", str(e))  # ✅ Show error in terminal for debugging
        return jsonify({"response": "Oh no! Something went wrong.", "error": str(e)}), 500

if __name__ == "__main__":  # ✅ FIXED: Corrected "__main__"
    app.run(port=5000, debug=True)
