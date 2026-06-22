(function () {
  "use strict";

  const QUESTIONS = [
    {
      id: 1,
      career: "Tiếp viên hàng không",
      startAt: 67.7,
      endAt: 72.6,
      question:
        "Để theo đuổi ngành tiếp viên hàng không, yếu tố nào sau đây là quan trọng?",
      options: [
        "Kỹ năng giao tiếp tốt, xử lý tình huống linh hoạt và tác phong chuyên nghiệp",
        "Chỉ cần giỏi lập trình máy tính",
        "Chỉ cần có khả năng vẽ thiết kế",
        "Không cần kỹ năng giao tiếp",
      ],
      correct: 0,
    },
    {
      id: 2,
      career: "Kỹ sư phần mềm",
      startAt: 105.2,
      endAt: 107.7,
      question: "Kỹ sư phần mềm thường làm công việc nào?",
      options: [
        "Xây dựng website, hệ thống và phát triển phần mềm",
        "Điều khiển máy bay",
        "Thiết kế thời trang",
        "Làm việc trong phiên tòa",
      ],
      correct: 0,
    },
    {
      id: 3,
      career: "UI Designer",
      startAt: 140.1,
      endAt: 142.6,
      question: "Một UI Designer cần có tố chất nào?",
      options: [
        "Sáng tạo, khả năng quan sát người dùng và tư duy thiết kế",
        "Chỉ cần sức khỏe tốt",
        "Chỉ cần hiểu luật pháp",
        "Không cần quan tâm trải nghiệm người dùng",
      ],
      correct: 0,
    },
    {
      id: 4,
      career: "Chuyên viên pháp lý",
      startAt: 182.65,
      endAt: 185.14,
      question: "Người làm chuyên viên pháp lý cần có phẩm chất nào?",
      options: [
        "Tư duy logic, khả năng phân tích và sự công bằng",
        "Khả năng lập trình game",
        "Kỹ năng điều khiển máy bay",
        "Khả năng thiết kế giao diện",
      ],
      correct: 0,
    },
    {
      id: 5,
      career: "Giáo viên",
      startAt: 202,
      endAt: 204,
      question: "Giáo viên có thể làm việc trong môi trường nào?",
      options: [
        "Trường học, trung tâm giáo dục hoặc nền tảng trực tuyến",
        "Chỉ làm trong công ty công nghệ",
        "Chỉ làm trong sân bay",
        "Chỉ làm trong phòng thí nghiệm",
      ],
      correct: 0,
    },
  ];

  const LETTERS = ["A", "B", "C", "D"];
  const FEEDBACK_MS = 900;
  const HIDE_ANIM_MS = 280;
  const SEEK_STEP = 10;
  const TRIGGER_EPS = 0.05;

  const video = document.getElementById("careerVideo");
  const overlay = document.getElementById("quizOverlay");
  const cardWrap = document.getElementById("quizCardWrap");
  const careerEl = document.getElementById("quizCareer");
  const questionEl = document.getElementById("quizQuestion");
  const optionsEl = document.getElementById("quizOptions");
  const feedbackEl = document.getElementById("quizFeedback");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnSeekBack = document.getElementById("btnSeekBack");
  const btnSeekForward = document.getElementById("btnSeekForward");
  const progressFill = document.getElementById("progressFill");
  const timeCurrent = document.getElementById("timeCurrent");
  const timeDuration = document.getElementById("timeDuration");
  const quizCounter = document.getElementById("quizCounter");
  const startScreen = document.getElementById("startScreen");

  const state = {
    answered: new Set(),
    active: null,
    selected: null,
    quizLock: false,
    showingFeedback: false,
    dismissing: false,
    endedHandled: false,
    started: false,
  };

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  function clampTime(time) {
    const duration = video.duration;
    const max = Number.isFinite(duration) && duration > 0 ? duration : time;
    return Math.max(0, Math.min(time, max));
  }

  function canSeek() {
    return state.started && !state.quizLock && !state.dismissing && !state.showingFeedback;
  }

  function updateSeekButtons() {
    const enabled = canSeek();
    btnSeekBack.disabled = !enabled;
    btnSeekForward.disabled = !enabled;
  }

  function updateProgress() {
    const d = video.duration;
    if (Number.isFinite(d) && d > 0) {
      progressFill.style.width = (video.currentTime / d) * 100 + "%";
    }
    timeCurrent.textContent = formatTime(video.currentTime);
    quizCounter.textContent = state.answered.size + "/5 câu đã hoàn thành";
    updateSeekButtons();
  }

  function findQuestionCrossedOnForwardSeek(fromTime, toTime) {
    if (toTime <= fromTime + 0.001) return null;

    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      if (state.answered.has(q.id)) continue;
      if (fromTime < q.startAt - TRIGGER_EPS && toTime >= q.startAt - TRIGGER_EPS) {
        return q;
      }
    }
    return null;
  }

  function enforceQuizZone() {
    if (!state.quizLock || !state.active) return;

    if (!video.paused) {
      video.pause();
    }

    if (Math.abs(video.currentTime - state.active.startAt) > 0.12) {
      video.currentTime = state.active.startAt;
    }
  }

  function renderOptions(q) {
    optionsEl.innerHTML = "";
    q.options.forEach(function (text, idx) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.index = String(idx);
      btn.innerHTML =
        '<span class="option-letter">' +
        LETTERS[idx] +
        "</span><span>" +
        text +
        "</span>";
      btn.addEventListener("click", function () {
        if (state.showingFeedback || state.dismissing) return;
        state.selected = idx;
        optionsEl.querySelectorAll(".option").forEach(function (el) {
          el.classList.toggle("is-selected", Number(el.dataset.index) === idx);
        });
        btnSubmit.disabled = false;
      });
      optionsEl.appendChild(btn);
    });
  }

  function showQuiz(q) {
    if (state.answered.has(q.id)) return;

    state.active = q;
    state.selected = null;
    state.quizLock = true;

    video.pause();
    video.currentTime = q.startAt;

    careerEl.textContent = q.career;
    questionEl.textContent = q.question;
    feedbackEl.hidden = true;
    feedbackEl.className = "feedback";
    feedbackEl.textContent = "";
    btnSubmit.disabled = true;
    btnSubmit.hidden = false;

    renderOptions(q);

    overlay.classList.remove("is-hiding");
    cardWrap.classList.remove("is-hiding");
    overlay.classList.add("is-visible");
    cardWrap.classList.add("is-visible");
    overlay.setAttribute("aria-hidden", "false");
    cardWrap.setAttribute("aria-hidden", "false");

    updateProgress();
  }

  function hideQuizUI(callback) {
    state.dismissing = true;
    overlay.classList.remove("is-visible");
    cardWrap.classList.remove("is-visible");
    overlay.classList.add("is-hiding");
    cardWrap.classList.add("is-hiding");
    overlay.setAttribute("aria-hidden", "true");
    cardWrap.setAttribute("aria-hidden", "true");

    window.setTimeout(function () {
      overlay.classList.remove("is-hiding");
      cardWrap.classList.remove("is-hiding");
      state.dismissing = false;
      if (callback) callback();
    }, HIDE_ANIM_MS);
  }

  function continueAfterQuiz(q) {
    state.answered.add(q.id);
    state.active = null;
    state.selected = null;
    state.showingFeedback = false;

    video.currentTime = q.endAt;

    hideQuizUI(function () {
      state.quizLock = false;
      video.play().catch(function () {});
      updateProgress();
    });
  }

  function onSubmit() {
    if (!state.active || state.selected === null || state.showingFeedback) return;

    const q = state.active;
    const isCorrect = state.selected === q.correct;

    state.showingFeedback = true;
    btnSubmit.disabled = true;

    optionsEl.querySelectorAll(".option").forEach(function (el, idx) {
      el.disabled = true;
      if (idx === q.correct) el.classList.add("is-correct");
      else if (idx === state.selected && !isCorrect) el.classList.add("is-wrong");
    });

    feedbackEl.hidden = false;
    feedbackEl.textContent = isCorrect
      ? "✓ Chính xác! Video đang tiếp tục…"
      : "Chưa đúng — đáp án đúng là " + LETTERS[q.correct] + ". Video đang tiếp tục…";
    feedbackEl.className = "feedback " + (isCorrect ? "is-correct" : "is-wrong");

    window.setTimeout(function () {
      continueAfterQuiz(q);
    }, FEEDBACK_MS);
  }

  function checkTriggers() {
    if (state.quizLock || state.dismissing || state.showingFeedback) {
      enforceQuizZone();
      return;
    }

    const t = video.currentTime;

    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      if (state.answered.has(q.id)) continue;
      if (t >= q.startAt - TRIGGER_EPS) {
        showQuiz(q);
        return;
      }
    }
  }

  function seekBy(delta) {
    if (!canSeek()) return;

    const fromTime = video.currentTime;
    const toTime = clampTime(fromTime + delta);

    if (Math.abs(toTime - fromTime) < 0.01) return;

    video.pause();

    if (delta > 0) {
      const crossed = findQuestionCrossedOnForwardSeek(fromTime, toTime);
      if (crossed) {
        showQuiz(crossed);
        return;
      }
    }

    video.currentTime = toTime;
    updateProgress();
    checkTriggers();
  }

  function returnToLibrary() {
    if (state.endedHandled) return;
    state.endedHandled = true;
    video.pause();

    if (window.parent !== window) {
      window.parent.postMessage(
        { type: "lexa-career-video-ended" },
        window.location.origin,
      );
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign("/library");
    }
  }

  video.addEventListener("loadedmetadata", function () {
    timeDuration.textContent = formatTime(video.duration);
    updateProgress();
  });

  video.addEventListener("timeupdate", function () {
    updateProgress();
    checkTriggers();
  });

  video.addEventListener("seeked", function () {
    if (state.quizLock) {
      enforceQuizZone();
      return;
    }
    checkTriggers();
  });

  video.addEventListener("play", function () {
    if (state.quizLock) {
      video.pause();
    }
  });

  video.addEventListener("ended", function () {
    returnToLibrary();
  });

  btnSubmit.addEventListener("click", onSubmit);

  btnSeekBack.addEventListener("click", function () {
    seekBy(-SEEK_STEP);
  });

  btnSeekForward.addEventListener("click", function () {
    seekBy(SEEK_STEP);
  });

  startScreen.addEventListener("click", function () {
    startScreen.classList.add("is-hidden");
    state.started = true;
    video.play().catch(function () {
      startScreen.classList.remove("is-hidden");
      state.started = false;
      updateSeekButtons();
    });
    updateSeekButtons();
  });

  document.addEventListener("keydown", function (event) {
    if (!canSeek()) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      seekBy(-SEEK_STEP);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      seekBy(SEEK_STEP);
    }
  });

  updateProgress();
})();
