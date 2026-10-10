// مسجد الشيخ الطيب - مواقيت الصلاة والعد التنازلي

document.addEventListener("DOMContentLoaded", () => {
    const dateElement = document.getElementById("today-date");
    const yearElement = document.getElementById("current-year");
    const prayerCards = document.querySelectorAll(".prayer-card");
    const prayerNote = document.querySelector(".prayer-note");
    const nextPrayerName = document.getElementById("next-prayer-name");
    const countdownElement = document.getElementById("prayer-countdown");

    const prayers = [
        { name: "الفجر", key: "Fajr" },
        { name: "الظهر", key: "Dhuhr" },
        { name: "العصر", key: "Asr" },
        { name: "المغرب", key: "Maghrib" },
        { name: "العشاء", key: "Isha" }
    ];

    let prayerTimes = null;
    let nextFajrTime = null;

    function getCairoDateString(date = new Date()) {
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Africa/Cairo",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).formatToParts(date);

        const values = {};
        parts.forEach(part => {
            if (part.type !== "literal") values[part.type] = part.value;
        });

        return `${values.day}-${values.month}-${values.year}`;
    }

    function updateDate() {
        const now = new Date();

        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString("ar-EG", {
                timeZone: "Africa/Cairo",
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }

        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    // تحويل وقت القاهرة المحلي إلى توقيت فعلي
    function cairoTimeToDate(dateString, timeString) {
        const [day, month, year] = dateString.split("-").map(Number);
        const [hour, minute] = timeString.match(/\d+/g).slice(0, 2).map(Number);

        const targetUTC = Date.UTC(year, month - 1, day, hour, minute);
        let result = targetUTC;

        for (let i = 0; i < 3; i++) {
            const shown = new Intl.DateTimeFormat("en-GB", {
                timeZone: "Africa/Cairo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hourCycle: "h23"
            }).formatToParts(new Date(result));

            const v = {};
            shown.forEach(part => {
                if (part.type !== "literal") v[part.type] = Number(part.value);
            });

            const shownUTC = Date.UTC(
                v.year, v.month - 1, v.day, v.hour, v.minute
            );

            result += targetUTC - shownUTC;
        }

        return new Date(result);
    }

    function formatTime(time) {
        const [hour, minute] = time.match(/\d+/g).slice(0, 2).map(Number);
        const date = new Date();
        date.setHours(hour, minute, 0, 0);

        return date.toLocaleTimeString("ar-EG", {
            timeZone: "Africa/Cairo",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    async function fetchTimings(dateString) {
        const url =
            `https://api.aladhan.com/v1/timingsByCity/${dateString}` +
            `?city=El%20Shorouk&country=Egypt&method=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("تعذر الاتصال بمصدر مواقيت الصلاة");
        }

        const result = await response.json();

        if (result.code !== 200 || !result.data?.timings) {
            throw new Error("بيانات مواقيت الصلاة غير متاحة");
        }

        return result.data.timings;
    }

    async function loadPrayerTimes() {
        if (prayerNote) {
            prayerNote.textContent = "جارٍ تحميل مواقيت الصلاة...";
        }

        try {
            const today = getCairoDateString();
            const tomorrow = getCairoDateString(
                new Date(Date.now() + 36 * 60 * 60 * 1000)
            );

            prayerTimes = await fetchTimings(today);
            nextFajrTime = await fetchTimings(tomorrow);

            prayerCards.forEach((card, index) => {
                const timeElement = card.querySelector("p");
                const prayer = prayers[index];
                const time = prayerTimes[prayer.key];

                if (timeElement && time) {
                    timeElement.textContent = formatTime(time);
                }
            });

            if (prayerNote) {
                prayerNote.textContent =
                    "المواقيت مقدمة من AlAdhan، وقد تختلف عن التوقيت المعتمد رسميًا بالمسجد.";
            }

            updateCountdown();

        } catch (error) {
            console.error(error);

            if (prayerNote) {
                prayerNote.textContent =
                    "تعذر تحميل المواقيت. تحقق من اتصال الإنترنت وحاول لاحقًا.";
            }

            if (countdownElement) {
                countdownElement.textContent = "--:--:--";
            }

            if (nextPrayerName) {
                nextPrayerName.textContent = "المواقيت غير متاحة";
            }
        }
    }

    function updateCountdown() {
        if (!prayerTimes || !nextPrayerName || !countdownElement) return;

        const now = new Date();
        const today = getCairoDateString();

        let upcoming = null;

        for (const prayer of prayers) {
            const time = prayerTimes[prayer.key];
            if (!time) continue;

            const prayerDate = cairoTimeToDate(today, time);

            if (prayerDate > now) {
                upcoming = {
                    name: prayer.name,
                    date: prayerDate
                };
                break;
            }
        }

        // لو انتهت صلوات اليوم، الصلاة القادمة هي فجر الغد
        if (!upcoming && nextFajrTime?.Fajr) {
            const tomorrow = getCairoDateString(
                new Date(Date.now() + 36 * 60 * 60 * 1000)
            );

            upcoming = {
                name: "الفجر",
                date: cairoTimeToDate(tomorrow, nextFajrTime.Fajr)
            };
        }

        if (!upcoming) return;

        const secondsLeft = Math.max(
            0,
            Math.floor((upcoming.date.getTime() - now.getTime()) / 1000)
        );

        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;

        nextPrayerName.textContent = upcoming.name;

        countdownElement.textContent = [
            String(hours).padStart(2, "0"),
            String(minutes).padStart(2, "0"),
            String(seconds).padStart(2, "0")
        ].join(":");
    }

    updateDate();
    loadPrayerTimes();

    // تحديث العد التنازلي كل ثانية
    setInterval(updateCountdown, 1000);

    // تحديث التاريخ باستمرار
    setInterval(updateDate, 60 * 1000);

    // إعادة تحميل المواقيت كل ساعة
    setInterval(loadPrayerTimes, 60 * 60 * 1000);
});