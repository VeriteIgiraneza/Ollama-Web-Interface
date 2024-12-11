from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__,
            static_folder='static',  # Matches your static folder
            template_folder='templates'  # Matches your templates folder
            )

# Configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"


class OllamaAPI:
    @staticmethod
    def generate_response(prompt, model="llama2"):
        try:
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False
            }
            response = requests.post(OLLAMA_API_URL, json=payload)
            if response.status_code == 200:
                return response.json()['response']
            return f"Error: {response.status_code}"
        except Exception as e:
            return f"Error: {str(e)}"


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt', '')
    model = data.get('model', 'llama2')

    response = OllamaAPI.generate_response(prompt, model)
    return jsonify({'response': response})


if __name__ == '__main__':
    app.run(debug=True)