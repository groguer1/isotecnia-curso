/* ============================================================
   ISOTECNIA — JavaScript Maestro
   ============================================================ */

/* ---- Acordeón ---- */
function initAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.classList.contains('open');
      document.querySelectorAll('.accordion-trigger.open').forEach(t => {
        t.classList.remove('open');
        const b = t.nextElementSibling;
        if (b) b.classList.remove('open');
      });
      if (!isOpen) {
        trigger.classList.add('open');
        const body = trigger.nextElementSibling;
        if (body) body.classList.add('open');
      }
    });
  });
}

/* ---- Quiz interactivo ---- */
function initQuizzes() {
  document.querySelectorAll('.quiz-block').forEach(block => {
    const options = block.querySelectorAll('.quiz-option');
    const feedback = block.querySelector('.quiz-feedback');
    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (block.dataset.answered === 'true') return;
        block.dataset.answered = 'true';
        const isCorrect = opt.dataset.correct === 'true';
        opt.classList.add(isCorrect ? 'correct' : 'incorrect');
        if (!isCorrect) {
          options.forEach(o => {
            if (o.dataset.correct === 'true') o.classList.add('correct');
          });
        }
        if (feedback) {
          feedback.style.display = 'block';
          feedback.classList.add(isCorrect ? 'callout--norm' : 'callout--warn');
        }
        options.forEach(o => { o.style.cursor = 'default'; });
      });
    });
  });
}

/* ---- Progress bar de lectura ---- */
function initProgressBar() {
  const bar = document.querySelector('.progress-bar-fill');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  });
}

/* ---- Progreso del curso en localStorage ---- */
const PROGRESS_KEY = 'isotecnia_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch { return {}; }
}

function markComplete(lessonId) {
  const p = getProgress();
  p[lessonId] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  updateProgressUI();
}

function updateProgressUI() {
  const p = getProgress();
  const total = document.querySelectorAll('[data-lesson-id]').length;
  if (!total) return;
  const done = Object.keys(p).length;
  const pct = Math.round((done / total) * 100);
  const el = document.getElementById('course-progress-pct');
  if (el) el.textContent = pct + '%';
  document.querySelectorAll('[data-lesson-id]').forEach(link => {
    if (p[link.dataset.lessonId]) {
      link.classList.add('completed');
    }
  });
}

/* ---- Tooltips de referencia normativa ---- */
function initNormTooltips() {
  document.querySelectorAll('[data-norm-ref]').forEach(el => {
    el.style.cursor = 'help';
    el.style.borderBottom = '1px dashed var(--accent-dark)';
    el.title = el.dataset.normRef;
  });
}

/* ---- Smooth reveal en scroll ---- */
function initReveal() {
  if (!window.IntersectionObserver) return;
  const els = document.querySelectorAll('.module-card, .profile-card, .stat-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    obs.observe(el);
  });
}

/* ---- Sidebar active link ---- */
function initSidebarActive() {
  const current = window.location.href;
  document.querySelectorAll('.sidebar__nav a').forEach(a => {
    if (a.href === current) a.classList.add('active');
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  initAccordion();
  initQuizzes();
  initProgressBar();
  updateProgressUI();
  initNormTooltips();
  initReveal();
  initSidebarActive();
});
