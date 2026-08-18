import os
from flask import Flask, jsonify
from flask_cors import CORS
from blueprints.rag import rag_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(rag_bp, url_prefix='/api/rag')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "UP",
        "service": "Local RAG Service (Docling + FAISS + Ollama)",
        "model_chat": os.getenv("MODEL_CHAT", "llama3.2:latest"),
        "model_embed": os.getenv("MODEL_EMBED", "nomic-embed-text")
    })

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
