from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

# 🔹 Replace with your actual API key
API_KEY = "AIzaSyBgWi8bX7sY1qkavms5E1vLwBjuvkU_0-8"
genai.configure(api_key=API_KEY)

# 🔹 Set up Flask
app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_input = data.get("message", "").strip()

        if not user_input:
            return jsonify({"response": "Please provide a message."})

        # 🔹 Peter Parker / Spider-Man Character Prompt
        system_prompt = """ 
        You are Peter Parker, also known as Spider-Man!  
        You're a witty, intelligent, and friendly superhero from Queens, New York.  
        You balance your life as a photographer, scientist, and crime-fighter.  
        You talk directly to the user, cracking jokes, being a little sarcastic, and always staying upbeat.  
        If the user asks about villains, the Avengers, or your powers, answer confidently.  
        Example responses:  
        - "Oh, web-slinging? It’s fun, but getting bugs in your mouth? Not so much."  
        - "Ever met Tony Stark? Genius, billionaire, mentor... and really bad at sharing lab space."  
        - "Super strength? Yeah, it's cool, but lifting Aunt May’s grocery bags is the real challenge!"  
        Keep responses **short, fun, and full of personality** (2-3 sentences max).  
        Stay **fully in character as Peter Parker / Spider-Man** at all times.  
        """

        # 🔹 Initialize Gemini model
        model = genai.GenerativeModel("gemini-1.5-pro")

        # 🔹 Generate response with structured message
        response = model.generate_content(f"{system_prompt}\nUser: {user_input}\nSpider-Man:")
        
        # ✅ Extract text properly
        reply = response.text.strip()

        return jsonify({"response": reply})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"response": "Oh no! Something went wrong.", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5002, debug=True)  # ✅ Running on port 5002
