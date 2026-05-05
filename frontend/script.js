/* KazMorph AI Pro — Neural Morphology Analyzer
   Полная версия с улучшенным обучением и анализом
*/
'use strict';

// ============ STATE ============
const STATE = {
    theme: localStorage.getItem('km_theme') || 'dark',
    lang: localStorage.getItem('km_lang') || 'kz',
    history: JSON.parse(localStorage.getItem('km_history')) || [],
    totalAnalyzed: parseInt(localStorage.getItem('km_total')) || 0,
    xp: parseInt(localStorage.getItem('km_xp')) || 0,
    completedLessons: JSON.parse(localStorage.getItem('km_completed')) || [],
    currentLesson: null,
    serverUrl: 'http://localhost:5000',
    sidebarCollapsed: localStorage.getItem('km_sidebar') === 'true'
};

// ============ TRANSLATIONS ============
const LANGS = {
    kz: {
        n: 'зат есім', v: 'етістік', adj: 'сын есім', adv: 'үстеу',
        pron: 'есімдік', num: 'сан есім', conj: 'жалғаулық',
        success: 'Сәтті!', error: 'Қате', analyzing: 'Талдануда...',
        server_error: 'Сервер қатесі', cleared: 'Тазартылды',
        not_found: 'Түбір табылмады', plural: 'Көптік', singular: 'Жекеше',
        genitive: 'Ілік', dative: 'Барыс', accusative: 'Табыс',
        locative: 'Жатыс', ablative: 'Шығыс', instrumental: 'Көмектес'
    },
    ru: {
        n: 'существительное', v: 'глагол', adj: 'прилагательное',
        adv: 'наречие', pron: 'местоимение', num: 'числительное',
        conj: 'союз', success: 'Успешно!', error: 'Ошибка',
        analyzing: 'Анализируется...', server_error: 'Ошибка сервера',
        cleared: 'Очищено', not_found: 'Корень не найден',
        plural: 'Множественное', singular: 'Единственное',
        genitive: 'Родительный', dative: 'Дательный', accusative: 'Винительный',
        locative: 'Местный', ablative: 'Исходный', instrumental: 'Творительный'
    },
    en: {
        n: 'noun', v: 'verb', adj: 'adjective', adv: 'adverb',
        pron: 'pronoun', num: 'numeral', conj: 'conjunction',
        success: 'Success!', error: 'Error', analyzing: 'Analyzing...',
        server_error: 'Server error', cleared: 'Cleared',
        not_found: 'Root not found', plural: 'Plural', singular: 'Singular',
        genitive: 'Genitive', dative: 'Dative', accusative: 'Accusative',
        locative: 'Locative', ablative: 'Ablative', instrumental: 'Instrumental'
    }
};
function t(key) { return LANGS[STATE.lang]?.[key] || key; }

const UI_TEXTS = {
    kz: {
        nav_analyzer: 'Анализатор', nav_lessons: 'Сабақтар', nav_database: 'Деректер', nav_history: 'Тарих', nav_help: 'Анықтама',
        panel_analyzer_title: 'Морфологиялық Анализатор', panel_analyzer_sub: 'Нейрондық желі көмегімен сөздердің толық морфологиялық талдауы',
        mode_word: 'Сөз', mode_text: 'Мәтін',
        input_word_label: 'Қазақша сөзді енгізіңіз', input_word_placeholder: 'Мысалы: кітабым, мектепке, оқушылар...', btn_ai_analyze: 'AI Талдау',
        input_text_label: 'Қазақша мәтінді енгізіңіз', btn_full_analysis: 'Толық талдау', btn_statistics: 'Статистика',
        tab_lessons_title: 'Интерактивті Сабақтар', tab_lessons_sub: 'Видео-сабақтар, теория, тесттер және жаттығулар',
        tab_database_title: 'Деректер базасы', tab_database_sub: 'Түбірлер, жалғаулар, жұрнақтар',
        db_root: 'Түбір', db_pos: 'Сөз табы', db_meaning: 'Мағынасы', db_harmony: 'Үндесім',
        db_affix: 'Жалғау', db_type: 'Түрі', db_rule: 'Ереже', db_suffix: 'Жұрнақ', db_example: 'Мысал',
        lessons_done: 'аяқталды', tasks: 'тапсырма', completed: 'Аяқталды',
        ai_coach_title: 'AI Көмекші', ai_coach_hint: 'Бұл сабақта алдымен теория кестесін қарап, кейін тест сұрақтарын бір-бірлеп орындаңыз.',
        lesson_hint: 'Кеңес', lesson_check: 'Тексеру', lesson_finish: 'Сабақты аяқтау',
        lesson_quiz: 'Тест', lesson_build: 'Сөз құрау', lesson_fix: 'Қате табу', lesson_translate: 'Аударма',
        words_total: 'Барлық сөз', words_unique: 'Бірегей сөз', sentence_count: 'Сөйлем саны', unknown_words: 'Танылмаған',
        avg_word_len: 'Орт. сөз ұзындығы', avg_sentence_len: 'Орт. сөйлем ұзындығы', ai_confidence: 'AI сенімділік', complexity: 'Күрделілік индексі'
    },
    ru: {
        nav_analyzer: 'Анализатор', nav_lessons: 'Уроки', nav_database: 'Данные', nav_history: 'История', nav_help: 'Справка',
        panel_analyzer_title: 'Морфологический Анализатор', panel_analyzer_sub: 'Полный морфологический разбор слов на базе нейросети',
        mode_word: 'Слово', mode_text: 'Текст',
        input_word_label: 'Введите слово на казахском', input_word_placeholder: 'Например: кітабым, мектепке, оқушылар...', btn_ai_analyze: 'AI Анализ',
        input_text_label: 'Введите текст на казахском', btn_full_analysis: 'Полный анализ', btn_statistics: 'Статистика',
        tab_lessons_title: 'Интерактивные Уроки', tab_lessons_sub: 'Видео, теория, тесты и практические задания',
        tab_database_title: 'База данных', tab_database_sub: 'Корни, окончания и суффиксы',
        db_root: 'Корень', db_pos: 'Часть речи', db_meaning: 'Значение', db_harmony: 'Гармония',
        db_affix: 'Окончание', db_type: 'Тип', db_rule: 'Правило', db_suffix: 'Суффикс', db_example: 'Пример',
        lessons_done: 'завершено', tasks: 'заданий', completed: 'Завершено',
        ai_coach_title: 'AI Помощник', ai_coach_hint: 'В этом уроке сначала изучите теорию, затем выполняйте задания по одному.',
        lesson_hint: 'Подсказка', lesson_check: 'Проверить', lesson_finish: 'Завершить урок',
        lesson_quiz: 'Тест', lesson_build: 'Словообразование', lesson_fix: 'Исправление', lesson_translate: 'Перевод',
        words_total: 'Всего слов', words_unique: 'Уникальных слов', sentence_count: 'Количество предложений', unknown_words: 'Не распознано',
        avg_word_len: 'Средняя длина слова', avg_sentence_len: 'Средняя длина предложения', ai_confidence: 'Уверенность AI', complexity: 'Индекс сложности'
    },
    en: {
        nav_analyzer: 'Analyzer', nav_lessons: 'Lessons', nav_database: 'Dataset', nav_history: 'History', nav_help: 'Help',
        panel_analyzer_title: 'Morphology Analyzer', panel_analyzer_sub: 'Full neural morphological analysis of Kazakh words',
        mode_word: 'Word', mode_text: 'Text',
        input_word_label: 'Enter a Kazakh word', input_word_placeholder: 'Example: кітабым, мектепке, оқушылар...', btn_ai_analyze: 'AI Analyze',
        input_text_label: 'Enter a Kazakh text', btn_full_analysis: 'Full analysis', btn_statistics: 'Statistics',
        tab_lessons_title: 'Interactive Lessons', tab_lessons_sub: 'Video lessons, theory, quizzes and practice',
        tab_database_title: 'Dataset', tab_database_sub: 'Roots, inflections and derivational suffixes',
        db_root: 'Root', db_pos: 'Part of speech', db_meaning: 'Meaning', db_harmony: 'Harmony',
        db_affix: 'Inflection', db_type: 'Type', db_rule: 'Rule', db_suffix: 'Suffix', db_example: 'Example',
        lessons_done: 'completed', tasks: 'tasks', completed: 'Completed',
        ai_coach_title: 'AI Coach', ai_coach_hint: 'Review the theory block first, then solve quiz tasks one by one.',
        lesson_hint: 'Hint', lesson_check: 'Check', lesson_finish: 'Finish Lesson',
        lesson_quiz: 'Quiz', lesson_build: 'Build', lesson_fix: 'Fix', lesson_translate: 'Translate',
        words_total: 'Total words', words_unique: 'Unique words', sentence_count: 'Sentence count', unknown_words: 'Unknown words',
        avg_word_len: 'Avg word length', avg_sentence_len: 'Avg sentence length', ai_confidence: 'AI confidence', complexity: 'Complexity index'
    }
};
function ui(key) { return UI_TEXTS[STATE.lang]?.[key] || UI_TEXTS.kz[key] || key; }

function applyStaticTranslations() {
    const set = (selector, value) => {
        const node = document.querySelector(selector);
        if (node) node.textContent = value;
    };

    set('.nav-item[data-tab="analyzer"] span', ui('nav_analyzer'));
    set('.nav-item[data-tab="lessons"] span', ui('nav_lessons'));
    set('.nav-item[data-tab="database"] span', ui('nav_database'));
    set('.nav-item[data-tab="history"] span', ui('nav_history'));
    set('.nav-item[data-tab="help"] span', ui('nav_help'));

    const analyzerTitle = document.querySelector('#tab-analyzer .panel-title h1');
    if (analyzerTitle) analyzerTitle.childNodes[0].nodeValue = `${ui('panel_analyzer_title')} `;
    set('#tab-analyzer .panel-title p', ui('panel_analyzer_sub'));

    const modeWord = document.querySelector('.mode-btn[data-mode="word"]');
    if (modeWord) modeWord.innerHTML = `<i class="fas fa-spell-check"></i> ${ui('mode_word')}`;
    const modeText = document.querySelector('.mode-btn[data-mode="text"]');
    if (modeText) modeText.innerHTML = `<i class="fas fa-paragraph"></i> ${ui('mode_text')}`;
    const wordLabel = document.querySelector('#wordMode .input-label');
    if (wordLabel) wordLabel.innerHTML = `<i class="fas fa-spell-check"></i> ${ui('input_word_label')}`;
    if (el.wordInput) el.wordInput.placeholder = ui('input_word_placeholder');
    const analyzeBtn = document.querySelector('#wordAnalyzeBtn');
    if (analyzeBtn) analyzeBtn.innerHTML = `<i class="fas fa-brain"></i> ${ui('btn_ai_analyze')}`;

    const textLabel = document.querySelector('#textMode .input-label');
    if (textLabel) textLabel.innerHTML = `<i class="fas fa-paragraph"></i> ${ui('input_text_label')}`;
    const textAnalyzeBtn = document.querySelector('#textAnalyzeBtn');
    if (textAnalyzeBtn) textAnalyzeBtn.innerHTML = `<i class="fas fa-chart-bar"></i> ${ui('btn_full_analysis')}`;
    const textStatsBtn = document.querySelector('#textStatsBtn');
    if (textStatsBtn) textStatsBtn.innerHTML = `<i class="fas fa-chart-pie"></i> ${ui('btn_statistics')}`;

    set('#tab-lessons .panel-title h1', ui('tab_lessons_title'));
    set('#tab-lessons .panel-title p', ui('tab_lessons_sub'));

    set('#tab-database .panel-title h1', ui('tab_database_title'));
    set('#tab-database .panel-title p', ui('tab_database_sub'));

    const rootsTh = document.querySelectorAll('#db-roots th');
    if (rootsTh.length >= 4) {
        rootsTh[0].textContent = ui('db_root');
        rootsTh[1].textContent = ui('db_pos');
        rootsTh[2].textContent = ui('db_meaning');
        rootsTh[3].textContent = ui('db_harmony');
    }
    const affTh = document.querySelectorAll('#db-affixes th');
    if (affTh.length >= 4) {
        affTh[0].textContent = ui('db_affix');
        affTh[1].textContent = ui('db_type');
        affTh[2].textContent = ui('db_meaning');
        affTh[3].textContent = ui('db_rule');
    }
    const derTh = document.querySelectorAll('#db-derivatives th');
    if (derTh.length >= 4) {
        derTh[0].textContent = ui('db_suffix');
        derTh[1].textContent = ui('db_type');
        derTh[2].textContent = ui('db_meaning');
        derTh[3].textContent = ui('db_example');
    }
}

// ============ DOM ELEMENTS ============
const el = {
    sidebar: document.getElementById('sidebar'),
    collapseBtn: document.getElementById('collapseBtn'),
    wordInput: document.getElementById('wordInput'),
    wordAnalyzeBtn: document.getElementById('wordAnalyzeBtn'),
    wordResultZone: document.getElementById('wordResultZone'),
    textInput: document.getElementById('textInput'),
    textAnalyzeBtn: document.getElementById('textAnalyzeBtn'),
    textStatsBtn: document.getElementById('textStatsBtn'),
    textResultZone: document.getElementById('textResultZone'),
    themeBtn: document.getElementById('themeBtn'),
    langBtn: document.getElementById('langBtn'),
    langMenu: document.getElementById('langMenu'),
    rootsStat: document.getElementById('rootsStat'),
    affixesStat: document.getElementById('affixesStat'),
    aiAccuracy: document.getElementById('aiAccuracy'),
    xpDisplay: document.getElementById('xpDisplay'),
    lessonXP: document.getElementById('lessonXP'),
    progressFill: document.getElementById('progressFill'),
    progressPct: document.getElementById('progressPct'),
    historyGrid: document.getElementById('historyGrid'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    lessonMap: document.getElementById('lessonMap'),
    lessonMapView: document.getElementById('lessonMapView'),
    lessonDetailView: document.getElementById('lessonDetailView'),
    lessonContent: document.getElementById('lessonContent'),
    backToMapBtn: document.getElementById('backToMapBtn')
};

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    applyTheme(STATE.theme);
    applyLang(STATE.lang);
    loadStats();
    renderHistory();
    updateProgressUI();
    loadDatabase();
    buildLessonMap();
    if (STATE.sidebarCollapsed) el.sidebar?.classList.add('collapsed');
    attachEventListeners();
    setTimeout(() => el.loadingOverlay?.classList.add('hidden'), 800);
});

function attachEventListeners() {
    el.collapseBtn?.addEventListener('click', toggleSidebar);
    el.wordAnalyzeBtn?.addEventListener('click', analyzeWord);
    el.wordInput?.addEventListener('keydown', e => e.key === 'Enter' && analyzeWord());
    el.textAnalyzeBtn?.addEventListener('click', analyzeText);
    el.textStatsBtn?.addEventListener('click', analyzeText);
    el.themeBtn?.addEventListener('click', toggleTheme);
    el.langBtn?.addEventListener('click', toggleLangMenu);
    el.clearHistoryBtn?.addEventListener('click', clearHistory);
    el.backToMapBtn?.addEventListener('click', backToLessonMap);
    document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
    document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => switchMode(btn.dataset.mode)));
    document.querySelectorAll('.db-tab').forEach(btn => btn.addEventListener('click', () => switchDbTab(btn.dataset.dbTab)));
    document.getElementById('dbSearchInput')?.addEventListener('input', e => dbFilter(e.target.value));
    document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => { el.wordInput.value = chip.dataset.word; analyzeWord(); }));
    document.querySelectorAll('[data-example]').forEach(btn => btn.addEventListener('click', () => useExampleText(btn.dataset.example)));
    document.querySelectorAll('.lang-menu button').forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)));
    document.addEventListener('keydown', handleGlobalKeys);
}

// ============ CANVAS BACKGROUND ============
function initCanvas() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    function createParticle() { return { x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15, r: Math.random() * 2 + 0.5, a: Math.random() * 0.2 + 0.05 }; }
    function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(110,231,183,${p.a})`; ctx.fill(); p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0; });
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    resize();
    particles = Array.from({ length: 40 }, createParticle);
    draw();
}

// ============ THEME & LANGUAGE ============
function applyTheme(theme) { STATE.theme = theme; document.documentElement.setAttribute('data-theme', theme); if (el.themeBtn) el.themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; localStorage.setItem('km_theme', theme); }
function toggleTheme() { applyTheme(STATE.theme === 'dark' ? 'light' : 'dark'); }
function applyLang(lang) {
    STATE.lang = lang;
    localStorage.setItem('km_lang', lang);
    const names = { kz: '🇰🇿 Қаз', ru: '🇷🇺 Рус', en: '🇬🇧 Eng' };
    if (el.langBtn) el.langBtn.innerHTML = names[lang];
    document.getElementById('check-kz')?.classList.toggle('hidden', lang !== 'kz');
    document.getElementById('check-ru')?.classList.toggle('hidden', lang !== 'ru');
    document.getElementById('check-en')?.classList.toggle('hidden', lang !== 'en');
    applyStaticTranslations();
    loadDatabase();
    buildLessonMap();
}
function setLang(lang) { applyLang(lang); el.langMenu?.classList.remove('open'); }
function toggleLangMenu() { el.langMenu?.classList.toggle('open'); }
function toggleSidebar() { el.sidebar?.classList.toggle('collapsed'); STATE.sidebarCollapsed = el.sidebar?.classList.contains('collapsed') || false; localStorage.setItem('km_sidebar', STATE.sidebarCollapsed); }
function switchTab(tabName) { document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active')); document.getElementById(`tab-${tabName}`)?.classList.add('active'); document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active'); }
function switchMode(mode) { document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active')); document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active')); document.getElementById(`${mode}Mode`)?.classList.add('active'); document.querySelector(`.mode-btn[data-mode="${mode}"]`)?.classList.add('active'); }

// ============ STATS ============
async function loadStats() {
    try {
        const res = await fetch(`${STATE.serverUrl}/api/stats`);
        const data = await res.json();
        if (el.rootsStat) el.rootsStat.textContent = data.roots || 0;
        if (el.affixesStat) el.affixesStat.textContent = data.affixes || 0;
        if (el.aiAccuracy) el.aiAccuracy.textContent = `${data.ai_accuracy || 96}%`;
    } catch(e) { console.error(e); }
}

// ============ WORD ANALYSIS ============
async function analyzeWord() {
    const word = el.wordInput?.value?.trim();
    if (!word) { showToast('Сөзді енгізіңіз', 'error'); return; }
    if (el.wordResultZone) el.wordResultZone.innerHTML = `<div class="result-empty"><div class="spinner"></div><p>${t('analyzing')}... <span style="font-size:11px">(AI нейрожелі)</span></p></div>`;
    try {
        const res = await fetch(`${STATE.serverUrl}/api/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word }) });
        const data = await res.json();
        renderWordResult(data, word);
        if (!data.error) { addToHistory(word, data); incrementAnalyzed(); }
        showToast(data.error || t('success'), data.error ? 'error' : 'success');
    } catch(e) { renderWordError(t('server_error')); showToast(t('server_error'), 'error'); }
}

function renderWordResult(data, word) {
    if (!el.wordResultZone) return;
    if (data.error) { renderWordError(data.error); return; }
    const root = data.root || word;
    const segments = data.segments || [];
    const affixAnalysis = Array.isArray(data.affix_analysis) ? data.affix_analysis : [];
    const deep = data.detailed_analysis || null;
    const features = data.grammatical_features || {};
    // build a centered split visualization: main word in center, then split into root + affixes
    const rootSeg = segments.find(s => s.type === 'root')?.value || root;
    const affixesStr = segments.filter(s => s.type !== 'root').map(s => s.value).filter(Boolean).join('');
    // build affix description (shortened: only person, number, label)
    const firstAff = Array.isArray(affixAnalysis) && affixAnalysis.length ? affixAnalysis[0] : null;
    const affixDescParts = [];
    if (firstAff) {
        if (firstAff.person) affixDescParts.push(firstAff.person);
        if (firstAff.number) affixDescParts.push(firstAff.number);
        if (firstAff.label) affixDescParts.push(firstAff.label);
    }
    const affixDesc = affixDescParts.length ? affixDescParts.join(' · ') : '';

    // top: original minimal arrow version; bottom: analysis equation with word first
    const summaryHTML = `<div class="center-split" id="centerSplit"><div class="center-word">${word}</div><div class="split-arrows"><div class="arrow left"></div><div class="arrow right"></div></div><div class="split-pieces"><div class="piece root-piece"><div class="piece-label">Түбір</div><div class="piece-value">${rootSeg}</div></div><div class="piece affix-piece"><div class="piece-label">Жалғау${affixDesc ? ' · ' + affixDesc : ''}</div><div class="piece-value">${affixesStr || '—'}</div></div></div></div>`;

    const detailedHTML = `<div class="center-detailed"><div class="detailed-equation">${word} = ${rootSeg} + ${affixesStr || '—'}</div></div>`;
    // Build morpheme strip in analysis order: word = root + affix
    let stripHTML = `<div class="morph-block"><div class="morph-tag">Сөз</div><div class="morph-result-word">${word}</div></div><div class="morph-connector">=</div>`;
    segments.forEach((seg, i) => {
        if (i > 0) stripHTML += '<div class="morph-connector">+</div>';
        let cls = '', label = '';
        if (seg.type === 'root') { cls = 'root-piece'; label = 'Түбір'; }
        else if (seg.kind === 'жұрнақ') { cls = 'deriv-piece'; label = 'Жұрнақ'; }
        else if (seg.kind === 'жалғау') { cls = 'affix-piece'; label = 'Жалғау'; }
        else { cls = 'affix-piece'; label = 'Аффикс'; }
        const detailLabel = seg.label && seg.label !== label ? `${label}: ${seg.label}` : label;
        stripHTML += `<div class="morph-block"><div class="morph-tag">${detailLabel}</div><div class="morph-piece ${cls}">${seg.value || ''}</div></div>`;
    });
    let caseName = features.case ? (t(features.case) || features.case) : '—';
    let numInfo = features.number === 'plural' ? `<span style="color:var(--accent)">${t('plural')}</span>` : `<span style="color:var(--text-muted)">${t('singular')}</span>`;
    let pills = '';
    if (features.number === 'plural') pills += `<div class="feature-pill type-plural"><i class="fas fa-layer-group"></i> ${t('plural')}</div>`;
    if (features.case) pills += `<div class="feature-pill type-case"><i class="fas fa-map-pin"></i> ${caseName}</div>`;
    if (features.person) pills += `<div class="feature-pill"><i class="fas fa-user"></i> ${features.person}</div>`;
    let segsHTML = '';
    if (segments.length > 1) {
        segsHTML = `<div class="segments-detail"><div class="segments-title"><i class="fas fa-sitemap"></i> Морфемдік талдау</div>`;
        segments.forEach(seg => {
            let cls = seg.type === 'root' ? 'seg-root' : (seg.kind === 'жұрнақ' ? 'seg-deriv' : 'seg-affix');
            let label = seg.type === 'root' ? 'Түбір' : (seg.kind === 'жұрнақ' ? 'Жұрнақ' : (seg.kind === 'жалғау' ? 'Жалғау' : 'Аффикс'));
            const detailLabel = seg.label && seg.label !== label ? `${label} · ${seg.label}` : label;
            segsHTML += `<div class="segment-row ${cls}"><div class="seg-value">${seg.value}</div><div class="seg-info">${detailLabel}</div></div>`;
        });
        segsHTML += `</div>`;
    }
    let affixRows = '';
    if (affixAnalysis.length) {
        affixRows = `<div class="segments-detail"><div class="segments-title"><i class="fas fa-list-check"></i> Әр аффикс бойынша талдау</div>`;
        affixAnalysis.forEach(aff => {
            const kind = aff.kind || 'аффикс';
            const label = aff.label || aff.type || 'белгісіз';
            const kindClass = kind === 'жұрнақ' ? 'seg-deriv' : 'seg-affix';
            const extraBits = [];
            if (aff.meaning_kz) extraBits.push(aff.meaning_kz);
            if (aff.rule_explanation_kz || aff.rule) extraBits.push(aff.rule_explanation_kz || aff.rule);
            if (aff.example_kz || aff.example) extraBits.push(aff.example_kz || aff.example);
            const extra = extraBits.length ? `<div class="seg-extra">${extraBits.join(' · ')}</div>` : '';
            affixRows += `<div class="segment-row ${kindClass}"><div class="seg-value">${aff.surface || aff.affix || aff.jyrnaq || ''}</div><div class="seg-info">${kind}: ${label}${extra}</div></div>`;
        });
        affixRows += `</div>`;
    }
    let deepHTML = '';
    if (deep) {
        let notes = '';
        if (Array.isArray(deep.grammatical_interpretation_kz)) {
            notes = deep.grammatical_interpretation_kz.map(item => `<div class="segment-row seg-affix"><div class="seg-value">•</div><div class="seg-info">${item}</div></div>`).join('');
        }

        let steps = '';
        if (Array.isArray(deep.form_steps)) {
            steps = deep.form_steps.map(s => `<div class="segment-row ${s.kind === 'жұрнақ' ? 'seg-deriv' : 'seg-affix'}"><div class="seg-value">${s.from} + ${s.affix}</div><div class="seg-info">${s.to} · ${s.kind}: ${s.label}</div></div>`).join('');
        }

        const orderMsg = deep.order_validation?.message_kz || 'Рет тексерілмеді';
        const orderState = deep.order_validation?.is_valid ? '✅' : '⚠️';
        const summary = deep.summary_kz || '';
        const formula = deep.morpheme_formula || '';

        deepHTML = `<div class="segments-detail"><div class="segments-title"><i class="fas fa-microscope"></i> Терең морфологиялық талдау</div><div class="segment-row seg-root"><div class="seg-value">Қорытынды</div><div class="seg-info">${summary}</div></div><div class="segment-row seg-root"><div class="seg-value">Формула</div><div class="seg-info">${formula}</div></div><div class="segment-row seg-root"><div class="seg-value">Реттілік</div><div class="seg-info">${orderState} ${orderMsg}</div></div>${notes ? `<div class="segments-title" style="margin-top:10px;"><i class="fas fa-language"></i> Грамматикалық интерпретация</div>${notes}` : ''}${steps ? `<div class="segments-title" style="margin-top:10px;"><i class="fas fa-shoe-prints"></i> Қадамдық құрастыру</div>${steps}` : ''}</div>`;
    }
    el.wordResultZone.innerHTML = `<div class="word-result">${detailedHTML}${summaryHTML}<div class="morpheme-strip">${stripHTML}</div><div class="result-info-grid"><div class="info-cell"><div class="info-cell-label"><i class="fas fa-tag"></i> ${ui('db_pos')}</div><div class="info-cell-value"><span class="pos-badge">${t('n')}</span></div></div><div class="info-cell"><div class="info-cell-label"><i class="fas fa-layer-group"></i> ${t('singular')}/${t('plural')}</div><div class="info-cell-value">${numInfo}</div></div><div class="info-cell"><div class="info-cell-label"><i class="fas fa-map-pin"></i> ${ui('db_type')}</div><div class="info-cell-value">${caseName}</div></div><div class="info-cell"><div class="info-cell-label"><i class="fas fa-brain"></i> ${ui('ai_confidence')}</div><div class="info-cell-value"><span class="pos-badge">${data.confidence || 92}%</span></div></div></div>${pills ? `<div class="features-row">${pills}</div>` : ''}${segsHTML}${affixRows}${deepHTML}</div>`;

    // trigger split animation for the centered visualization (now at bottom)
    setTimeout(() => {
        const cs = document.getElementById('centerSplit');
        if (cs) cs.classList.add('split');
    }, 360);
}
function renderWordError(msg) { if (el.wordResultZone) el.wordResultZone.innerHTML = `<div class="error-result"><i class="fas fa-circle-xmark"></i><h3>${t('not_found')}</h3><p>${msg}</p></div>`; }

// ============ TEXT ANALYSIS (detailed per word) ============
const EXAMPLE_TEXTS = { 1: 'Менің атым Айгүл. Мен Алматыда тұрамын. Мектепте оқимын.', 2: 'Мектеп кітапханасы үлкен. Балалар кітап оқиды.', 3: 'Біздің отбасы бес адам. Әкем, шешем, аға, апа және мен.', 4: 'Табиғат өте әдемі. Аспанда күн жарқырайды. Құстар сайрайды.' };
function useExampleText(num) { if (el.textInput && EXAMPLE_TEXTS[num]) el.textInput.value = EXAMPLE_TEXTS[num]; }
async function analyzeText() {
    const text = el.textInput?.value?.trim();
    if (!text) { showToast('Мәтінді енгізіңіз', 'error'); return; }
    if (el.textResultZone) el.textResultZone.innerHTML = `<div class="result-empty"><div class="spinner"></div><p>Мәтінді талдау... (${text.split(/\s+/).length} сөз)</p></div>`;
    try {
        const res = await fetch(`${STATE.serverUrl}/api/analyze-text`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        const data = await res.json();
        renderTextResult(data);
        showToast(t('success'), 'success');
    } catch(e) { if (el.textResultZone) el.textResultZone.innerHTML = `<div class="error-result"><i class="fas fa-circle-xmark"></i><p>${t('server_error')}</p></div>`; }
}
function renderTextResult(data) {
    if (!el.textResultZone) return;
    const stats = data.statistics || {};
    const pos = stats.parts_of_speech || {};
    const caseDist = stats.case_distribution || {};

    const safeNum = (v, fallback = 0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
    const topRoots = Array.isArray(stats.top_roots) ? stats.top_roots : [];
    const topAffixes = Array.isArray(stats.top_affixes) ? stats.top_affixes : [];
    const unknownList = Array.isArray(stats.top_unknown_words) ? stats.top_unknown_words : [];

    let posRows = '';
    Object.entries(pos).slice(0, 5).forEach(([k, v]) => { posRows += `<div class="bar-row"><span class="bar-label">${t(k)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, v * 10)}%"></div></div><span class="bar-count">${v}</span></div>`; });

    let caseRows = '';
    Object.entries(caseDist).slice(0, 6).forEach(([k, v]) => { caseRows += `<div class="bar-row"><span class="bar-label">${k}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, v * 10)}%"></div></div><span class="bar-count">${v}</span></div>`; });

    let wordTable = '';
    (data.words_analysis || []).forEach(w => {
        if (w.error) {
            wordTable += `<div class="word-item error"><div class="word-text">${w.word}</div><div class="word-morph">танылмады</div><div class="word-badge badge-error">?</div></div>`;
        } else {
            let segStr = w.segment_chain || (w.segments || []).map(s => s.value).join(' + ');
            wordTable += `<div class="word-item" onclick="document.getElementById('wordInput').value='${w.word}';switchMode('word');analyzeWord();"><div class="word-text">${w.word}</div><div class="word-morph">${segStr || w.root}</div><div class="word-badge ${w.root ? 'badge-root' : 'badge-affix'}">${w.features?.case || 'атау'}</div></div>`;
        }
    });

    const rootsCloud = topRoots.length
        ? topRoots.map(r => `<span class="freq-chip">${r.item} <b>${r.count}</b></span>`).join('')
        : '<p>Мәлімет жоқ</p>';
    const affixCloud = topAffixes.length
        ? topAffixes.map(a => `<span class="freq-chip affix">${a.item} <b>${a.count}</b></span>`).join('')
        : '<p>Мәлімет жоқ</p>';

    const avgLen = safeNum(stats.avg_word_length, 0).toFixed(1);
    const avgSentenceLen = safeNum(stats.avg_sentence_length, 0).toFixed(1);
    const avgConfidence = safeNum(stats.avg_confidence, 0).toFixed(1);
    const unknownRate = safeNum(stats.unknown_rate_pct, 0).toFixed(1);

    el.textResultZone.innerHTML = `<div class="text-result"><div class="text-stats-row"><div class="text-stat-cell"><div class="text-stat-num">${data.total_words || 0}</div><div class="text-stat-label">${ui('words_total')}</div></div><div class="text-stat-cell"><div class="text-stat-num">${data.unique_words || 0}</div><div class="text-stat-label">${ui('words_unique')}</div></div><div class="text-stat-cell"><div class="text-stat-num">${data.sentence_count || 0}</div><div class="text-stat-label">${ui('sentence_count')}</div></div><div class="text-stat-cell"><div class="text-stat-num" style="color:var(--accent-err)">${stats.unknown_words || 0}</div><div class="text-stat-label">${ui('unknown_words')}</div></div><div class="text-stat-cell"><div class="text-stat-num">${avgLen}</div><div class="text-stat-label">${ui('avg_word_len')}</div></div><div class="text-stat-cell"><div class="text-stat-num">${avgSentenceLen}</div><div class="text-stat-label">${ui('avg_sentence_len')}</div></div><div class="text-stat-cell"><div class="text-stat-num">${avgConfidence}%</div><div class="text-stat-label">${ui('ai_confidence')}</div></div><div class="text-stat-cell"><div class="text-stat-num">${safeNum(stats.complexity_index, 0)}</div><div class="text-stat-label">${ui('complexity')}</div></div></div><div class="text-detail-grid"><div class="text-detail-cell"><h4><i class="fas fa-tags"></i> ${ui('db_pos')}</h4>${posRows || '<p>Мәлімет жоқ</p>'}</div><div class="text-detail-cell"><h4><i class="fas fa-map"></i> ${ui('db_type')}</h4>${caseRows || '<p>Мәлімет жоқ</p>'}</div><div class="text-detail-cell"><h4><i class="fas fa-tree"></i> Top Roots</h4><div class="freq-cloud">${rootsCloud}</div></div><div class="text-detail-cell"><h4><i class="fas fa-link"></i> Top Affixes</h4><div class="freq-cloud">${affixCloud}</div></div><div class="text-detail-cell"><h4><i class="fas fa-layer-group"></i> Morphology Metrics</h4><div class="micro-metrics"><div><span>Plural forms:</span><b>${stats.plural_count || 0}</b></div><div><span>Possessive forms:</span><b>${stats.possessive_count || 0}</b></div><div><span>Derivational patterns:</span><b>${stats.derivational_count || 0}</b></div><div><span>Unknown rate:</span><b>${unknownRate}%</b></div></div></div><div class="text-detail-cell"><h4><i class="fas fa-triangle-exclamation"></i> Unknown tokens</h4><div class="freq-cloud">${unknownList.length ? unknownList.map(w => `<span class="freq-chip unknown">${w}</span>`).join('') : '<p>None</p>'}</div></div><div class="text-detail-cell full-width"><h4><i class="fas fa-list"></i> Token-by-token analysis</h4><div class="word-analysis-table">${wordTable || '<p>No data</p>'}</div></div></div></div>`;
}

// ============ HISTORY ============
function addToHistory(word, data) { STATE.history.unshift({ word, root: data.root || word, ts: Date.now() }); if (STATE.history.length > 50) STATE.history.pop(); localStorage.setItem('km_history', JSON.stringify(STATE.history)); renderHistory(); }
function renderHistory() { if (!el.historyGrid) return; if (!STATE.history.length) { el.historyGrid.innerHTML = '<div class="history-empty"><i class="fas fa-history"></i><p>Тарих бос</p></div>'; return; } el.historyGrid.innerHTML = STATE.history.slice(0, 50).map(h => `<div class="history-card" data-word="${h.word}"><div class="history-word">${h.word}</div><div class="history-root">Түбір: ${h.root}</div><div class="history-time">${new Date(h.ts).toLocaleTimeString()}</div></div>`).join(''); document.querySelectorAll('.history-card').forEach(c => c.addEventListener('click', () => { el.wordInput.value = c.dataset.word; switchTab('analyzer'); analyzeWord(); })); }
function clearHistory() { STATE.history = []; localStorage.removeItem('km_history'); renderHistory(); showToast(t('cleared'), 'info'); }
function incrementAnalyzed() { STATE.totalAnalyzed++; localStorage.setItem('km_total', STATE.totalAnalyzed); }

// ============ DATABASE ============
async function loadDatabase() {
    try {
        const [roots, affixes, derivs] = await Promise.all([ fetch(`${STATE.serverUrl}/api/roots`).then(r=>r.json()), fetch(`${STATE.serverUrl}/api/affixes`).then(r=>r.json()), fetch(`${STATE.serverUrl}/api/derivatives`).then(r=>r.json()) ]);
        const meaningField = STATE.lang === 'en' ? 'meaning_en' : (STATE.lang === 'ru' ? 'meaning_ru' : 'meaning_kz');
        document.getElementById('rootsTableBody').innerHTML = roots.slice(0, 100).map(r => `<tr><td class="mono">${r.root}</td><td>${t(r.pos)}</td><td>${r[meaningField] || r.meaning_ru || r.meaning_kz || '—'}</td><td>${r.harmony || 'both'}</td></tr>`).join('');
        document.getElementById('affixesTableBody').innerHTML = affixes.slice(0, 100).map(a => `<tr><td class="mono">${a.affix}</td><td>${a.type}</td><td>${a[meaningField] || a.meaning_ru || a.meaning_kz || '—'}</td><td>${a.rule || '—'}</td></tr>`).join('');
        document.getElementById('derivativesTableBody').innerHTML = derivs.slice(0, 100).map(d => `<tr><td class="mono">${d.jyrnaq || d.affix}</td><td>${d.type}</td><td>${d[meaningField] || d.meaning_en || d.meaning_ru || d.meaning_kz || '—'}</td><td>${d.example || '—'}</td></tr>`).join('');
    } catch(e) { console.error(e); }
}
function switchDbTab(tab) { document.querySelectorAll('.db-tab').forEach(b => b.classList.remove('active')); document.querySelectorAll('.db-panel').forEach(p => p.classList.remove('active')); document.querySelector(`.db-tab[data-db-tab="${tab}"]`)?.classList.add('active'); document.getElementById(`db-${tab}`)?.classList.add('active'); }
function dbFilter(q) { const lower = q.toLowerCase(); document.querySelectorAll('.db-panel.active .data-table tbody tr').forEach(r => { r.style.display = r.textContent.toLowerCase().includes(lower) ? '' : 'none'; }); }

// ============ LESSONS (8 modules, creative exercises) ============
const LESSON_MODULES = [
    { id: 'basics', title: '1. Морфология негіздері', description: 'Түбір, жұрнақ, жалғау', icon: '🌱', colorClass: 'color-green', lessons: [
        { id: 'root-lesson', title: 'Түбір дегеніміз не?', description: 'Сөздің негізгі мағыналы бөлігі', icon: '🌳', type: 'quiz', xp: 20, lecture: 'Түбір — сөздің негізгі мағыналық бөлігі. Бүл сөзде барлық лексикалық мағына жатыңдыр. Мысалы: «кітап» сөзінде «кітап-» түбір болып табылады. Түбір сөйлемде өзінің мағынасын өзгертпей қалып түрадi. Түбірге жалғау немесе жұрнақ қоса отырып басқа сөздер шығады.', theory: { title: 'Түбір (Негіз сөз)', content: 'Түбір — сөздің негізгі мағыналық бөлігі. Мысалы: кітап, бала, үй.', tableHeaders: ['Сөз', 'Түбір'], tableRows: [['кітабым', 'кітап'], ['мектепке', 'мектеп']] }, exercises: [
            { type: 'mcq', question: '«кітабым» сөзінің түбірі?', options: ['кітабым', 'кітап', 'тап', 'кіт'], correct: 1, explanation: 'Түбір «кітап»' },
            { type: 'word_build', question: '«мектеп» түбіріне «-ке» жалғауын жалғаңыз', correct: 'мектепке', hint: 'мектеп + ке' }
        ] },
        { id: 'affix-intro', title: 'Жалғау түрлері', description: 'Септік, тәуелдік, көптік', icon: '🔗', type: 'quiz', xp: 25, lecture: 'Жалғаулар сөздің құрылымының соңында қосылып сөздің грамматикалық мағынасын өзгертеді. Қазақ тілінде үш түрлі жалғау бар: 1) Көптік жалғау (-лар/-лер) - сөзді көптік санға аударады; 2) Тәуелдік жалғау (-ым/-ім,-ың/-ің) - ие-құрттылық қатынасын білдіреді; 3) Септік жалғау - сөздің сөйлемдегі ролін анықтайды.', theory: { title: 'Жалғаулар', content: 'Қазақ тілінде жалғаулар: көптік (-лар/-лер), тәуелдік (-ым/-ім), септік.', tableHeaders: ['Түрі', 'Мысал'], tableRows: [['Көптік', 'бала → балалар'], ['Барыс', 'бала → балаға']] }, exercises: [
            { type: 'mcq', question: '«-лар/-лер» жалғауы не білдіреді?', options: ['Көптік', 'Тәуелдік', 'Септік', 'Жіктік'], correct: 0, explanation: 'Көптік жалғауы' },
            { type: 'error_detection', question: 'Қате жалғауды табыңыз: «мектепта»', correct: 'мектепте', hint: 'Жіңішке дауысты, сондықтан «-те»' }
        ] }
    ] },
    { id: 'cases', title: '2. Септік жалғаулары', description: 'Қазақ тілінің 7 септігі', icon: '📐', colorClass: 'color-blue', lessons: [
        { id: 'cases-lesson', title: 'Септіктер', description: 'Атау, Ілік, Барыс, Табыс, Жатыс, Шығыс, Көмектес', icon: '🎯', type: 'quiz', xp: 30, lecture: 'Қазақ тілінде 7 септік бар. Әрбір септік сөздің сөйлемдегі ролін анықтайды. Атау септік - негіздеу; Ілік септік (-ның/-нің) - ие болмасы; Барыс септік (-ға/-ге) - бағыт; Табыс септік (-ны/-ні) - тәуген; Жатыс септік (-да/-де) - орын; Шығыс септік (-нан/-нен) - бастау; Көмектес септік (-бен/-пен/-мен) - қоса. Септік жалғаулары дауыстармен үндеседі.', theory: { title: 'Септіктер', content: 'Қазақ тілінде 7 септік бар.', tableHeaders: ['Септік', 'Жалғауы', 'Сұрақ'], tableRows: [['Атау', '—', 'Кім? Не?'], ['Ілік', '-ның/-нің', 'Кімнің?'], ['Барыс', '-ға/-ге', 'Кімге?']] }, exercises: [
            { type: 'mcq', question: '«баланың» сөзі қай септікте?', options: ['Атау', 'Ілік', 'Барыс', 'Табыс'], correct: 1, explanation: '«-ның» — ілік септік' },
            { type: 'translation', question: '«мектепке» сөзін орысшаға аударыңыз', correct: 'в школу', hint: 'барыс септік' }
        ] }
    ] },
    { id: 'harmony', title: '3. Үндесім заңы', description: 'Буын үндестігі', icon: '🎵', colorClass: 'color-pink', lessons: [
        { id: 'harmony-lesson', title: 'Үндесім заңы', description: 'Жалғаудың дұрыс нұсқасын таңдау', icon: '🎼', type: 'quiz', xp: 35, lecture: 'Буын үндестігі - фонетикалық явление, енді жалғауды корневой морфема сондығына анықтайды. Еңбек: егер түбірлік соңында қатаң дауыс болса (а,ы,о,ұ), онда жалғауда да қатаң дауыс болуы тиіс. Түбірде жіңішкедеуыс болса (е,и,ө,ү), жалғауда да жіңішке дауыс болуы тиіс. Мысалдар: мектеп-та (е дауысы - те), ауыл-ға (ы дауысы - ға).', theory: { title: 'Буын үндестігі', content: 'Жуан дауыстыға жуан жалғау, жіңішкеге жіңішке жалғау.', tableHeaders: ['Жуан', 'Жіңішке'], tableRows: [['-лар', '-лер'], ['-да', '-де'], ['-ға', '-ге']] }, exercises: [
            { type: 'mcq', question: '«мектеп» сөзіне қай жалғау дұрыс?', options: ['мектепта', 'мектепте', 'мектепда', 'мектепде'], correct: 1, explanation: 'Жіңішке дауысты, сондықтан «-те»' },
            { type: 'word_build', question: '«ауыл» сөзіне «-ға» жалғауын жалғаңыз (үндесімді ескеріңіз)', correct: 'ауылға', hint: 'Жуан дауысты, сондықтан «-ға»' }
        ] }
    ] },
    { id: 'advanced', title: '4. Жетілдірілген деңгей', description: 'Күрделі сөздерді талдау', icon: '🏆', colorClass: 'color-gold', lessons: [
        { id: 'complex-lesson', title: 'Күрделі сөздер', description: 'Бірнеше жалғаулы сөздер', icon: '🔬', type: 'quiz', xp: 40, lecture: 'Сөзде бірнеше жалғау болуы мүмкін. Орындықтар құрылымы: ТҮБІР + ЖҰРНАҚ + КӨПТІК + ТӘУЕЛДІК + СЕПТІК. Мысал: достар-ым-нан = дос (түбір) + тар (көптік) + ым (тәуелдік 1 ш.б.) + нан (шығыс септік). Әрбір жалғаудың өз орны бар және оларды қатарымы ауыстыруға болмайды. Бұл кісіміңіз күрделі морфологиялық түрделген.', theory: { title: 'Күрделі морфология', content: 'Сөзде бірнеше жалғау болуы мүмкін: түбір + жұрнақ + көптік + тәуелдік + септік' }, exercises: [
            { type: 'mcq', question: '«достарымнан» сөзіндегі жалғаулар тізбегі?', options: ['+тар+ым+нан', '+дар+ым+нан', '+тар+ым+дан', '+лар+ым+нан'], correct: 0, explanation: 'дос + тар + ым + нан' },
            { type: 'error_detection', question: 'Қате сөзді табыңыз: «кітаптарымызға»', correct: 'кітаптарымызға', hint: 'Барлық жалғаулар дұрыс, сұрақтың мақсаты – қатенің жоқтығын тексеру' }
        ] }
    ] },
    { id: 'verb-system', title: '5. Етістік жүйесі', description: 'Етіс, болымсыздық, шақ', icon: '⚙️', colorClass: 'color-blue', lessons: [
        { id: 'voice-lesson', title: 'Етіс жұрнақтары', description: 'Өздік, ырықсыз, өзгелік етіс', icon: '🧩', type: 'quiz', xp: 45, lecture: 'Етіс категориясы қимылдың субъект пен объектіне қатынасын білдіреді. Өздік етіс - субъект өзі әрекет істейді (жүгіну). Ырықсыз етіс - әрекет субъектке түсіндіріледі (жүгітілу). Өзгелік етіс - субъект өзгеге әрекет істегітсізгүн (оқыту). Әрбір етіс өз жұрнағы бар: өздік (−ын/-ін), ырықсыз (−ыл/-іл), өзгелік (−т/-дтіңіз сек). Шақ - уақыт өлшемі.', theory: { title: 'Етіс категориясы', content: 'Етіс жұрнақтары қимылдың субъект-пен қатынасын білдіреді.', tableHeaders: ['Түрі', 'Мысал'], tableRows: [['Өздік', 'жуын'], ['Ырықсыз', 'жазыл'], ['Өзгелік', 'оқыт']] }, exercises: [
            { type: 'mcq', question: '«жазылды» сөзіндегі жұрнақ қандай?', options: ['өздік', 'ырықсыз', 'ортақ', 'болымсыз'], correct: 1, explanation: '«-ыл/-іл» ырықсыз етіс жұрнағы.' },
            { type: 'word_build', question: '«оқы» етістігінен өзгелік форма жасаңыз', correct: 'оқыт', hint: 'оқы + т' },
            { type: 'error_detection', question: 'Дұрыс нұсқасын жазыңыз: «келбе» (болымсыз форма)', correct: 'келме', hint: 'Жіңішке нұсқа қолданылады' }
        ] }
    ] },
    { id: 'phonetics', title: '6. Дыбыс алмасуы', description: 'Түбірдің фонетикалық өзгерісі', icon: '🔊', colorClass: 'color-pink', lessons: [
        { id: 'sound-change-lesson', title: 'П/К/Қ/Т алмасуы', description: 'кітап→кітабы, мектеп→мектебі', icon: '🧠', type: 'quiz', xp: 50, lecture: 'Дыбыс сәйкестігі болғанда дауыстыдан басталатын жалғау жалғанғанда түбірлік соңғы қатаң дыбыс ұяңданады. П→Б алмасуы: кітап + ы = кітабы. К→Г алмасуы: жүрек + і = жүрегі. Қ→Ғ алмасуы: құмыра + сы = құмырасы. Т→Д алмасуы: қапат + ы = қапады. Бұл заңдара өндіктеме өндіңіздеу аңын айтамыз.', theory: { title: 'Дыбыс сәйкестігі', content: 'Дауыстыдан басталатын жалғау жалғанғанда соңғы қатаң дыбыс ұяңдануы мүмкін.' }, exercises: [
            { type: 'mcq', question: '«кітап + ы» нәтижесі қайсы?', options: ['кітапы', 'кітабы', 'кітапы', 'кітапі'], correct: 1, explanation: 'п→б алмасуы: кітабы' },
            { type: 'mcq', question: '«мектеп + і» дұрыс формасы?', options: ['мектепі', 'мектебі', 'мектепы', 'мектебіе'], correct: 1, explanation: 'п→б алмасуы: мектебі' },
            { type: 'word_build', question: '«жүрек + і» сөзін дұрыс жазыңыз', correct: 'жүрегі', hint: 'к→г алмасуы' }
        ] }
    ] },
    { id: 'syntax-text', title: '7. Мәтіндік талдау', description: 'Сөйлем және мәтін деңгейі', icon: '📚', colorClass: 'color-green', lessons: [
        { id: 'text-analytics-lesson', title: 'Мәтін морфологиясы', description: 'Жиілік, үлестірім, күрделілік', icon: '📊', type: 'quiz', xp: 55, lecture: 'Мәтіндік талдауда сөз таптары, септік үлесі, түбір жиілігі және күрделілік индексі есептеледі. Сөз таптары - атаулар, сын есімдер, етістіктер т.б. Септік үлесі - мәтінде қанша пайыз атау септік, ілік септік және т.б. қолданылғанын көрсетеді. Түбір жиілігі - қайсы түбір қаншалықты қолданылғанын айтадо. Күрделілік индексі - сөздердің орташа ұзындығы мен жақындықтарының сәйкестігі.', theory: { title: 'Корпустық талдау', content: 'Мәтіндік талдауда сөз таптары, септік үлесі, түбір жиілігі және күрделілік индексі есептеледі.' }, exercises: [
            { type: 'mcq', question: 'Күрделілік індексін көбейтетін фактор?', options: ['қысқа сөйлемдер', 'ұзын сөздер мен көп жұрнақ', 'тек атау септік', 'бір ғана түбір'], correct: 1, explanation: 'Ұзын сөздер мен сөзжасамдық формалар күрделілікті арттырады.' },
            { type: 'translation', question: '«түбір жиілігі» терминін орысша аударыңыз', correct: 'частотность корней', hint: 'частотность + корни' },
            { type: 'word_build', question: '«оқушы» сөзін көптік және шығыс септікке қойыңыз', correct: 'оқушылардан', hint: 'оқушы + лар + дан' }
        ] }
    ] }
];
function buildLessonMap() { if (!el.lessonMap) return; el.lessonMap.innerHTML = LESSON_MODULES.map(module => { const total = module.lessons.length; const done = module.lessons.filter(l => STATE.completedLessons.includes(l.id)).length; const pct = total ? (done / total) * 100 : 0; const circumference = 2 * Math.PI * 16; const offset = circumference - (pct / 100) * circumference; const lessonsHTML = module.lessons.map((lesson, i) => { const isDone = STATE.completedLessons.includes(lesson.id); const isLocked = i > 0 && !STATE.completedLessons.includes(module.lessons[i-1].id); return `<div class="lesson-card ${isDone ? 'completed' : ''} ${isLocked ? 'locked' : ''}" data-lesson-id="${lesson.id}" data-module-id="${module.id}"><div class="lesson-card-icon">${lesson.icon}</div><h4>${lesson.title}</h4><p>${lesson.description}</p><div class="lesson-card-footer"><span class="lesson-xp-badge">+${lesson.xp} XP</span><div class="lesson-status ${isDone ? 'done' : 'todo'}"><i class="fas fa-${isDone ? 'check' : 'play'}"></i></div></div></div>`; }).join(''); return `<div class="lesson-module"><div class="module-header"><div class="module-icon ${module.colorClass}">${module.icon}</div><div class="module-meta"><h3>${module.title}</h3><p>${module.description} · ${done}/${total} ${ui('lessons_done')}</p></div><div class="module-progress-ring"><svg width="44" height="44" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--bg4)" stroke-width="4"/><circle cx="20" cy="20" r="16" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" transform="rotate(-90 20 20)"/></svg></div></div><div class="module-lessons">${lessonsHTML}</div></div>`; }).join(''); document.querySelectorAll('.lesson-card').forEach(card => { card.addEventListener('click', () => { if (!card.classList.contains('locked')) openLesson(card.dataset.moduleId, card.dataset.lessonId); }); }); }
function openLesson(moduleId, lessonId) { const module = LESSON_MODULES.find(m => m.id === moduleId); const lesson = module?.lessons.find(l => l.id === lessonId); if (!lesson) return; STATE.currentLesson = lesson; if (el.lessonMapView) el.lessonMapView.classList.add('hidden'); if (el.lessonDetailView) el.lessonDetailView.classList.remove('hidden'); renderLessonContent(lesson); }
function backToLessonMap() { if (el.lessonMapView) el.lessonMapView.classList.remove('hidden'); if (el.lessonDetailView) el.lessonDetailView.classList.add('hidden'); STATE.currentLesson = null; }
function renderLessonContent(lesson) { if (!el.lessonContent) return; const isDone = STATE.completedLessons.includes(lesson.id); let html = `<div class="lesson-head"><h2>${lesson.icon} ${lesson.title}</h2><p>${lesson.description}</p><div class="lesson-head-footer"><span><i class="fas fa-star"></i> ${lesson.xp} XP</span><span><i class="fas fa-clipboard-list"></i> ${lesson.exercises.length} ${ui('tasks')}</span>${isDone ? `<span style="color:var(--accent)"><i class="fas fa-check-circle"></i> ${ui('completed')}</span>` : ''}</div></div>`; if (lesson.lecture) { html += `<div class="lecture-block"><h3><i class="fas fa-book"></i> Лекция</h3><div class="lecture-content">${lesson.lecture}</div></div>`; } html += `<div class="theory-block"><h3><i class="fas fa-robot"></i> ${ui('ai_coach_title')}</h3><p>${lesson.aiTip || ui('ai_coach_hint')}</p></div>`; if (lesson.theory) { let theoryTable = ''; if (lesson.theory.tableHeaders && lesson.theory.tableRows) theoryTable = `<table class="theory-table"><thead><tr>${lesson.theory.tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${lesson.theory.tableRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`; html += `<div class="theory-block"><h3><i class="fas fa-book-open"></i> ${lesson.theory.title}</h3><p>${lesson.theory.content}</p>${theoryTable}</div>`; } html += `<div class="exercises-section" id="exercisesSection">${lesson.exercises.map((ex, idx) => { const exId = `ex-${idx}`; let body = ''; if (ex.type === 'mcq') body = `<div class="mcq-options" id="${exId}-options">${ex.options.map((opt, i) => `<button class="mcq-option" data-opt="${i}"><span class="option-letter">${String.fromCharCode(65+i)}</span> ${opt}</button>`).join('')}</div>`; else if (ex.type === 'word_build') body = `<div class="input-exercise"><input type="text" id="${exId}-input" placeholder="Write answer..."></div>`; else if (ex.type === 'error_detection') body = `<div class="input-exercise"><input type="text" id="${exId}-input" placeholder="Write corrected form..."></div>`; else if (ex.type === 'translation') body = `<div class="input-exercise"><input type="text" id="${exId}-input" placeholder="Write translation..."></div>`; const exTypeLabel = ex.type === 'mcq' ? `🔘 ${ui('lesson_quiz')}` : (ex.type === 'word_build' ? `✏️ ${ui('lesson_build')}` : (ex.type === 'error_detection' ? `⚠️ ${ui('lesson_fix')}` : `🌍 ${ui('lesson_translate')}`)); return `<div class="exercise-card" id="${exId}"><div class="exercise-header"><div class="ex-num">${idx+1}</div><div class="ex-type">${exTypeLabel}</div><div class="ex-xp">+${Math.ceil(lesson.xp/lesson.exercises.length)} XP</div></div><div class="exercise-body"><div class="exercise-question">${ex.question}</div>${body}<div class="exercise-feedback" id="${exId}-feedback"></div></div><div class="exercise-actions">${ex.hint ? `<button class="ex-btn hint-btn" data-hint="${ex.hint}"><i class="fas fa-lightbulb"></i> ${ui('lesson_hint')}</button>` : ''}<button class="ex-btn check-btn" data-ex-idx="${idx}"><i class="fas fa-check"></i> ${ui('lesson_check')}</button></div></div>`; }).join('')}</div>`; html += `<div style="text-align:center;margin-top:24px"><button class="complete-btn primary" id="submitLessonBtn"><i class="fas fa-check"></i> ${ui('lesson_finish')}</button></div>`; el.lessonContent.innerHTML = html; document.querySelectorAll('.mcq-option').forEach(opt => opt.addEventListener('click', function() { this.parentElement.querySelectorAll('.mcq-option').forEach(o => o.classList.remove('selected')); this.classList.add('selected'); })); document.querySelectorAll('.check-btn').forEach(btn => btn.addEventListener('click', () => checkExercise(btn.dataset.exIdx, lesson))); document.querySelectorAll('.hint-btn').forEach(btn => btn.addEventListener('click', () => showToast(btn.dataset.hint, 'info'))); document.getElementById('submitLessonBtn')?.addEventListener('click', () => submitLesson(lesson)); }
function checkExercise(exIdx, lesson) { const ex = lesson.exercises[exIdx]; const card = document.querySelector(`.exercise-card:has(.check-btn[data-ex-idx="${exIdx}"])`); if (!card) return; let isCorrect = false, feedback = ''; if (ex.type === 'mcq') { const selected = card.querySelector('.mcq-option.selected'); if (!selected) { showToast('Жауапты таңдаңыз', 'error'); return; } const idx = parseInt(selected.dataset.opt); isCorrect = idx === ex.correct; feedback = ex.explanation; card.querySelectorAll('.mcq-option').forEach((opt, i) => { if (i === ex.correct) opt.classList.add('correct'); if (i === idx && !isCorrect) opt.classList.add('incorrect'); opt.style.pointerEvents = 'none'; }); } else if (ex.type === 'word_build' || ex.type === 'error_detection' || ex.type === 'translation') { const val = card.querySelector('input')?.value?.trim().toLowerCase(); isCorrect = val === ex.correct.toLowerCase(); feedback = ex.explanation || (isCorrect ? 'Дұрыс!' : 'Қате. Қайталап көріңіз.'); const inp = card.querySelector('input'); if (inp) { inp.disabled = true; inp.classList.add(isCorrect ? 'correct' : 'incorrect'); } } card.classList.add(isCorrect ? 'correct' : 'incorrect'); const fb = card.querySelector('.exercise-feedback'); if (fb) { fb.className = `exercise-feedback show ${isCorrect ? 'fb-correct' : 'fb-incorrect'}`; fb.innerHTML = `<i class="fas fa-${isCorrect ? 'check-circle' : 'times-circle'}"></i> ${feedback}`; } card.querySelector('.check-btn').disabled = true; }
function submitLesson(lesson) { const correct = document.querySelectorAll('.exercise-card.correct').length; const total = lesson.exercises.length; const score = Math.round((correct / total) * 100); const earned = score >= 60 ? lesson.xp : Math.round(lesson.xp * score / 100); if (score >= 60 && !STATE.completedLessons.includes(lesson.id)) { STATE.completedLessons.push(lesson.id); localStorage.setItem('km_completed', JSON.stringify(STATE.completedLessons)); } STATE.xp += earned; localStorage.setItem('km_xp', STATE.xp); updateProgressUI(); if (el.lessonContent) { el.lessonContent.innerHTML = `<div class="lesson-complete"><div class="complete-icon">${score >= 80 ? '🏆' : score >= 60 ? '✅' : '📖'}</div><h2>${score >= 80 ? 'Тамаша!' : score >= 60 ? 'Жақсы!' : 'Қайталаңыз'}</h2><p>${score >= 60 ? 'Сабақты сәтті аяқтадыңыз!' : 'Теорияны қайта оқып шығыңыз.'}</p><div class="complete-xp"><i class="fas fa-star"></i> +${earned} XP</div><div class="complete-stats"><div class="c-stat"><div class="c-stat-num" style="color:var(--accent)">${correct}</div><div class="c-stat-label">Дұрыс</div></div><div class="c-stat"><div class="c-stat-num" style="color:var(--accent-err)">${total-correct}</div><div class="c-stat-label">Қате</div></div><div class="c-stat"><div class="c-stat-num">${score}%</div><div class="c-stat-label">Нәтиже</div></div></div><div class="complete-actions"><button class="complete-btn secondary" id="retryBtn"><i class="fas fa-redo"></i> Қайталау</button><button class="complete-btn primary" id="closeLessonBtn"><i class="fas fa-list"></i> Сабақтарға оралу</button></div></div>`; document.getElementById('retryBtn')?.addEventListener('click', () => renderLessonContent(lesson)); document.getElementById('closeLessonBtn')?.addEventListener('click', backToLessonMap); } }
function updateProgressUI() { const total = LESSON_MODULES.reduce((a, m) => a + m.lessons.length, 0); const done = STATE.completedLessons.length; const pct = total ? Math.round((done / total) * 100) : 0; if (el.progressFill) el.progressFill.style.width = `${pct}%`; if (el.progressPct) el.progressPct.textContent = `${pct}%`; if (el.xpDisplay) el.xpDisplay.textContent = `${STATE.xp} XP`; if (el.lessonXP) el.lessonXP.textContent = `${STATE.xp} XP`; }

// ============ HELPERS ============
function handleGlobalKeys(e) { if (e.ctrlKey && e.key === 'h') { e.preventDefault(); switchTab('history'); } if (e.ctrlKey && e.key === 'l') { e.preventDefault(); switchTab('lessons'); } if (e.key === 'Escape' && el.wordInput) el.wordInput.value = ''; }
let toastTimer;
function showToast(msg, type = 'info') { if (!el.toast) return; clearTimeout(toastTimer); el.toast.textContent = msg; el.toast.className = `toast show type-${type}`; toastTimer = setTimeout(() => el.toast.classList.remove('show'), 3000); }
document.addEventListener('click', (e) => { if (!e.target.closest('.lang-ctrl')) el.langMenu?.classList.remove('open'); });