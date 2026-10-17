// Ask Sheikh floating chat widget
(function () {
  const widgetHTML = `
    <button type="button" class="ask-sheikh-fab" id="askSheikhFab" aria-label="اسأل الشيخ">
      <span class="fab-label">اسأل الشيخ</span>
      🕌
    </button>
    <div class="ask-sheikh-panel" id="askSheikhPanel">
      <div class="ask-sheikh-header">
        <div>
          <h4>اسأل الشيخ</h4>
          <small>مسجد الشيخ الطيب - مدينة الشروق</small>
        </div>
        <button type="button" class="ask-sheikh-close" id="askSheikhClose">×</button>
      </div>
      <div class="ask-sheikh-body" id="askSheikhBody">
        <p>مرحباً بك! اكتب سؤالك وسيتم إرساله للشيخ للرد عليه إن شاء الله.</p>
        <form class="ask-sheikh-form" id="askSheikhForm">
          <label>اسمك:</label>
          <input type="text" name="name" placeholder="الاسم" required>
          <label>البريد الإلكتروني (اختياري):</label>
          <input type="email" name="email" placeholder="example@email.com">
          <label>السؤال:</label>
          <textarea name="question" placeholder="اكتب سؤالك هنا..." required></textarea>
          <button type="submit" class="ask-sheikh-submit">إرسال السؤال</button>
        </form>
      </div>
    </div>
  `;

  function injectWidget() {
    const container = document.createElement("div");
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    const fab = document.getElementById("askSheikhFab");
    const panel = document.getElementById("askSheikhPanel");
    const closeBtn = document.getElementById("askSheikhClose");
    const form = document.getElementById("askSheikhForm");
    const body = document.getElementById("askSheikhBody");

    fab.addEventListener("click", () => panel.classList.toggle("open"));
    closeBtn.addEventListener("click", () => panel.classList.remove("open"));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim() || "غير محدد",
        question: form.question.value.trim(),
        answer: "",
        date: new Date().toLocaleString("ar-EG"),
        timestamp: Date.now()
      };

      try {
        if (window.db) {
          await window.db.collection("questions").add(data);
        } else {
          // Fallback to localStorage
          const list = JSON.parse(localStorage.getItem("sheikhQuestions") || "[]");
          list.push(data);
          localStorage.setItem("sheikhQuestions", JSON.stringify(list));
        }
        body.innerHTML = `
          <div class="ask-sheikh-success">
            <div style="font-size:40px;margin-bottom:10px;">✅</div>
            <strong>تم إرسال سؤالك بنجاح</strong>
            <p style="margin-top:8px;">سيقوم الشيخ بالرد عليه قريباً إن شاء الله.</p>
          </div>
        `;
      } catch (err) {
        alert("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
        console.error(err);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectWidget);
  } else {
    injectWidget();
  }
})();
