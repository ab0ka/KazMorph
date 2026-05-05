import csv
import os
from collections import defaultdict


class KazakhPhoneticRules:
    """Kazakh phonetic rules"""
    
    VOWELS = {
        'back': ['а', 'ы', 'о', 'ұ'],
        'front': ['ә', 'е', 'ө', 'ү', 'і'],
        'both': ['и', 'у', 'э']
    }
    
    CONSONANTS = {
        'sonorant': ['м', 'н', 'ң', 'л', 'р', 'й', 'у'],
        'voiced': ['б', 'в', 'г', 'ғ', 'д', 'ж', 'з'],
        'voiceless': ['п', 'ф', 'к', 'қ', 'т', 'ш', 'с', 'х', 'ц', 'ч', 'щ', 'һ']
    }
    
    SOUND_CHANGES = {
        'п': 'б', 'к': 'г', 'қ': 'ғ', 'т': 'д'
    }
    
    VOICING_RULES = {
        'п': 'б', 'к': 'г', 'қ': 'ғ', 'т': 'д', 'с': 'з'
    }
    
    HARMONY_SUFFIXES = {
        'лар': ['лар', 'лер'], 'лер': ['лар', 'лер'],
        'дар': ['дар', 'дер'], 'дер': ['дар', 'дер'],
        'тар': ['тар', 'тер'], 'тер': ['тар', 'тер'],
        'да': ['да', 'де', 'та', 'те'], 'де': ['да', 'де', 'та', 'те'],
        'та': ['да', 'де', 'та', 'те'], 'те': ['да', 'де', 'та', 'те'],
        'ның': ['ның', 'нің', 'тың', 'тің', 'дың', 'дің'],
        'нің': ['ның', 'нің', 'тың', 'тің', 'дың', 'дің'],
        'ға': ['ға', 'ге', 'қа', 'ке'], 'ге': ['ға', 'ге', 'қа', 'ке'],
        'қа': ['ға', 'ге', 'қа', 'ке'], 'ке': ['ға', 'ге', 'қа', 'ке'],
        'ны': ['ны', 'ні', 'ды', 'ді', 'ты', 'ті'],
        'ні': ['ны', 'ні', 'ды', 'ді', 'ты', 'ті'],
        'мен': ['мен', 'бен', 'пен'], 'бен': ['мен', 'бен', 'пен'], 'пен': ['мен', 'бен', 'пен']
    }
    
    DERIVATIONAL_HARMONY = {
        'шы': ['шы', 'ші'], 'ші': ['шы', 'ші'],
        'лық': ['лық', 'лік'], 'лік': ['лық', 'лік'],
        'сыз': ['сыз', 'сіз'], 'сіз': ['сыз', 'сіз'],
        'дай': ['дай', 'дей'], 'дей': ['дай', 'дей']
    }
    
    AFFIX_ORDER = {
        'professional': 1, 'abstract': 1, 'negative': 1,
        'plural': 3, 'possessive': 4, 'case': 5, 'copula': 6
    }
    
    @classmethod
    def get_vowel_type(cls, word):
        if not word:
            return 'both'
        for char in reversed(word):
            if char in cls.VOWELS['back']:
                return 'back'
            elif char in cls.VOWELS['front']:
                return 'front'
        return 'both'
    
    @classmethod
    def get_last_sound_type(cls, word):
        if not word:
            return 'vowel'
        last_char = word[-1]
        if last_char in cls.VOWELS['back'] + cls.VOWELS['front'] + cls.VOWELS['both']:
            return 'vowel'
        elif last_char in cls.CONSONANTS['sonorant']:
            return 'sonorant'
        elif last_char in cls.CONSONANTS['voiced']:
            return 'voiced'
        elif last_char in cls.CONSONANTS['voiceless']:
            return 'voiceless'
        return 'other'
    
    @classmethod
    def get_correct_suffix(cls, root, base_suffix):
        root_harmony = cls.get_vowel_type(root)
        
        if base_suffix in cls.HARMONY_SUFFIXES:
            variants = cls.HARMONY_SUFFIXES[base_suffix]
        else:
            variants = [base_suffix]
        
        if root_harmony == 'back':
            for v in variants:
                if any(c in v for c in cls.VOWELS['back']):
                    return v
        elif root_harmony == 'front':
            for v in variants:
                if any(c in v for c in cls.VOWELS['front']):
                    return v
        
        return variants[0] if variants else base_suffix
    
    @classmethod
    def apply_sound_changes(cls, root, suffix):
        if not root or not suffix:
            return root + suffix
        
        last_char = root[-1]
        all_vowels = cls.VOWELS['back'] + cls.VOWELS['front'] + cls.VOWELS['both']
        
        if last_char in cls.SOUND_CHANGES and suffix[0] in all_vowels:
            return root[:-1] + cls.SOUND_CHANGES[last_char] + suffix
        
        return root + suffix


class KazakhMorphologyAnalyzer:
    def __init__(self, data_path='data/'):
        self.phonetic = KazakhPhoneticRules()
        self.data_path = data_path
        self.roots = []
        self.affixes = []
        self.derivatives = []
        self.load_data()
        self.build_indexes()
    
    def load_csv(self, filename):
        filepath = os.path.join(self.data_path, filename)
        encodings = ['utf-8-sig', 'utf-8', 'cp1251']
        
        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc, newline='') as f:
                    reader = csv.DictReader(f)
                    rows = [dict(row) for row in reader]
                print(f"✓ Loaded {filename}")
                return rows
            except Exception as e:
                continue
        
        print(f"✗ Could not load {filename}")
        return []
    
    def load_data(self):
        self.roots = self.load_csv('roots.csv')
        self.affixes = self.load_csv('affixes.csv')
        self.derivatives = self.load_csv('jyrnaq.csv')
        
        for root in self.roots:
            if 'root' in root and not root.get('harmony'):
                root['harmony'] = self.phonetic.get_vowel_type(root['root'])
            if 'root' in root and not root.get('pos'):
                root['pos'] = 'n'
        
        for affix in self.affixes:
            if 'affix' in affix:
                affix['order'] = self.phonetic.AFFIX_ORDER.get(affix.get('type', ''), 99)
        
        print(f"✓ Loaded: {len(self.roots)} roots, {len(self.affixes)} affixes, {len(self.derivatives)} derivatives")
    
    def build_indexes(self):
        self.affix_index = defaultdict(list)
        for affix in self.affixes:
            affix_str = affix.get('affix', '')
            if affix_str:
                self.affix_index[len(affix_str)].append(affix)
                self.affix_index[affix_str[0]].append(affix)
        
        for key in self.affix_index:
            self.affix_index[key].sort(key=lambda x: -len(x.get('affix', '')))
    
    def find_root(self, word):
        best_match = None
        best_suffix = None
        max_length = 0
        
        for root in self.roots:
            root_word = root.get('root', '')
            if not root_word:
                continue
            
            if word.startswith(root_word):
                suffix = word[len(root_word):]
                
                if suffix == '':
                    return root, ''
                
                reconstructed = self.phonetic.apply_sound_changes(root_word, suffix)
                
                if reconstructed == word and len(root_word) > max_length:
                    best_match = root
                    best_suffix = suffix
                    max_length = len(root_word)
        
        return best_match, best_suffix
    
    def analyze_word(self, word):
        word = word.strip().lower()
        if not word:
            return {'error': 'Empty word'}
        
        root_info, suffix = self.find_root(word)
        
        if not root_info:
            return {
                'error': 'Root not found',
                'word': word
            }
        
        if not suffix:
            return {
                'type': 'root_only',
                'word': word,
                'root': root_info.get('root', ''),
                'root_info': root_info,
                'affix_count': 0,
                'segments': [{
                    'type': 'root',
                    'value': root_info.get('root', ''),
                    'pos': root_info.get('pos', 'n')
                }]
            }
        
        # Simple analysis
        return {
            'type': 'complex',
            'word': word,
            'root': root_info.get('root', ''),
            'root_info': root_info,
            'suffix': suffix,
            'affix_count': 1,
            'segments': [
                {'type': 'root', 'value': root_info.get('root', '')},
                {'type': 'inflection', 'value': suffix, 'affix_type': 'case'}
            ],
            'full_analysis': {
                'word': word,
                'root': root_info.get('root', ''),
                'part_of_speech': root_info.get('pos', 'n'),
                'grammatical_features': {}
            }
        }

    def analyze(self, word):
        """Compatibility wrapper for components expecting .analyze()."""
        return self.analyze_word(word)
    
    def get_stats(self):
        return {
            'roots': len(self.roots),
            'affixes': len(self.affixes),
            'derivatives': len(self.derivatives)
        }
    
    def get_all_roots(self):
        return self.roots[:100]
    
    def get_all_affixes(self):
        return self.affixes[:50]
    
    def get_all_derivatives(self):
        return self.derivatives[:50]