/* Motor de slides + integración SCORM. Requiere scorm_api.js cargado antes. */
(function (global) {
  var TOTAL_MODULES = 14;
  var PASS_THRESHOLD = 70;

  var TITLES = [
    'Marco Normativo: Familia ISO 27000',
    'SGSI: Fundamentos y Requisitos',
    'Gestión de Riesgos de Seguridad',
    'Anexo A 2022: Los 93 Controles',
    'Declaración de Aplicabilidad (SoA)',
    'ISO/IEC 27701: El SGPI en Profundidad',
    'Integración SGSI + SGPI',
    'Marco Legal: RGPD, LOPDGDD y NIS2',
    'Implementación Práctica del Sistema',
    'Documentación del Sistema',
    'Auditoría Interna del SGSI+SGPI',
    'Proceso de Certificación',
    'Casos Prácticos',
    'Proyecto Final'
  ];

  function file(n) { return 'iso27001-modulo' + n + '.html'; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

  /* ---------------- Generador de PDF para descargables ---------------- */
  function buildDocumentPDF(title, contentText, filename) {
    var jsPDFCtor = (global.jspdf && global.jspdf.jsPDF) || global.jsPDF;
    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var marginX = 56, marginTop = 110, marginBottom = 60;
    var azul = [26, 58, 92], acento = [232, 88, 32], gris = [90, 100, 115];

    function drawHeader() {
      doc.setFillColor(azul[0], azul[1], azul[2]);
      doc.rect(0, 0, pageW, 70, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('ISOTECNIA · CONSULTOR ISO 27001/27701 CERTIFICADO', marginX, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(220, 230, 240);
      doc.text(title, marginX, 48);
      doc.setDrawColor(acento[0], acento[1], acento[2]);
      doc.setLineWidth(3);
      doc.line(0, 70, pageW, 70);
    }

    function drawFooter(pageNum) {
      doc.setFontSize(8.5);
      doc.setTextColor(gris[0], gris[1], gris[2]);
      doc.setFont('helvetica', 'normal');
      doc.text('Isotecnia — Curso Consultor ISO 27001/27701 · Material de apoyo', marginX, pageH - 28);
      doc.text(String(pageNum), pageW - marginX, pageH - 28, { align: 'right' });
    }

    var pageNum = 1;
    drawHeader();
    drawFooter(pageNum);
    var y = marginTop;
    var maxWidth = pageW - marginX * 2;

    function newPageIfNeeded(lineHeight) {
      if (y + lineHeight > pageH - marginBottom) {
        doc.addPage();
        pageNum++;
        drawHeader();
        drawFooter(pageNum);
        y = marginTop;
      }
    }

    var lines = contentText.split('\n');
    // La primera línea suele repetir el título (ya mostrado en la cabecera) seguida de una línea "====".
    if (lines.length > 1 && /^=+$/.test((lines[1] || '').trim())) {
      lines = lines.slice(2);
      while (lines.length && lines[0].trim() === '') lines.shift();
    }

    function isAllCapsHeading(line) {
      var t = line.trim().replace(/\([^)]*\)\s*$/, '').trim();
      if (t.length < 3 || t.length > 70) return false;
      if (/^[\[•\-]/.test(line)) return false;
      if (!/[A-ZÁÉÍÓÚÑ]/.test(t)) return false;
      return t.toUpperCase() === t;
    }

    lines.forEach(function (raw) {
      var line = raw.replace(/\r$/, '');
      if (line.trim() === '' || /^=+$/.test(line.trim())) { y += 8; return; }

      var isHeading = isAllCapsHeading(line);
      var isChecklist = /^\s*\[\s?\]/.test(line);
      var isBullet = /^\s*[•\-]\s/.test(line) && !isChecklist;

      if (isHeading) {
        newPageIfNeeded(26);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(azul[0], azul[1], azul[2]);
        doc.text(line.trim(), marginX, y);
        y += 6;
        doc.setDrawColor(225, 228, 235);
        doc.setLineWidth(0.7);
        doc.line(marginX, y, pageW - marginX, y);
        y += 14;
        return;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(40, 45, 55);

      if (isChecklist) {
        var text = line.replace(/^\s*\[\s?\]\s*/, '');
        newPageIfNeeded(16);
        doc.setDrawColor(150, 160, 175);
        doc.rect(marginX, y - 8, 8, 8);
        var wrapped = doc.splitTextToSize(text, maxWidth - 18);
        wrapped.forEach(function (wl, i) {
          newPageIfNeeded(14);
          doc.text(wl, marginX + 14, y);
          y += 14;
        });
        return;
      }

      if (isBullet) {
        var btext = line.replace(/^\s*[•\-]\s*/, '');
        var wrappedB = doc.splitTextToSize('•  ' + btext, maxWidth - 10);
        wrappedB.forEach(function (wl) {
          newPageIfNeeded(14);
          doc.text(wl, marginX + 6, y);
          y += 14;
        });
        return;
      }

      var wrapped2 = doc.splitTextToSize(line, maxWidth);
      wrapped2.forEach(function (wl) {
        newPageIfNeeded(14);
        doc.text(wl, marginX, y);
        y += 14;
      });
    });

    doc.save(filename);
  }
  global.buildDocumentPDF = buildDocumentPDF;

  /* ---------------- Progreso global (entre módulos) ---------------- */
  function loadGlobal() {
    var raw = global.SCORM.get('cmi.suspend_data');
    if (!raw) return { modules: {} };
    try { var p = JSON.parse(raw); if (!p.modules) p.modules = {}; return p; } catch (e) { return { modules: {} }; }
  }
  function saveGlobal(p) { global.SCORM.set('cmi.suspend_data', JSON.stringify(p)); }
  function highestUnlocked(p) {
    for (var i = 1; i < TOTAL_MODULES; i++) { if (p.modules[i] !== 'passed') return i; }
    return TOTAL_MODULES;
  }

  function renderSidebar(moduleNum, globalProgress) {
    var ul = document.getElementById('sidebar-nav');
    if (!ul) return;
    var unlocked = highestUnlocked(globalProgress);
    var html = '';
    for (var i = 1; i <= TOTAL_MODULES; i++) {
      var classes = [];
      if (i === moduleNum) classes.push('active');
      if (globalProgress.modules[i] === 'passed') classes.push('done');
      if (i <= unlocked) {
        html += '<li><a href="' + file(i) + '" class="' + classes.join(' ') + '">' +
          '<span class="check">' + (globalProgress.modules[i] === 'passed' ? '✓' : i) + '</span> ' + TITLES[i - 1] + '</a></li>';
      } else {
        classes.push('locked');
        html += '<li><a href="javascript:void(0)" class="' + classes.join(' ') + '" onclick="Deck.lockedClick()">' +
          '<span class="check">' + i + '</span> ' + TITLES[i - 1] + '</a></li>';
      }
    }
    ul.innerHTML = html;
    var fill = document.querySelector('.progress-bar-fill');
    var pct = document.querySelector('.progress-pct');
    if (fill) fill.style.width = Math.round(((moduleNum - 1) / TOTAL_MODULES) * 100) + '%';
    if (pct) pct.textContent = 'Módulo ' + moduleNum + ' de ' + TOTAL_MODULES;
  }

  /* ---------------- Deck (slides de un módulo) ---------------- */
  var Deck = {
    moduleNum: 0,
    slides: [],
    index: 0,
    maxVisited: 0,
    state: { answers: {} },
    globalProgress: null,

    lockedClick: function () {
      alert('Tienes que aprobar el quiz de este módulo (mínimo ' + PASS_THRESHOLD + '%) antes de continuar. Puedes repasar el contenido y reintentar el quiz cuantas veces necesites.');
    },

    boot: function (moduleNum, slides) {
      global.SCORM.init();
      this.moduleNum = moduleNum;
      this.slides = slides;
      this.globalProgress = loadGlobal();

      var unlocked = highestUnlocked(this.globalProgress);
      if (moduleNum > unlocked) { window.location.replace(file(unlocked)); return; }

      renderSidebar(moduleNum, this.globalProgress);
      global.SCORM.set('cmi.core.lesson_location', 'modulo' + moduleNum);
      var status = global.SCORM.get('cmi.core.lesson_status');
      if (!status || status === 'not attempted') global.SCORM.set('cmi.core.lesson_status', 'incomplete');

      var moduleState = (this.globalProgress.moduleState || {})[moduleNum] || { index: 0, maxVisited: 0, state: { answers: {} } };
      this.index = Math.min(moduleState.index || 0, slides.length - 1);
      this.maxVisited = moduleState.maxVisited || 0;
      this.state = moduleState.state || { answers: {} };
      if (!this.state.answers) this.state.answers = {};

      if (typeof this.onBoot === 'function') this.onBoot();

      this.renderDots();
      this.renderSlide();
      this.bindKeys();
    },

    persist: function () {
      if (!this.globalProgress.moduleState) this.globalProgress.moduleState = {};
      this.globalProgress.moduleState[this.moduleNum] = { index: this.index, maxVisited: this.maxVisited, state: this.state };
      saveGlobal(this.globalProgress);
    },

    bindKeys: function () {
      var self = this;
      document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') self.goNext();
        if (e.key === 'ArrowLeft') self.goPrev();
      });
    },

    currentSlide: function () { return this.slides[this.index]; },

    isQuizAnswered: function (slide) { return this.state.answers[slide.id] !== undefined; },

    canAdvance: function () {
      var s = this.currentSlide();
      if (s.type === 'quiz') return this.isQuizAnswered(s);
      var fn = this['canAdvance_' + s.type];
      if (typeof fn === 'function') return fn.call(this, s);
      return true;
    },

    isLastSlide: function () { return this.index === this.slides.length - 1; },

    moduleHasQuiz: function () { return this.slides.some(function (s) { return s.type === 'quiz'; }); },

    quizScore: function () {
      var total = 0, correct = 0;
      var self = this;
      this.slides.forEach(function (s) {
        if (s.type === 'quiz') {
          total++;
          var ans = self.state.answers[s.id];
          if (ans && ans.correct) correct++;
        }
      });
      return { correct: correct, total: total, pct: total ? Math.round((correct / total) * 100) : 100 };
    },

    goNext: function () {
      if (!this.canAdvance()) {
        this.flashHint();
        return;
      }
      if (this.index < this.slides.length - 1) {
        this.index++;
        if (this.index > this.maxVisited) this.maxVisited = this.index;
        this.persist();
        this.renderSlide();
        this.renderDots();
      } else {
        this.tryAdvanceModule();
      }
    },

    goPrev: function () {
      if (this.index > 0) {
        this.index--;
        this.persist();
        this.renderSlide();
        this.renderDots();
      } else if (this.moduleNum > 1) {
        window.location.href = file(this.moduleNum - 1);
      }
    },

    goTo: function (i) {
      if (i <= this.maxVisited) {
        this.index = i;
        this.persist();
        this.renderSlide();
        this.renderDots();
      }
    },

    flashHint: function () {
      var hint = document.getElementById('lockMsg');
      if (!hint) return;
      hint.style.display = 'block';
      hint.textContent = '👉 Responde a la pregunta para continuar.';
      setTimeout(function () { hint.style.display = 'none'; }, 2200);
    },

    tryAdvanceModule: function (opts) {
      opts = opts || {};
      var passed = true;
      var scoreForSCORM = null;
      if (typeof this.customGate === 'function') {
        var r = this.customGate();
        passed = r.passed;
        scoreForSCORM = r.score;
      } else if (this.moduleHasQuiz()) {
        var score = this.quizScore();
        passed = score.pct >= PASS_THRESHOLD;
        scoreForSCORM = score.pct;
      }
      if (scoreForSCORM !== null) {
        this.globalProgress.modules[this.moduleNum] = passed ? 'passed' : 'failed';
        global.SCORM.set('cmi.core.score.raw', scoreForSCORM);
        saveGlobal(this.globalProgress);
        renderSidebar(this.moduleNum, this.globalProgress);
      }
      if (!passed) {
        var hint = document.getElementById('lockMsg');
        if (hint) {
          hint.style.display = 'block';
          hint.textContent = opts.lockMessage || ('🔒 Necesitas al menos ' + PASS_THRESHOLD + '% para avanzar. Revisa lo que falta y vuelve a intentarlo.');
        }
        return;
      }
      if (this.moduleNum < TOTAL_MODULES) {
        window.location.href = file(this.moduleNum + 1);
      } else {
        global.SCORM.set('cmi.core.lesson_status', 'passed');
        global.SCORM.commit();
        var done = document.getElementById('lockMsg');
        if (done) { done.style.display = 'block'; done.style.color = 'var(--verde)'; done.textContent = '🎉 ¡Curso completado! Ya puedes descargar tu certificado.'; }
      }
    },

    retryQuiz: function () {
      var self = this;
      this.slides.forEach(function (s) { if (s.type === 'quiz') delete self.state.answers[s.id]; });
      var firstQuizIdx = this.slides.findIndex(function (s) { return s.type === 'quiz'; });
      this.index = firstQuizIdx >= 0 ? firstQuizIdx : 0;
      this.persist();
      this.renderSlide();
      this.renderDots();
    },

    /* ---------------- Render ---------------- */
    renderDots: function () {
      var wrap = document.getElementById('deckDots');
      if (!wrap) return;
      var self = this;
      wrap.innerHTML = this.slides.map(function (s, i) {
        var cls = ['dot'];
        if (i === self.index) cls.push('current');
        if (i < self.index || (s.type === 'quiz' && self.isQuizAnswered(s))) cls.push('done');
        return '<span class="' + cls.join(' ') + '" data-i="' + i + '"></span>';
      }).join('');
      Array.prototype.forEach.call(wrap.querySelectorAll('.dot'), function (dot) {
        dot.addEventListener('click', function () { self.goTo(parseInt(dot.getAttribute('data-i'), 10)); });
      });
      var bar = document.getElementById('deckProgressFill');
      if (bar) bar.style.width = Math.round(((this.index + 1) / this.slides.length) * 100) + '%';
    },

    renderSlide: function () {
      var stage = document.getElementById('stage');
      stage.innerHTML = '';
      var el = document.createElement('div');
      el.className = 'slide current';
      el.appendChild(this.buildSlideContent(this.currentSlide()));
      stage.appendChild(el);
      this.updateNavBar();
      window.scrollTo(0, 0);
    },

    updateNavBar: function () {
      var prevBtn = document.getElementById('btnPrev');
      var nextBtn = document.getElementById('btnNext');
      var lockMsg = document.getElementById('lockMsg');
      if (lockMsg) lockMsg.style.display = 'none';

      if (this.index === 0 && this.moduleNum === 1) {
        prevBtn.style.visibility = 'hidden';
      } else {
        prevBtn.style.visibility = 'visible';
        prevBtn.textContent = this.index === 0 ? '← Módulo anterior' : '← Anterior';
      }

      if (this.isLastSlide()) {
        nextBtn.textContent = this.moduleNum === TOTAL_MODULES ? '✓ Finalizar curso' : 'Módulo siguiente →';
      } else {
        nextBtn.textContent = 'Siguiente →';
      }
      nextBtn.disabled = !this.canAdvance();
    },

    /* ---------------- Renderizadores por tipo de slide ---------------- */
    buildSlideContent: function (slide) {
      var fn = this['render_' + slide.type];
      if (!fn) { var d = document.createElement('div'); d.textContent = 'Tipo de slide desconocido: ' + slide.type; return d; }
      return fn.call(this, slide);
    },

    render_portada: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      wrap.innerHTML =
        '<div class="slide-eyebrow">' + esc(slide.eyebrow) + '</div>' +
        '<h1>' + esc(slide.title) + '</h1>' +
        '<p class="slide-intro">' + esc(slide.intro) + '</p>' +
        '<div class="slide-meta">' + slide.meta.map(function (m) { return '<span class="meta-item">' + esc(m) + '</span>'; }).join('') + '</div>';
      return wrap;
    },

    render_texto: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var h = slide.heading ? '<h2>' + esc(slide.heading) + '</h2>' : '';
      wrap.innerHTML = h + slide.html;
      return wrap;
    },

    render_infografia: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      wrap.innerHTML =
        '<div class="infografia-wrap"><div class="infografia-titulo">' + esc(slide.titulo) + '</div>' + slide.svg + '</div>';
      return wrap;
    },

    render_tabla: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var thead = '<thead><tr>' + slide.headers.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>';
      var tbody = '<tbody>' + slide.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
      wrap.innerHTML = (slide.heading ? '<h2>' + esc(slide.heading) + '</h2>' : '') + '<div class="tabla-wrap"><table>' + thead + tbody + '</table></div>';
      return wrap;
    },

    render_cardgrid: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var toneClass = { F: 'tone-verde', D: 'tone-rojo', O: 'tone-azul', A: 'tone-acento' };
      var cardsHtml = slide.cards.map(function (c) {
        var tone = c.tone ? (toneClass[c.tone] || '') : '';
        var badgeIsShort = c.badge && c.badge.length <= 3;
        return '<div class="cg-card ' + tone + '">' +
          (c.badge && badgeIsShort ? '<div class="cg-badge">' + esc(c.badge) + '</div>' : '') +
          (c.badge && !badgeIsShort ? '<span class="cg-tag">' + esc(c.badge) + '</span>' : '') +
          (c.tag ? '<span class="cg-tag">' + esc(c.tag) + '</span>' : '') +
          (c.meta ? '<div class="cg-meta">' + esc(c.meta) + '</div>' : '') +
          (c.title ? '<h4>' + esc(c.title) + '</h4>' : '') +
          (c.bodyHtml || '') +
          '</div>';
      }).join('');
      wrap.innerHTML = (slide.heading ? '<h2>' + esc(slide.heading) + '</h2>' : '') +
        '<div class="cg-wrap ' + (slide.variant === 'timeline' ? 'cg-timeline' : 'cg-grid') + '">' + cardsHtml + '</div>';
      return wrap;
    },

    render_callout: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var icons = { info: 'ℹ️', alerta: '⚠️', clave: '🎯', legal: '⚖️' };
      var card = document.createElement('div');
      card.className = 'callout-card ' + slide.variant;
      card.innerHTML =
        '<div class="cc-face"><div class="cc-icon">' + (icons[slide.variant] || '💡') + '</div><div>' +
        '<div class="cc-label">' + esc(slide.label) + '</div>' +
        '<div class="cc-hint">Toca para ver el detalle →</div></div></div>' +
        '<div class="cc-body">' + slide.html + '</div>';
      card.addEventListener('click', function () { card.classList.toggle('open'); });
      wrap.appendChild(card);
      return wrap;
    },

    render_clausebox: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var card = document.createElement('div');
      card.className = 'clausebox-card';
      card.innerHTML =
        '<div class="cb-ref">📖 ' + esc(slide.ref) + '</div>' +
        '<h3 class="cb-title">' + esc(slide.title) + '</h3>' +
        '<div class="cb-body">' + slide.html + '</div>';
      wrap.appendChild(card);
      return wrap;
    },

    render_rawhtml: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner rawhtml-slide';
      wrap.innerHTML = slide.html;
      return wrap;
    },

    render_penal: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var card = document.createElement('div');
      card.className = 'flip-card';
      card.innerHTML =
        '<div class="flip-inner">' +
        '<div class="flip-front"><h3>⚖️ ' + esc(slide.title) + '</h3><div class="hint">Toca la tarjeta para ver el detalle</div></div>' +
        '<div class="flip-back">' + slide.html + '</div>' +
        '</div>';
      card.addEventListener('click', function () { card.classList.toggle('flipped'); });
      wrap.appendChild(card);
      return wrap;
    },

    render_caso: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var card = document.createElement('div');
      card.className = 'caso-card';
      card.innerHTML =
        '<div class="caso-header"><span class="caso-badge">' + esc(slide.badge) + '</span><h4>' + esc(slide.title) + '</h4></div>' +
        '<div class="caso-situacion">' + slide.situacion + '</div>' +
        '<button class="caso-reveal-btn">Ver qué pasó después →</button>' +
        '<div class="caso-extra">' + slide.extra + '</div>';
      card.querySelector('.caso-reveal-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        card.classList.add('open');
      });
      wrap.appendChild(card);
      return wrap;
    },

    render_descargable: function (slide) {
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      var card = document.createElement('div');
      card.className = 'descargable-card';
      card.innerHTML =
        '<div class="descargable-icon">' + (slide.icon || '📋') + '</div><div><h4>' + esc(slide.title) + '</h4>' +
        '<p>' + esc(slide.desc) + '</p><button class="btn-dl">⬇ Descargar</button></div>';
      card.querySelector('.btn-dl').addEventListener('click', function () {
        var filename = slide.filename.replace(/\.txt$/i, '.pdf');
        buildDocumentPDF(slide.title, slide.content, filename);
      });
      wrap.appendChild(card);
      return wrap;
    },

    render_quiz: function (slide) {
      var self = this;
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner quiz-slide';
      var answered = this.state.answers[slide.id];
      var optsHtml = slide.options.map(function (opt, i) {
        var cls = 'quiz-opcion';
        if (answered) {
          cls += ' disabled';
          if (i === slide.correctIndex) cls += ' correcta';
          else if (i === answered.idx) cls += ' incorrecta';
        }
        return '<div class="' + cls + '" data-i="' + i + '"><div class="dot"></div>' + esc(opt) + '</div>';
      }).join('');
      wrap.innerHTML =
        '<div class="quiz-progress">Pregunta ' + slide.num + ' de ' + slide.total + '</div>' +
        '<div class="quiz-q">' + esc(slide.question) + '</div>' +
        '<div class="quiz-opciones">' + optsHtml + '</div>' +
        '<div class="quiz-feedback ' + (answered ? (answered.correct ? 'ok' : 'ko') : '') + '">' +
        (answered ? esc(answered.correct ? slide.feedbackOk : slide.feedbackKo) : '') + '</div>';

      if (!answered) {
        Array.prototype.forEach.call(wrap.querySelectorAll('.quiz-opcion'), function (node) {
          node.addEventListener('click', function () {
            var idx = parseInt(node.getAttribute('data-i'), 10);
            var correct = idx === slide.correctIndex;
            self.state.answers[slide.id] = { idx: idx, correct: correct };
            self.persist();
            self.renderSlide();
            self.renderDots();
          });
        });
      }
      return wrap;
    },

    render_resumen: function (slide) {
      var score = this.quizScore();
      var passed = score.pct >= PASS_THRESHOLD;
      var wrap = document.createElement('div');
      wrap.className = 'slide-inner';
      wrap.innerHTML =
        '<h2 style="text-align:center;">Resultado del quiz</h2>' +
        '<div class="resumen-score" style="color:' + (passed ? 'var(--verde)' : 'var(--rojo)') + '">' + score.pct + '%</div>' +
        '<div class="resumen-label">' + score.correct + ' de ' + score.total + ' correctas — ' +
        (passed ? '✅ Quiz superado, puedes avanzar al siguiente módulo.' : '🔄 Necesitas un ' + PASS_THRESHOLD + '% para avanzar.') + '</div>' +
        '<div class="resumen-actions">' +
        (passed ? '' : '<button class="btn-nav secundario" id="btnRetry">↺ Reintentar quiz</button>') +
        '</div>';
      var retryBtn = wrap.querySelector('#btnRetry');
      if (retryBtn) {
        var self = this;
        retryBtn.addEventListener('click', function () { self.retryQuiz(); });
      }
      return wrap;
    }
  };

  global.Deck = Deck;
})(window);
