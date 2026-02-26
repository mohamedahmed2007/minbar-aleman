function calculateAge() {
    const birthInput = document.getElementById("birthDate").value;
    const result = document.getElementById("result");
    const birthDate = new Date(birthInput);
    const today = new Date();

    if (!birthInput) {
        result.innerHTML = "⚠️ اختر تاريخ ميلاد صحيح";
        result.classList.add("show");
        return;
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    result.innerHTML =
        `عمرك هو: ${years} سنة و ${months} شهر و ${days} يوم 🎉`;

    result.classList.remove("show");
    setTimeout(() => result.classList.add("show"), 100);
}

function toggleMode() {
    document.body.classList.toggle("dark");
}

function shareAge() {
    const text = document.getElementById("result").innerText;

    if (!text) {
        alert("احسب عمرك أولاً 😉");
        return;
    }

    if (navigator.share) {
        navigator.share({
            title: "حاسبة العمر",
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
        alert("تم نسخ النتيجة 📋");
    }
}