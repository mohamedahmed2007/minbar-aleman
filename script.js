// 1. التحكم في إظهار وإخفاء نافذة تسجيل الدخول
function toggleAuth() {
    const modal = document.getElementById('authModal');
    modal.classList.toggle('active');
}

// 2. جلب بيانات السور والقراء من الـ API (Alquran.cloud)
async function loadSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        const surahs = data.data;
        
        // هنا يمكنك عرض السور في القائمة الجانبية (اختياري)
        console.log("تم جلب السور بنجاح:", surahs);
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// 3. محاكاة عملية تسجيل الدخول
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    
    // تخزين بسيط في المتصفح (للتجربة فقط)
    localStorage.setItem('user', email);
    
    alert('تم تسجيل الدخول بنجاح يا ' + email.split('@')[0]);
    toggleAuth();
    
    // تغيير زر "تسجيل الدخول" في الهيدر إلى اسم المستخدم
    document.getElementById('authBtn').innerText = 'حسابي';
});
function toggleDarkMode() {
    const htmlElement = document.getElementById('mainHtml');
    const icon = document.getElementById('themeIcon');
    
    // تبديل الكلاس dark في وسم الـ html
    htmlElement.classList.toggle('dark');
    
    // تغيير الأيقونة وحفظ الإعدادات
    if (htmlElement.classList.contains('dark')) {
        icon.innerText = '🌙'; // أيقونة القمر للوضع الداكن
        localStorage.setItem('theme', 'dark');
    } else {
        icon.innerText = '🌞'; // أيقونة الشمس للوضع الفاتح
        localStorage.setItem('theme', 'light');
    }
}

// التحقق من الإعدادات المحفوظة عند فتح الصفحة
if (localStorage.getItem('theme') === 'dark') {
    document.getElementById('mainHtml').classList.add('dark');
    document.getElementById('themeIcon').innerText = '🌙';
}