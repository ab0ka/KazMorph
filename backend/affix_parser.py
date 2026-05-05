class KazakhAffixParser:
    """Қазақ тілінің жалғаулар жүйесін талдау"""
    
    # Жалғаулардың дұрыс реті
    AFFIX_ORDER = [
        ('көптік', 1),
        ('тәуелдік', 2), 
        ('септік', 3),
        ('жіктік', 4),
        ('қосымша', 5)
    ]
    
    # Жалғаулардың мүмкін комбинациялары
    VALID_COMBINATIONS = [
        ('көптік', 'тәуелдік'),
        ('көптік', 'септік'),
        ('тәуелдік', 'септік'),
        ('көптік', 'тәуелдік', 'септік')
    ]
    
    @classmethod
    def validate_affix_sequence(cls, affix_types):
        """Жалғаулар тізбегінің дұрыстығын тексеру"""
        if not affix_types:
            return True
        
        # Ретін тексеру
        positions = []
        for affix_type in affix_types:
            pos = cls.get_affix_position(affix_type)
            if pos:
                positions.append(pos)
        
        # Реті өсу ретімен болуы керек
        return all(positions[i] <= positions[i+1] for i in range(len(positions)-1))
    
    @classmethod
    def get_affix_position(cls, affix_type):
        """Жалғау түрінің позициясын алу"""
        position_map = {
            'көптік': 1,
            'plural': 1,
            'тәуелдік': 2,
            'possessive': 2,
            'септік': 3,
            'case': 3,
            'жіктік': 4,
            'copula': 4,
            'қосымша': 5,
            'derivational': 5
        }
        return position_map.get(affix_type, 99)
    
    @classmethod
    def parse_complex_word(cls, root, affixes):
        """Күрделі сөзді талдау"""
        result = {
            'root': root,
            'structure': [],
            'meaning': ''
        }
        
        current = root
        for i, affix in enumerate(affixes):
            affix_value = affix.get('affix', '')
            affix_type = affix.get('type', 'белгісіз')
            
            # Дыбыс өзгерістерін ескеру
            from analyzer import KazakhPhoneticRules
            next_form = KazakhPhoneticRules.apply_sound_changes(current, affix_value)
            
            result['structure'].append({
                'position': i + 1,
                'type': affix_type,
                'value': affix_value,
                'result': next_form
            })
            
            current = next_form
        
        return result