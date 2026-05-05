import re
import csv
import os
from collections import defaultdict

class NeuralMorphologyAnalyzer:
    CASE_TYPE_LABELS = {
        'genitive': 'ілік септік',
        'dative': 'барыс септік',
        'accusative': 'табыс септік',
        'locative': 'жатыс септік',
        'ablative': 'шығыс септік',
        'instrumental': 'көмектес септік',
    }

    POSSESSIVE_TYPE_LABELS = {
        'possessive': 'тәуелдік жалғау',
        'possessive_1sg': '1-жақ жекеше тәуелдік жалғау',
        'possessive_2sg': '2-жақ жекеше тәуелдік жалғау',
        'possessive_3sg': '3-жақ жекеше тәуелдік жалғау',
        'possessive_1pl': '1-жақ көпше тәуелдік жалғау',
        'possessive_2pl_polite': '2-жақ сыпайы тәуелдік жалғау',
    }

    DERIVATIONAL_TYPE_LABELS = {
        'professional': 'мамандық иесі',
        'abstract': 'абстрактілі зат есім',
        'negative': 'болымсыздық',
        'gerund': 'есімше',
        'comparative': 'теңеу',
        'comparative_adj': 'салыстырмалы шырай',
        'passive': 'ырықсыз етіс',
        'reflexive': 'өздік етіс',
        'cooperative': 'ортақ етіс',
        'causative': 'өзгелік етіс',
    }

    POSSESSIVE_SURFACE_LABELS = {
        'ым': '1-жақ жекеше тәуелдік жалғау',
        'ім': '1-жақ жекеше тәуелдік жалғау',
        'ың': '2-жақ жекеше тәуелдік жалғау',
        'ің': '2-жақ жекеше тәуелдік жалғау',
        'сы': '3-жақ жекеше тәуелдік жалғау',
        'сі': '3-жақ жекеше тәуелдік жалғау',
        'мыз': '1-жақ көпше тәуелдік жалғау',
        'міз': '1-жақ көпше тәуелдік жалғау',
        'ымыз': '1-жақ көпше тәуелдік жалғау',
        'іміз': '1-жақ көпше тәуелдік жалғау',
        'ыңыз': '2-жақ сыпайы тәуелдік жалғау',
        'іңіз': '2-жақ сыпайы тәуелдік жалғау',
    }

    POSSESSIVE_SURFACE_TYPES = {
        'ым': 'possessive_1sg', 'ім': 'possessive_1sg',
        'ың': 'possessive_2sg', 'ің': 'possessive_2sg',
        'сы': 'possessive_3sg', 'сі': 'possessive_3sg',
        'мыз': 'possessive_1pl', 'міз': 'possessive_1pl',
        'ымыз': 'possessive_1pl', 'іміз': 'possessive_1pl',
        'ыңыз': 'possessive_2pl_polite', 'іңіз': 'possessive_2pl_polite',
    }

    CASE_SURFACE_TYPES = {
        'ның': 'genitive', 'нің': 'genitive', 'дың': 'genitive', 'дің': 'genitive', 'тың': 'genitive', 'тің': 'genitive',
        'ға': 'dative', 'ге': 'dative', 'қа': 'dative', 'ке': 'dative',
        'ны': 'accusative', 'ні': 'accusative', 'ды': 'accusative', 'ді': 'accusative', 'ты': 'accusative', 'ті': 'accusative',
        'да': 'locative', 'де': 'locative', 'та': 'locative', 'те': 'locative',
        'нан': 'ablative', 'нен': 'ablative', 'дан': 'ablative', 'ден': 'ablative', 'тан': 'ablative', 'тен': 'ablative',
        'мен': 'instrumental', 'бен': 'instrumental', 'пен': 'instrumental'
    }

    def __init__(self, data_path='data/'):
        self.roots = []
        self.affixes = []
        self.derivatives = []
        self.root_index = set()
        self.root_pos_index = {}
        self.roots_sorted = []
        self.final_consonant_voicing = {'п': 'б', 'к': 'г', 'қ': 'ғ', 'т': 'д', 'с': 'з'}
        self._load_affix_data(data_path)
        self._build_affix_index()
        self.vowels_back = set('аыоұ')
        self.vowels_front = set('әеөүі')
        self.vowels = self.vowels_back | self.vowels_front

    def _load_affix_data(self, data_path):
        def read_csv_records(path):
            for enc in ('utf-8-sig', 'utf-8', 'cp1251'):
                try:
                    with open(path, 'r', encoding=enc, newline='') as f:
                        return [dict(row) for row in csv.DictReader(f)]
                except Exception:
                    continue
            return []

        # Load roots.csv
        roots_path = os.path.join(data_path, 'roots.csv')
        if os.path.exists(roots_path):
            self.roots = read_csv_records(roots_path)
            self.root_pos_index = {
                (r.get('root') or '').strip().lower(): (r.get('pos') or '').strip().lower()
                for r in self.roots
                if (r.get('root') or '').strip()
            }
            self.root_index = {
                (r.get('root') or '').strip().lower()
                for r in self.roots
                if (r.get('root') or '').strip()
            }
            self.roots_sorted = sorted(self.root_index, key=len, reverse=True)

        # Load affixes.csv
        affix_path = os.path.join(data_path, 'affixes.csv')
        if os.path.exists(affix_path):
            self.affixes = read_csv_records(affix_path)
        # Load jyrnaq.csv (derivational)
        deriv_path = os.path.join(data_path, 'jyrnaq.csv')
        if os.path.exists(deriv_path):
            self.derivatives = read_csv_records(deriv_path)
            # Add derivational affixes while preserving original type.
            for d in self.derivatives:
                entry = dict(d)
                entry['morph_class'] = 'derivational'
                self.affixes.append(entry)
        # If no files, use fallback
        if not self.affixes:
            self._fallback_affixes()
        if not self.roots_sorted:
            self.roots_sorted = [
                'кітап', 'бала', 'мектеп', 'үй', 'дос', 'ата', 'әже', 'оқу', 'жазу',
                'келу', 'бару', 'көру', 'айту', 'отыр', 'жүр', 'жұмыс', 'ауыл', 'қала',
                'кітапхана', 'мұғалім', 'оқушы', 'ана', 'әке', 'аға', 'іні', 'қыз'
            ]

    def _fallback_affixes(self):
        self.affixes = [
            {'affix': 'лар', 'type': 'plural'}, {'affix': 'лер', 'type': 'plural'},
            {'affix': 'дар', 'type': 'plural'}, {'affix': 'дер', 'type': 'plural'},
            {'affix': 'тар', 'type': 'plural'}, {'affix': 'тер', 'type': 'plural'},
            {'affix': 'ның', 'type': 'genitive'}, {'affix': 'нің', 'type': 'genitive'},
            {'affix': 'ға', 'type': 'dative'}, {'affix': 'ге', 'type': 'dative'},
            {'affix': 'ны', 'type': 'accusative'}, {'affix': 'ні', 'type': 'accusative'},
            {'affix': 'да', 'type': 'locative'}, {'affix': 'де', 'type': 'locative'},
            {'affix': 'нан', 'type': 'ablative'}, {'affix': 'нен', 'type': 'ablative'},
            {'affix': 'мен', 'type': 'instrumental'}, {'affix': 'бен', 'type': 'instrumental'},
            {'affix': 'пен', 'type': 'instrumental'},
            {'affix': 'ым', 'type': 'possessive_1sg'}, {'affix': 'ім', 'type': 'possessive_1sg'},
            {'affix': 'ың', 'type': 'possessive_2sg'}, {'affix': 'ің', 'type': 'possessive_2sg'},
            {'affix': 'сы', 'type': 'possessive_3sg'}, {'affix': 'сі', 'type': 'possessive_3sg'},
            {'affix': 'мыз', 'type': 'possessive_1pl'}, {'affix': 'міз', 'type': 'possessive_1pl'},
            {'affix': 'шы', 'type': 'derivational'}, {'affix': 'ші', 'type': 'derivational'},
            {'affix': 'лық', 'type': 'derivational'}, {'affix': 'лік', 'type': 'derivational'},
        ]

    def _build_affix_index(self):
        self.affix_by_len = defaultdict(list)
        for a in self.affixes:
            aff = a.get('affix') or a.get('jyrnaq')
            if aff:
                self.affix_by_len[len(aff)].append(a)
        self.affix_lengths = sorted(self.affix_by_len.keys(), reverse=True)
        # Sort each length group by length descending already
        for l in self.affix_by_len:
            self.affix_by_len[l].sort(key=lambda x: -len(x.get('affix') or x.get('jyrnaq', '')))

    def _get_vowel_type(self, word):
        for ch in reversed(word):
            if ch in self.vowels_back:
                return 'back'
            if ch in self.vowels_front:
                return 'front'
        return 'both'

    def _harmonic_variant(self, affix_str, target_type):
        """Return the correct harmonic form of an affix."""
        variants = {
            'лар': 'лер', 'лер': 'лар',
            'дар': 'дер', 'дер': 'дар',
            'тар': 'тер', 'тер': 'тар',
            'ның': 'нің', 'нің': 'ның',
            'тың': 'тің', 'тің': 'тың',
            'дың': 'дің', 'дің': 'дың',
            'ға': 'ге', 'ге': 'ға',
            'қа': 'ке', 'ке': 'қа',
            'ны': 'ні', 'ні': 'ны',
            'ды': 'ді', 'ді': 'ды',
            'ты': 'ті', 'ті': 'ты',
            'да': 'де', 'де': 'да',
            'та': 'те', 'те': 'та',
            'нан': 'нен', 'нен': 'нан',
            'дан': 'ден', 'ден': 'дан',
            'тан': 'тен', 'тен': 'тан',
            'мен': 'бен', 'бен': 'пен', 'пен': 'мен',
            'шы': 'ші', 'ші': 'шы',
            'лық': 'лік', 'лік': 'лық',
            'сыз': 'сіз', 'сіз': 'сыз',
        }
        if affix_str in variants:
            if target_type == 'back':
                return affix_str if any(c in self.vowels_back for c in affix_str) else variants[affix_str]
            else:
                return affix_str if any(c in self.vowels_front for c in affix_str) else variants[affix_str]
        return affix_str

    def _find_root(self, word):
        """Find canonical root and segmented suffix for a surface word form."""
        segmentable_candidates = []
        prefix_candidates = []

        for root in self.roots_sorted:
            for surface in self._root_surface_forms(root):
                if not word.startswith(surface):
                    continue

                suffix = word[len(surface):]
                root_pos = self.root_pos_index.get(root, '')
                affixes = self._segment_suffix(suffix, root, root_pos) if suffix else []
                if suffix and affixes is None and root_pos == 'n':
                    affixes = self._heuristic_noun_affixes(suffix)
                candidate = {
                    'root': root,
                    'surface': surface,
                    'suffix': suffix,
                    'affixes': affixes,
                }

                if affixes is not None:
                    segmentable_candidates.append(candidate)
                prefix_candidates.append(candidate)

        if segmentable_candidates:
            segmentable_candidates.sort(
                key=lambda c: (
                    len(c['root']),
                    -len(c['suffix']),
                    len(c['affixes'])
                ),
                reverse=True
            )
            best = segmentable_candidates[0]
            return best['root'], best['suffix'], best['affixes']

        if prefix_candidates:
            prefix_candidates.sort(key=lambda c: len(c['root']), reverse=True)
            best = prefix_candidates[0]
            return best['root'], best['suffix'], None

        return None, None, None

    def _root_surface_forms(self, root):
        forms = {root}
        if root and root[-1] in self.final_consonant_voicing:
            forms.add(root[:-1] + self.final_consonant_voicing[root[-1]])
        return forms

    def _is_affix_compatible(self, aff, root_pos):
        if not root_pos:
            return True

        compat = (aff.get('pos_compatibility') or '').strip().lower()
        if not compat or compat in {'all', 'any'}:
            return True

        normalized = compat.replace('|', ',').replace(';', ',').replace(' ', ',')
        tokens = {t.strip() for t in normalized.split(',') if t.strip()}
        if not tokens:
            return True

        aliases = {
            'n': {'n', 'noun'},
            'v': {'v', 'verb'},
            'adj': {'adj', 'adjective'},
            'adv': {'adv', 'adverb'},
        }
        wanted = aliases.get(root_pos, {root_pos})
        return bool(tokens & wanted)

    def _segment_suffix(self, suffix, root, root_pos=''):
        if not suffix:
            return []

        root_vowel = self._get_vowel_type(root)
        memo = {}

        def split(rest):
            if rest == '':
                return []
            if rest in memo:
                return memo[rest]

            for length in self.affix_lengths:
                if len(rest) < length:
                    continue

                cand = rest[:length]
                for aff in self.affix_by_len[length]:
                    aff_str = (aff.get('affix') or aff.get('jyrnaq') or '').strip().lower()
                    if not aff_str:
                        continue
                    if not self._is_affix_compatible(aff, root_pos):
                        continue

                    variants = {aff_str, self._harmonic_variant(aff_str, root_vowel)}
                    if cand in variants:
                        tail = split(rest[length:])
                        if tail is not None:
                            matched = dict(aff)
                            matched['matched_value'] = cand
                            memo[rest] = [matched] + tail
                            return memo[rest]

            memo[rest] = None
            return None

        return split(suffix)

    def _heuristic_noun_affixes(self, suffix):
        plural_forms = ['лар', 'лер', 'дар', 'дер', 'тар', 'тер']
        possessive_forms = sorted(self.POSSESSIVE_SURFACE_TYPES.keys(), key=len, reverse=True)
        case_forms = sorted(self.CASE_SURFACE_TYPES.keys(), key=len, reverse=True)

        rest = suffix
        result = []

        matched_plural = next((p for p in plural_forms if rest.startswith(p)), None)
        if matched_plural:
            result.append({
                'type': 'plural',
                'matched_value': matched_plural,
                'surface': matched_plural,
                'meaning_kz': 'көптік жалғау'
            })
            rest = rest[len(matched_plural):]

        matched_possessive = next((p for p in possessive_forms if rest.startswith(p)), None)
        if matched_possessive:
            result.append({
                'type': self.POSSESSIVE_SURFACE_TYPES[matched_possessive],
                'matched_value': matched_possessive,
                'surface': matched_possessive,
                'meaning_kz': self.POSSESSIVE_SURFACE_LABELS.get(matched_possessive, 'тәуелдік жалғау')
            })
            rest = rest[len(matched_possessive):]

        matched_case = next((c for c in case_forms if rest.startswith(c)), None)
        if matched_case:
            result.append({
                'type': self.CASE_SURFACE_TYPES[matched_case],
                'matched_value': matched_case,
                'surface': matched_case,
                'meaning_kz': self.CASE_TYPE_LABELS.get(self.CASE_SURFACE_TYPES[matched_case], 'септік')
            })
            rest = rest[len(matched_case):]

        if rest != '' or not result:
            return None
        return result

    def _affix_surface(self, aff):
        return (aff.get('matched_value') or aff.get('affix') or aff.get('jyrnaq') or '').strip().lower()

    def _affix_type(self, aff):
        raw_type = (aff.get('type') or '').strip().lower()
        morph_class = (aff.get('morph_class') or '').strip().lower()
        if morph_class == 'derivational' and raw_type:
            return raw_type
        if raw_type:
            return raw_type
        return morph_class or 'unknown'

    def _affix_kind(self, aff):
        aff_type = self._affix_type(aff)
        morph_class = (aff.get('morph_class') or '').strip().lower()

        if morph_class == 'derivational' or aff_type in self.DERIVATIONAL_TYPE_LABELS:
            return 'жұрнақ'
        if aff_type in {'plural'} | set(self.CASE_TYPE_LABELS) | set(self.POSSESSIVE_TYPE_LABELS) or aff_type.startswith('possessive'):
            return 'жалғау'
        return 'аффикс'

    def _affix_label(self, aff):
        aff_type = self._affix_type(aff)
        surface = self._affix_surface(aff)
        meaning_kz = (aff.get('meaning_kz') or '').strip()

        if aff_type == 'plural':
            return 'көптік жалғау'
        if aff_type in self.CASE_TYPE_LABELS:
            return self.CASE_TYPE_LABELS[aff_type]
        if aff_type in self.POSSESSIVE_TYPE_LABELS:
            return self.POSSESSIVE_TYPE_LABELS[aff_type]
        if aff_type.startswith('possessive'):
            return self.POSSESSIVE_SURFACE_LABELS.get(surface, 'тәуелдік жалғау')
        if aff_type in self.DERIVATIONAL_TYPE_LABELS:
            return self.DERIVATIONAL_TYPE_LABELS[aff_type]
        if meaning_kz:
            return meaning_kz
        return aff_type or 'белгісіз'

    def _describe_affix(self, aff):
        aff_copy = dict(aff)
        aff_copy['type'] = self._affix_type(aff_copy)
        aff_copy['kind'] = self._affix_kind(aff_copy)
        aff_copy['label'] = self._affix_label(aff_copy)
        aff_copy['surface'] = self._affix_surface(aff_copy)
        return aff_copy

    def _merge_composite_affixes(self, affixes):
        if not affixes:
            return []

        merged = []
        i = 0
        while i < len(affixes):
            cur = dict(affixes[i])

            if i + 1 < len(affixes):
                nxt = dict(affixes[i + 1])
                if self._normalize_affix_type(cur) == 'possessive' and self._normalize_affix_type(nxt) == 'possessive':
                    combo = (cur.get('surface') or '') + (nxt.get('surface') or '')
                    if combo in self.POSSESSIVE_SURFACE_TYPES:
                        cur['surface'] = combo
                        cur['matched_value'] = combo
                        cur['type'] = self.POSSESSIVE_SURFACE_TYPES[combo]
                        cur['label'] = self.POSSESSIVE_SURFACE_LABELS.get(combo, 'тәуелдік жалғау')
                        cur['rule_explanation_kz'] = 'Құрама тәуелдік жалғау ретінде біріктірілді'
                        merged.append(cur)
                        i += 2
                        continue

            merged.append(cur)
            i += 1

        return merged

    def _apply_surface_step(self, current_form, affix_surface):
        if not affix_surface:
            return current_form

        if current_form and affix_surface[0] in self.vowels and current_form[-1] in self.final_consonant_voicing:
            return current_form[:-1] + self.final_consonant_voicing[current_form[-1]] + affix_surface

        return current_form + affix_surface

    def _affix_order_rank(self, aff):
        normalized = self._normalize_affix_type(aff)
        if normalized == 'derivational':
            return 1
        if normalized == 'plural':
            return 2
        if normalized == 'possessive':
            return 3
        if normalized == 'case':
            return 4
        return 99

    def _validate_affix_order(self, affixes):
        ranks = [self._affix_order_rank(aff) for aff in affixes]
        if not ranks:
            return {
                'is_valid': True,
                'ranks': [],
                'message_kz': 'Аффикс жоқ, реттілік автоматты түрде дұрыс.'
            }

        is_valid = all(ranks[i] <= ranks[i + 1] for i in range(len(ranks) - 1))
        message = 'Жұрнақ/жалғау реті дұрыс сақталған.' if is_valid else 'Жұрнақ/жалғау реті күмәнді, қайта тексеру қажет.'
        return {
            'is_valid': is_valid,
            'ranks': ranks,
            'message_kz': message
        }

    def _features_interpretation_kz(self, features):
        items = []
        if features.get('number') == 'plural':
            items.append('көптік мағына бар')
        else:
            items.append('жекеше мағына')

        case = features.get('case')
        if case and case != 'nominative':
            items.append(f"септік: {self.CASE_TYPE_LABELS.get(case, case)}")
        else:
            items.append('септік: атау септік')

        person = features.get('person')
        if person:
            person_map = {
                '1sg': '1-жақ жекеше',
                '2sg': '2-жақ жекеше',
                '3sg': '3-жақ жекеше',
                '1pl': '1-жақ көпше',
                '2pl_polite': '2-жақ сыпайы'
            }
            items.append(f"тәуелдік/жақ: {person_map.get(person, person)}")

        return items

    def _build_detailed_analysis(self, word, root, affixes, features, confidence):
        current_form = root
        form_steps = []

        for idx, aff in enumerate(affixes, start=1):
            surface = aff.get('surface') or ''
            next_form = self._apply_surface_step(current_form, surface)
            form_steps.append({
                'step': idx,
                'from': current_form,
                'affix': surface,
                'to': next_form,
                'kind': aff.get('kind', 'аффикс'),
                'label': aff.get('label', aff.get('type', 'белгісіз')),
                'specific_type': aff.get('type', 'unknown')
            })
            current_form = next_form

        order_info = self._validate_affix_order(affixes)
        derivational_count = sum(1 for a in affixes if self._normalize_affix_type(a) == 'derivational')
        inflectional_count = len(affixes) - derivational_count
        feature_notes = self._features_interpretation_kz(features)
        formula = root if not affixes else f"{root} + " + ' + '.join(a.get('surface', '') for a in affixes)
        summary = f"{word}: түбірі '{root}', {len(affixes)} аффикс табылды ({derivational_count} жұрнақ, {inflectional_count} жалғау/басқа)."

        return {
            'summary_kz': summary,
            'morpheme_formula': formula,
            'structure': {
                'root': root,
                'derivational_count': derivational_count,
                'inflectional_count': inflectional_count,
                'affix_count': len(affixes)
            },
            'order_validation': order_info,
            'grammatical_interpretation_kz': feature_notes,
            'form_steps': form_steps,
            'reconstructed_word': current_form,
            'matches_input': current_form == word,
            'confidence_breakdown': {
                'overall': round(confidence * 100, 1),
                'root_detected': bool(root),
                'affix_chain_detected': bool(affixes),
                'order_is_valid': order_info['is_valid']
            }
        }

    def analyze(self, word):
        word = word.lower().strip()
        if not word:
            return {'error': 'Empty word'}

        root, suffix_part, affix_list = self._find_root(word)
        if not root:
            return {'error': 'Root not found', 'word': word, 'confidence': 0}

        detailed_affixes = [self._describe_affix(aff) for aff in (affix_list or [])]
        detailed_affixes = self._merge_composite_affixes(detailed_affixes)

        segments = [{'type': 'root', 'kind': 'түбір', 'label': 'Түбір', 'value': root}]
        if affix_list is None:
            for ch in suffix_part:
                segments.append({'type': 'unknown', 'value': ch})
            detailed_affixes = []

        # Build segments with types
        for aff in detailed_affixes:
            aff_type = self._normalize_affix_type(aff)
            aff_val = aff.get('surface') or aff.get('affix') or aff.get('jyrnaq')
            segments.append({
                'type': aff_type,
                'kind': aff.get('kind', 'аффикс'),
                'label': aff.get('label', aff_type),
                'value': aff_val,
                'surface': aff_val,
                'specific_type': aff.get('type', aff_type),
                'meaning_kz': aff.get('meaning_kz'),
                'meaning_ru': aff.get('meaning_ru'),
                'meaning_en': aff.get('meaning_en'),
                'rule': aff.get('rule'),
                'rule_explanation_kz': aff.get('rule_explanation_kz'),
                'example': aff.get('example_kz') or aff.get('example')
            })

        # Extract grammatical features
        features = self._extract_features(detailed_affixes)
        confidence = 0.85 + 0.03 * min(len(detailed_affixes), 5)  # simple confidence
        detailed_analysis = self._build_detailed_analysis(word, root, detailed_affixes, features, confidence)
        return {
            'word': word,
            'root': root,
            'segments': segments,
            'affix_analysis': detailed_affixes,
            'detailed_analysis': detailed_analysis,
            'grammatical_features': features,
            'confidence': round(confidence * 100, 1),
            'affix_count': len(detailed_affixes)
        }

    def _extract_features(self, affixes):
        features = {'number': 'singular', 'case': 'nominative', 'person': None}
        for a in affixes:
            typ = self._normalize_affix_type(a)
            val = (a.get('surface') or a.get('matched_value') or a.get('affix') or a.get('jyrnaq') or '').strip().lower()
            if typ == 'plural':
                features['number'] = 'plural'
            elif typ == 'case':
                case_map = {
                    'ның': 'genitive', 'нің': 'genitive', 'тың': 'genitive', 'тің': 'genitive',
                    'дың': 'genitive', 'дің': 'genitive',
                    'ға': 'dative', 'ге': 'dative', 'қа': 'dative', 'ке': 'dative',
                    'ны': 'accusative', 'ні': 'accusative', 'ды': 'accusative', 'ді': 'accusative',
                    'ты': 'accusative', 'ті': 'accusative',
                    'да': 'locative', 'де': 'locative', 'та': 'locative', 'те': 'locative',
                    'нан': 'ablative', 'нен': 'ablative', 'дан': 'ablative', 'ден': 'ablative',
                    'тан': 'ablative', 'тен': 'ablative',
                    'мен': 'instrumental', 'бен': 'instrumental', 'пен': 'instrumental'
                }
                features['case'] = case_map.get(val, 'unknown')
            elif typ == 'possessive':
                if val in ('м', 'ым', 'ім'): features['person'] = '1sg'
                elif val in ('ң', 'ың', 'ің'): features['person'] = '2sg'
                elif val in ('сы', 'сі', 'ы', 'і'): features['person'] = '3sg'
                elif val in ('мыз', 'міз'): features['person'] = '1pl'
                elif val in ('ымыз', 'іміз'): features['person'] = '1pl'
                elif val in ('ыңыз', 'іңіз'): features['person'] = '2pl_polite'
        return features

    def _normalize_affix_type(self, aff):
        t = (aff.get('type') or '').strip().lower()
        morph_class = (aff.get('morph_class') or '').strip().lower()

        case_types = {
            'case', 'genitive', 'dative', 'accusative', 'locative', 'ablative', 'instrumental',
            'септік'
        }
        possessive_types = {
            'possessive', 'possessive1', 'possessive_1sg', 'possessive_2sg', 'possessive_3sg', 'possessive_1pl', 'possessive_2pl_polite',
            'тәуелдік', 'poss1', 'poss2', 'poss3', 'poss1p'
        }
        derivational_types = set(self.DERIVATIONAL_TYPE_LABELS) | {'derivational', 'қосымша'}

        if morph_class == 'derivational' or t in derivational_types:
            return 'derivational'
        if t in ('plural', 'көптік'):
            return 'plural'
        if t in case_types:
            return 'case'
        if t in possessive_types or t.startswith('poss'):
            return 'possessive'
        return 'unknown'

_neural_analyzer = None
def get_neural_analyzer(data_path='data/'):
    global _neural_analyzer
    if _neural_analyzer is None:
        _neural_analyzer = NeuralMorphologyAnalyzer(data_path)
    return _neural_analyzer