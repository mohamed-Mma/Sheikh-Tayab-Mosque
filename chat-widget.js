// Ask Sheikh - Step by step chat widget
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
      <div class="ask-sheikh-body" id="askSheikhBody"></div>
    </div>
  `;

  let currentStep = 1;
  let userData = { phone: "", name: "", question: "" };

  function renderStep() {
    const body = document.getElementById("askSheikhBody");
    if (!body) return;

    if (currentStep === 1) {
      body.innerHTML = `
        <p>أهلاً بك. عشان نتابع سؤالك، أدخل رقم موبايلك (يبدأ بـ 01).</p>
        <form class="ask-sheikh-form" id="stepForm">
          <label>رقم الموبايل:</label>
          <input type="tel" name="phone" placeholder="01xxxxxxxxx" required pattern="01[0-9]{9}" maxlength="11">
          <button type="submit" class="ask-sheikh-submit">التالي</button>
        </form>
        <button type="button" class="ask-sheikh-link" id="checkBtn">عندي سؤال سابق؟ ارجع أشوفه</button>
      `;
      document.getElementById("stepForm").onsubmit = (e) => {
        e.preventDefault();
        const phone = e.target.phone.value.trim();
        if (!/^01[0-9]{9}$/.test(phone)) {
          alert("رقم الموبايل لازم يبدأ بـ 01 ويكون 11 رقم");
          return;
        }
        userData.phone = phone;
        currentStep = 2;
        renderStep();
      };
      document.getElementById("checkBtn").onclick = () => {
        currentStep = "check";
        renderStep();
      };
    }

    else if (currentStep === 2) {
      body.innerHTML = `
        <p>تمام. دلوقتي اسمك:</p>
        <form class="ask-sheikh-form" id="stepForm">
          <label>الاسم:</label>
          <input type="text" name="name" placeholder="اسمك" required>
          <button type="submit" class="ask-sheikh-submit">التالي</button>
        </form>
        <button type="button" class="ask-sheikh-link" id="backBtn">← رجوع</button>
      `;
      document.getElementById("stepForm").onsubmit = (e) => {
        e.preventDefault();
        userData.name = e.target.name.value.trim();
        currentStep = 3;
        renderStep();
      };
      document.getElementById("backBtn").onclick = () => { currentStep = 1; renderStep(); };
    }

    else if (currentStep === 3) {
      body.innerHTML = `
        <p>اكتب سؤالك للشيخ:</p>
        <form class="ask-sheikh-form" id="stepForm">
          <label>السؤال:</label>
          <textarea name="question" placeholder="اكتب سؤالك هنا..." required></textarea>
          <button type="submit" class="ask-sheikh-submit">إرسال السؤال</button>
        </form>
        <button type="button" class="ask-sheikh-link" id="backBtn">← رجوع</button>
      `;
      document.getElementById("stepForm").onsubmit = async (e) => {
        e.preventDefault();
        userData.question = e.target.question.value.trim();
        await submitQuestion();
      };
      document.getElementById("backBtn").onclick = () => { currentStep = 2; renderStep(); };
    }

    else if (currentStep === "check") {
      body.innerHTML = `
        <p>أدخل رقم موبايلك عشان تشوف سؤالك والرد:</p>
        <form class="ask-sheikh-form" id="stepForm">
          <label>رقم الموبايل:</label>
          <input type="tel" name="phone" placeholder="01xxxxxxxxx" required>
          <button type="submit" class="ask-sheikh-submit">عرض السؤال</button>
        </form>
        <button type="button" class="ask-sheikh-link" id="backBtn">← رجوع لسؤال جديد</button>
      `;
      document.getElementById("stepForm").onsubmit = (e) => {
        e.preventDefault();
        const phone = e.target.phone.value.trim();
        showExistingQuestion(phone);
      };
      document.getElementById("backBtn").onclick = () => { currentStep = 1; renderStep(); };
    }
  }

  async function submitQuestion() {
    const data = {
      phone: userData.phone,
      name: userData.name,
      question: userData.question,
      answer: "",
      status: "received", // received → reviewing → replied
      date: new Date().toLocaleString("ar-EG"),
      timestamp: Date.now()
    };

    try {
      if (window.db) {
        await window.db.collection("questions").add(data);
      } else {
        const list = JSON.parse(localStorage.getItem("sheikhQuestions") || "[]");
        list.push(data);
        localStorage.setItem("sheikhQuestions", JSON.stringify(list));
      }
      const body = document.getElementById("askSheikhBody");
      body.innerHTML = `
        <div class="ask-sheikh-success">
          <div style="font-size:40px;margin-bottom:10px;">✅</div>
          <strong>تم إرسال سؤالك</strong>
          <p style="margin-top:8px;">الشيخ هيرد عليك بليل إن شاء الله.<br>احتفظ برقمك (${userData.phone}) وارجع هنا تشوف الرد.</p>
          <button type="button" class="ask-sheikh-submit" style="margin-top:14px;" id="doneBtn">تمام</button>
        </div>
      `;
      document.getElementById("doneBtn").onclick = () => {
        currentStep = 1;
        userData = { phone: "", name: "", question: "" };
        renderStep();
      };
    } catch (err) {
      alert("حدث خطأ. حاول مرة أخرى.");
      console.error(err);
    }
  }

  function showExistingQuestion(phone) {
    const list = JSON.parse(localStorage.getItem("sheikhQuestions") || "[]");
    const found = list.filter(q => q.phone === phone).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const body = document.getElementById("askSheikhBody");
    if (!found.length) {
      body.innerHTML = `
        <div class="ask-sheikh-success">
          <p>مفيش سؤال مسجل بالرقم ده.</p>
          <button type="button" class="ask-sheikh-submit" id="backBtn">رجوع</button>
        </div>
      `;
      document.getElementById("backBtn").onclick = () => { currentStep = "check"; renderStep(); };
      return;
    }

    const q = found[0];
    let statusText = "السؤال وصل ✅";
    let statusClass = "status-received";
    if (q.status === "reviewing") { statusText = "الشيخ بيراجع السؤال 📖"; statusClass = "status-reviewing"; }
    if (q.status === "replied" || q.answer) { statusText = "تم الرد ✅"; statusClass = "status-replied"; }

    body.innerHTML = `
      <div class="ask-sheikh-status ${statusClass}">${statusText}</div>
      <div class="ask-sheikh-qbox">
        <strong>سؤالك:</strong>
        <p>${q.question}</p>
        <small>📅 ${q.date || ""}</small>
      </div>
      ${q.answer ? `
        <div class="ask-sheikh-abox">
          <strong>رد الشيخ:</strong>
          <p>${q.answer}</p>
        </div>
      ` : `<p style="text-align:center;color:#777;margin-top:12px;">لسه مفيش رد. الشيخ هيرد بليل إن شاء الله.</p>`}
      <button type="button" class="ask-sheikh-submit" id="backBtn" style="margin-top:12px;">رجوع</button>
    `;
    document.getElementById("backBtn").onclick = () => { currentStep = 1; renderStep(); };
  }

  function injectWidget() {
    const container = document.createElement("div");
    container.innerHTML = widgetHTML;
    document.body.appendChild(container);

    const fab = document.getElementById("askSheikhFab");
    const panel = document.getElementById("askSheikhPanel");
    const closeBtn = document.getElementById("askSheikhClose");

    fab.addEventListener("click", () => {
      panel.classList.toggle("open");
      if (panel.classList.contains("open")) renderStep();
    });
    closeBtn.addEventListener("click", () => panel.classList.remove("open"));

    renderStep();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectWidget);
  } else {
    injectWidget();
  }
})();
