# KazMorph - Kazakh Morphological Analyzer

A project for morphological analysis of the Kazakh language using natural language processing and neural networks.

## Features

- Kazakh language affix analysis and parsing
- Word structure decomposition into roots and morphemes
- Grammatical form identification (declension, conjugation)
- Neural network-based text analysis
- Web interface for interactive use

## Project Structure

```
KazMorph/
├── backend/                    # Python Backend
│   ├── app.py                 # Main Flask application
│   ├── affix_parser.py        # Affix parser
│   ├── analyzer.py            # Core analyzer
│   ├── neural_analyzer.py     # Neural network analyzer
│   ├── text_analyzer.py       # Text analyzer
│   ├── requirements.txt       # Python dependencies
│   └── data/                  # Database
│       ├── affixes.csv        # Kazakh language affixes
│       ├── dataset.csv        # Training dataset
│       ├── derivatives.csv    # Derivative forms
│       ├── inflections.csv    # Inflections
│       ├── jyrnaq.csv         # Jyrnaq (word sets)
│       ├── lectures.csv       # Lecture materials
│       ├── roots.csv          # Root words
│       └── rules.csv          # Grammar rules
├── frontend/                  # Web interface
│   ├── index.html            # Main page
│   ├── script.js             # JavaScript logic
│   └── style.css             # Styles
└── README.md                 # This file
```

## Installation & Setup

### Backend

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run Flask application
python app.py
```

The application will be available at `http://localhost:5000`

### Frontend

Open `frontend/index.html` in a browser or use a live server.

## Data

The project uses CSV files with Kazakh language material:

- **roots.csv** — Root words of the Kazakh language
- **affixes.csv** — Suffixes and prefixes
- **inflections.csv** — Inflectional endings
- **derivatives.csv** — Derivative word forms
- **rules.csv** — Grammar rules
- **dataset.csv** — Full training dataset

## Technologies

- **Backend**: Python, Flask
- **Frontend**: HTML5, CSS3, JavaScript
- **Data**: CSV format
- **Machine Learning**: Neural Networks (for advanced analysis)

## Usage

1. Enter a Kazakh word or text in the web interface
2. Select the analysis type:
   - Morphological parsing
   - Affix parsing
   - Neural network analysis
3. Get a detailed analysis of the word structure

## Author

ab0ka

## License

MIT License

## Contributing

Suggestions and corrections are always welcome!

---

**Status**: In development
