/**
 * منصة منبر الإيمان للقرآن الكريم
 * برمجة وتطوير: الفاروق عمر & محمد أحمد
 */

// --- الإعدادات والمتغيرات العالمية ---
const API_BASE = "https://api.alquran.cloud/v1/surah";
const GEMINI_KEY = "ضغ_مفتاحك_هنا"; // ضع مفتاح Google AI Studio الخاص بك هنا

let currentSurahData = null; // تخزين بيانات السورة الحالية (نصوص وأصوات)
let currentAyahIndex = 0;    // مؤشر لتتبع الآية التي تعمل الآن
let viewMode = 'reading';    // أو 'tajweed' أو 'tafsir'

const audioPlayer = document.getElementById('quranAudio');
const playPauseBtn = document.getElementById('playPauseBtn');
const mainDisplay = document.getElementById('mainDisplay');

// --- 1. تشغيل المنصة عند التحميل ---
window.onload = () => {
    fetchSurahList();
    initTheme();
    checkLastProgress();
};

// جلب قائمة السور (الفهرس)
async function fetchSurahList() {
    try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        renderSurahList(data.data);
    } catch (e) {
        console.error("خطأ في الاتصال بالفهرس");
    }
}

function renderSurahList(surahs) {
    const list = document.getElementById('surahList');
    list.innerHTML = surahs.map(s => `
        <div class="surah-card" id="s-${s.number}" onclick="loadSurah(${s.number}, '${s.name}')">
            <span>${s.number}. ${s.name}</span>
            <small>${s.numberOfAyahs} آية</small>
        </div>
    `).join('');
}

// --- 2. تحميل السورة ومعالجة البيانات ---
async function loadSurah(id, name) {
    mainDisplay.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل كلام الله...</div>';
    document.getElementById('activeSurahTitle').innerText = name;
    document.getElementById('trackSurah').innerText = name;

    // تمييز السورة المختارة في القائمة
    document.querySelectorAll('.surah-card').forEach(c => c.classList.remove('active'));
    document.getElementById(`s-${id}`).classList.add('active');

    try {
        // جلب البيانات المطلوبة (نص عادي، تجويد، تفسير، وصوت مشاري العفاسي)
        const [textRes, tajweedRes, tafsirRes, audioRes] = await Promise.all([
            fetch(`${API_BASE}/${id}`).then(r => r.json()),
            fetch(`${API_BASE}/${id}/ar.tajweed`).then(r => r.json()),
            fetch(`${API_BASE}/${id}/ar.muyassar`).then(r => r.json()),
            fetch(`${API_BASE}/${id}/ar.alafasy`).then(r => r.json())
        ]);

        // دمج البيانات في كائن واحد يسهل التعامل معه
        currentSurahData = textRes.data.ayahs.map((ayah, i) => ({
            text: ayah.text,
            tajweed: tajweedRes.data.ayahs[i].text,
            tafsir: tafsirRes.data.ayahs[i].text,
            audio: audioRes.data.ayahs[i].audio,
            numberInSurah: ayah.numberInSurah
        }));

        currentAyahIndex = 0;
        updateUI();
        saveProgress(id, name);
        
        // البدء بتشغيل الصوت تلقائياً
        playAyah(0);

    } catch (e) {
        mainDisplay.innerHTML = "حدث خطأ أثناء تحميل السورة. يرجى التحقق من الاتصال.";
    }
}

// --- 3. إدارة واجهة القراءة والتفسير ---
function updateUI() {
    if (!currentSurahData) return;

    if (viewMode === 'tafsir') {
        mainDisplay.innerHTML = currentSurahData.map((a, i) => `
            <div class="tafsir-item" id="ayah-box-${i}">
                <strong style="color:var(--accent)">الآية ${a.numberInSurah}:</strong>
                <p>${a.tafsir}</p>
            </div>
        `).join('');
    } else {
        mainDisplay.innerHTML = currentSurahData.map((a, i) => `
            <span class="ayah-text" id="ayah-box-${i}">
                ${viewMode === 'tajweed' ? a.tajweed : a.text}
                <span class="ayah-num">﴿${a.numberInSurah}﴾</span>
            </span>
        `).join(' ');
    }
    // إعادة تمييز الآية الحالية بعد تغيير الوضع
    highlightAyah(currentAyahIndex);
}

// التبديل بين الأوضاع (قراءة/تجويد/تفسير)
window.setView = (mode) => {
    viewMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateUI();
};

// --- 4. محرك تشغيل الصوت المتتالي (إصلاح القارئ) ---
function playAyah(index) {
    if (!currentSurahData || index >= currentSurahData.length) {
        // انتهاء السورة
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        return;
    }

    currentAyahIndex = index;
    audioPlayer.src = currentSurahData[index].audio;
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    
    highlightAyah(index);
}

// تمييز الآية الحالية بصرياً وعمل Scroll لها
function highlightAyah(index) {
    document.querySelectorAll('.ayah-text, .tafsir-item').forEach(el => el.classList.remove('active-ayah'));
    const activeEl = document.getElementById(`ayah-box-${index}`);
    if (activeEl) {
        activeEl.classList.add('active-ayah');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// الحدث السحري: عند انتهاء الآية الحالية، شغل التالية فوراً
audioPlayer.onended = () => {
    playAyah(currentAyahIndex + 1);
};

// تحكم زر التشغيل/الإيقاف
playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

// تحديث شريط الوقت والتقدم
audioPlayer.ontimeupdate = () => {
    const prog = document.getElementById('audioProgress');
    if (audioPlayer.duration) {
        prog.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.getElementById('timeDisplay').innerText = formatTime(audioPlayer.currentTime);
    }
};

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

// --- 5. حفظ التقدم والوضع الداكن ---
function saveProgress(id, name) {
    localStorage.setItem('manbar_last_id', id);
    localStorage.setItem('manbar_last_name', name);
}

function checkLastProgress() {
    const id = localStorage.getItem('manbar_last_id');
    const name = localStorage.getItem('manbar_last_name');
    if (id) {
        // تحميل السورة الأخيرة بعد قليل من الوقت لضمان جاهزية الفهرس
        setTimeout(() => loadSurah(id, name), 1000);
    }
}

function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

document.getElementById('themeToggle').onclick = function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
};

// --- 6. مساعد منبر الإيمان الذكي (Gemini) ---
window.toggleChat = () => {
    const panel = document.getElementById('aiPanel');
    panel.style.display = (panel.style.display === 'flex') ? 'none' : 'flex';
};

window.askAI = async () => {
    const input = document.getElementById('aiInput');
    const box = document.getElementById('chatBox');
    const text = input.value.trim();

    if (!text) return;

    // إضافة رسالة المستخدم
    box.innerHTML += `<div class="user-msg" style="text-align:left; background:var(--bg); padding:10px; border-radius:10px; margin-bottom:10px;">${text}</div>`;
    input.value = '';

    // رسالة تفكير
    const loadingId = "ai-loading-" + Date.now();
    box.innerHTML += `<div id="${loadingId}" class="ai-msg" style="background:var(--primary); color:white; padding:10px; border-radius:10px; margin-bottom:10px;">جاري استشارة العلم...</div>`;
    box.scrollTop = box.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `أنت مساعد ديني في منصة "منبر الإيمان" من برمجة الفاروق عمر ومحمد أحمد. أجب باختصار ووقار على: ${text}` }]
                }]
            })
        });

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        document.getElementById(loadingId).innerText = aiResponse;

    } catch (e) {
        document.getElementById(loadingId).innerText = "عذراً، تأكد من إعداد مفتاح API بشكل صحيح.";
    }
    box.scrollTop = box.scrollHeight;
};