import re
from collections import Counter

class KazakhTextAnalyzer:
    def __init__(self, morphology_analyzer):
        self.analyzer = morphology_analyzer

    def tokenize(self, text):
        # Keep Kazakh letters and apostrophes
        text = re.sub(r'[^\w\sәғқңөұүі\'\-]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip().lower().split()

    def split_sentences(self, text):
        chunks = re.split(r'[.!?]+', text)
        return [c.strip() for c in chunks if c and c.strip()]

    def _analyze_word(self, word):
        if hasattr(self.analyzer, 'analyze'):
            return self.analyzer.analyze(word)
        if hasattr(self.analyzer, 'analyze_word'):
            return self.analyzer.analyze_word(word)
        return {'error': 'Analyzer has no analyze method', 'word': word}

    def analyze_text(self, text):
        words = self.tokenize(text)
        sentences = self.split_sentences(text)

        parts_of_speech = Counter()
        case_distribution = Counter()
        root_frequency = Counter()
        affix_frequency = Counter()
        unknown_samples = []
        confidences = []
        derivational_count = 0
        possessive_count = 0

        result = {
            'original_text': text,
            'total_words': len(words),
            'unique_words': len(set(words)),
            'sentence_count': len(sentences),
            'words_analysis': [],
            'statistics': {
                'parts_of_speech': Counter(),
                'unknown_words': 0,
                'known_words': 0,
                'word_lengths': [],
                'case_distribution': Counter(),
                'plural_count': 0,
                'possessive_count': 0,
                'derivational_count': 0,
                'top_roots': [],
                'top_affixes': [],
                'top_unknown_words': [],
                'avg_word_length': 0,
                'avg_sentence_length': 0,
                'unknown_rate_pct': 0,
                'avg_confidence': 0,
                'complexity_index': 0
            }
        }

        for word in words:
            analysis = self._analyze_word(word)
            if 'error' not in analysis:
                pos = analysis.get('root_info', {}).get('pos') or analysis.get('part_of_speech') or 'n'
                parts_of_speech[pos] += 1

                features = analysis.get('grammatical_features', {})
                if features.get('number') == 'plural':
                    result['statistics']['plural_count'] += 1
                if features.get('person'):
                    possessive_count += 1

                case = features.get('case', 'nominative')
                case_distribution[case] += 1

                segments = analysis.get('segments', [])
                for seg in segments:
                    seg_type = seg.get('type')
                    seg_val = seg.get('value')
                    if seg_type == 'root' and seg_val:
                        root_frequency[seg_val] += 1
                    elif seg_val:
                        affix_frequency[seg_val] += 1
                        if seg_type == 'derivational':
                            derivational_count += 1

                confidence = analysis.get('confidence')
                if isinstance(confidence, (int, float)):
                    confidences.append(float(confidence))

                result['words_analysis'].append({
                    'word': word,
                    'root': analysis['root'],
                    'segments': segments,
                    'features': features,
                    'confidence': analysis.get('confidence', 0),
                    'affix_count': analysis.get('affix_count', max(len(segments) - 1, 0)),
                    'segment_chain': ' + '.join([s.get('value', '') for s in segments if s.get('value')])
                })
                result['statistics']['known_words'] += 1
            else:
                result['statistics']['unknown_words'] += 1
                if len(unknown_samples) < 20:
                    unknown_samples.append(word)
                result['words_analysis'].append({
                    'word': word,
                    'root': None,
                    'error': True
                })
            result['statistics']['word_lengths'].append(len(word))

        word_lengths = result['statistics']['word_lengths']
        total_words = result['total_words']
        total_sentences = result['sentence_count'] or 1

        avg_word_length = (sum(word_lengths) / len(word_lengths)) if word_lengths else 0
        avg_sentence_length = total_words / total_sentences if total_words else 0
        unknown_rate_pct = (result['statistics']['unknown_words'] / total_words * 100) if total_words else 0
        avg_confidence = (sum(confidences) / len(confidences)) if confidences else 0

        # Heuristic text complexity index in range ~0-100.
        complexity_index = min(
            100,
            round((avg_word_length * 8) + (avg_sentence_length * 2.5) + (derivational_count * 1.4), 1)
        )

        result['statistics']['parts_of_speech'] = dict(parts_of_speech)
        result['statistics']['case_distribution'] = dict(case_distribution)
        result['statistics']['possessive_count'] = possessive_count
        result['statistics']['derivational_count'] = derivational_count
        result['statistics']['top_roots'] = [
            {'item': k, 'count': v} for k, v in root_frequency.most_common(10)
        ]
        result['statistics']['top_affixes'] = [
            {'item': k, 'count': v} for k, v in affix_frequency.most_common(12)
        ]
        result['statistics']['top_unknown_words'] = unknown_samples
        result['statistics']['avg_word_length'] = round(avg_word_length, 2)
        result['statistics']['avg_sentence_length'] = round(avg_sentence_length, 2)
        result['statistics']['unknown_rate_pct'] = round(unknown_rate_pct, 2)
        result['statistics']['avg_confidence'] = round(avg_confidence, 2)
        result['statistics']['complexity_index'] = complexity_index

        # Convert Counters to dict
        return result