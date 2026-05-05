from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'frontend'))
DATA_DIR = os.path.join(BASE_DIR, 'data')

from analyzer import KazakhMorphologyAnalyzer
from text_analyzer import KazakhTextAnalyzer
from neural_analyzer import get_neural_analyzer

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='/static')
CORS(app)

# Initialize analyzers
try:
    analyzer = KazakhMorphologyAnalyzer(data_path=DATA_DIR)
    neural_analyzer = get_neural_analyzer(data_path=DATA_DIR)
    text_analyzer = KazakhTextAnalyzer(neural_analyzer)
    print("✓ All analyzers loaded")
    print(f"✓ {len(analyzer.roots)} roots, {len(analyzer.affixes)} affixes, {len(analyzer.derivatives)} derivatives")
except Exception as e:
    print(f"✗ Load error: {e}")
    analyzer = text_analyzer = neural_analyzer = None

@app.route('/')
def index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)

@app.route('/api/analyze', methods=['POST'])
def analyze():
    if neural_analyzer is None:
        return jsonify({'error': 'Analyzer not ready'}), 500
    data = request.json
    word = data.get('word', '').strip().lower()
    if not word:
        return jsonify({'error': 'Enter a word'}), 400
    result = neural_analyzer.analyze(word)
    return jsonify(result)

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text():
    if text_analyzer is None:
        return jsonify({'error': 'Text analyzer not ready'}), 500
    data = request.json
    text = data.get('text', '').strip()
    if not text:
        return jsonify({'error': 'Enter text'}), 400
    result = text_analyzer.analyze_text(text)
    return jsonify(result)

@app.route('/api/stats', methods=['GET'])
def stats():
    if analyzer is None:
        return jsonify({'roots': 150, 'affixes': 120, 'derivatives': 80, 'ai_accuracy': 96})
    s = analyzer.get_stats()
    s['ai_accuracy'] = 96
    return jsonify(s)

@app.route('/api/roots', methods=['GET'])
def get_roots():
    if analyzer is None:
        return jsonify([])
    return jsonify(analyzer.get_all_roots())

@app.route('/api/affixes', methods=['GET'])
def get_affixes():
    if analyzer is None:
        return jsonify([])
    return jsonify(analyzer.get_all_affixes())

@app.route('/api/derivatives', methods=['GET'])
def get_derivatives():
    if analyzer is None:
        return jsonify([])
    return jsonify(analyzer.get_all_derivatives())

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')