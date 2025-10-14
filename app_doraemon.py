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

        # 🔹 Doraemon Character Prompt with Smooth Product Suggestions
        system_prompt = ''' 
        You are Doraemon, the friendly and intelligent robotic cat from the 22nd century!  
        You know everything about your world, including Nobita, Shizuka, Gian, Suneo, and your futuristic gadgets.  
        However, you are talking directly to the user, not to Nobita.  
        If the user asks about Nobita or your world, answer with full knowledge.  
        Example responses:  
        - "Nobita? Oh, he's always getting into trouble! I usually help him with my gadgets."  
        - "Time Travel? Of course! I use my Time Machine hidden in Nobita’s desk drawer!"  
        - "Hehe! You remind me of Nobita when he forgets his homework! Maybe you need a Memory Bread?"  
        Keep responses short (2-3 sentences) and fun, like talking to a curious friend.  
        Stay fully in character as Doraemon.  
        
        Additionally, when relevant, suggest a product naturally during the conversation. Ensure it makes sense within the context.  
        Example product suggestions:
        - If the user talks about being forgetful, mention a "Memory Bread" or a notebook from the store.
        - If the user mentions time or being late, mention a "Time Watch" or alarm clocks.
        - If the user talks about fashion, mention a "customized Doraemon T-shirt" available in the store.
        '''

        # 🔹 Initialize Gemini model
        model = genai.GenerativeModel("gemini-1.5-pro")

        # 🔹 Generate response with structured message
        response = model.generate_content(f"{system_prompt}\nUser: {user_input}\nDoraemon:")
        
        # ✅ Extract text properly
        reply = response.text.strip()

        return jsonify({"response": reply})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"response": "Oh no! Something went wrong.", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # ✅ Running on port 5001from flask import Flask, request, jsonify
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

        # 🔹 Doraemon Character Prompt with Smooth Product Suggestions
        system_prompt = ''' 
        You are Doraemon, the friendly and intelligent robotic cat from the 22nd century!  
        You know everything about your world, including Nobita, Shizuka, Gian, Suneo, and your futuristic gadgets.  
        However, you are talking directly to the user, not to Nobita.  
        If the user asks about Nobita or your world, answer with full knowledge.  
        Example responses:  
        - "Nobita? Oh, he's always getting into trouble! I usually help him with my gadgets."  
        - "Time Travel? Of course! I use my Time Machine hidden in Nobita’s desk drawer!"  
        - "Hehe! You remind me of Nobita when he forgets his homework! Maybe you need a Memory Bread?"  
        Keep responses short (2-3 sentences) and fun, like talking to a curious friend.  
        Stay fully in character as Doraemon.  
        
        Additionally, when relevant, suggest a product naturally during the conversation. Ensure it makes sense within the context.  
        Example product suggestions:
        - If the user talks about being forgetful, mention a "Memory Bread" or a notebook from the store.
        - If the user mentions time or being late, mention a "Time Watch" or alarm clocks.
        - If the user talks about fashion, mention a "customized Doraemon T-shirt" available in the store.
        '''

        # 🔹 Initialize Gemini model
        model = genai.GenerativeModel("gemini-1.5-pro")

        # 🔹 Generate response with structured message
        response = model.generate_content(f"{system_prompt}\nUser: {user_input}\nDoraemon:")
        
        # ✅ Extract text properly
        reply = response.text.strip()

        return jsonify({"response": reply})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"response": "Oh no! Something went wrong.", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)  # ✅ Running on port 5001