/* Extensión del motor para el Módulo 14 — Proyecto Final (wizard de slides): Implementa tu SGSI. */
(function () {
  var Deck = window.Deck;
  var PASS_SCORE = 8; // sobre 10

  var EMPRESAS = [
    { id: 'clinica', icon: '🏥', nombre: 'Clínica de salud digital', desc: '30 empleados, historiales clínicos electrónicos' },
    { id: 'fintech', icon: '💳', nombre: 'Fintech de pagos', desc: '50 empleados, procesa tarjetas y datos bancarios' },
    { id: 'ecommerce', icon: '🛒', nombre: 'E-commerce B2C', desc: '20 empleados, base de clientes y pagos online' },
    { id: 'consultora', icon: '🖥️', nombre: 'Consultora TI / SaaS B2B', desc: '40 empleados, aloja datos de clientes corporativos' },
    { id: 'ayuntamiento', icon: '🏛️', nombre: 'Administración pública local', desc: '60 empleados, datos de ciudadanos' },
    { id: 'propia', icon: '🏢', nombre: 'Mi organización real', desc: 'Usa tu propia organización' }
  ];

  var CAMPOS = [
    { id: 'p1_alcance', min: 20, nombre: 'Alcance del SGSI' },
    { id: 'p1_politica', min: 25, nombre: 'Política de seguridad de la información' },
    { id: 'p2_activos', min: 20, nombre: 'Activos críticos identificados' },
    { id: 'p2_riesgos', min: 30, nombre: 'Evaluación de riesgos' },
    { id: 'p2_tratamiento', min: 25, nombre: 'Plan de tratamiento de riesgos' },
    { id: 'p3_soa', min: 30, nombre: 'Declaración de Aplicabilidad (controles seleccionados/excluidos)' },
    { id: 'p3_controles', min: 20, nombre: 'Controles técnicos prioritarios' },
    { id: 'p4_legal', min: 15, nombre: 'Requisitos legales (RGPD/NIS2) aplicables' },
    { id: 'p5_auditoria', min: 15, nombre: 'Plan de auditoría interna' },
    { id: 'p5_indicadores', min: 20, nombre: 'Indicadores y revisión por la dirección' }
  ];

  function ensureProyecto() {
    if (!Deck.state.proyecto) Deck.state.proyecto = { empresa: null, respuestas: {}, score: undefined, nombreAlumno: '' };
    return Deck.state.proyecto;
  }

  function contarPalabras(texto) {
    return (texto || '').trim().split(/\s+/).filter(function (w) { return w.length > 0; }).length;
  }

  Deck.onBoot = function () { ensureProyecto(); };

  Deck.canAdvance_empresas = function () { return !!ensureProyecto().empresa; };
  Deck.canAdvance_evaluar = function () { return ensureProyecto().score !== undefined; };

  Deck.customGate = function () {
    var p = ensureProyecto();
    var score = p.score || 0;
    return { passed: score >= PASS_SCORE, score: score * 10 };
  };

  Deck.render_empresas = function () {
    var self = this;
    var p = ensureProyecto();
    var wrap = document.createElement('div');
    wrap.className = 'slide-inner';
    var grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit,minmax(200px,1fr))';
    grid.style.gap = '14px';
    grid.innerHTML = '<h2 style="grid-column:1/-1;text-align:center;">Elige la organización de tu proyecto</h2>';
    EMPRESAS.forEach(function (e) {
      var btn = document.createElement('button');
      btn.style.cssText = 'text-align:center;background:#fff;border:2px solid ' + (p.empresa === e.id ? 'var(--azul-mid)' : 'var(--gris-2)') + ';border-radius:12px;padding:20px 14px;cursor:pointer;';
      btn.innerHTML = '<div style="font-size:32px;margin-bottom:10px;">' + e.icon + '</div><h4 style="font-size:14px;margin-bottom:6px;">' + e.nombre + '</h4><p style="font-size:12px;color:#4A5568;margin:0;">' + e.desc + '</p>';
      btn.addEventListener('click', function () {
        p.empresa = e.id;
        self.persist();
        self.renderSlide();
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
    return wrap;
  };

  Deck.render_proyecto = function (slide) {
    var self = this;
    var p = ensureProyecto();
    var wrap = document.createElement('div');
    wrap.className = 'slide-inner';
    wrap.innerHTML = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">' +
      '<div style="width:34px;height:34px;border-radius:50%;background:var(--azul);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">' + slide.num + '</div>' +
      '<h2 style="margin:0;">' + slide.title + '</h2></div>';
    slide.campos.forEach(function (campo) {
      var field = document.createElement('div');
      field.style.marginBottom = '18px';
      var label = document.createElement('label');
      label.style.cssText = 'display:block;font-size:14px;font-weight:600;margin-bottom:8px;color:var(--texto);';
      label.textContent = campo.label;
      var ta = document.createElement('textarea');
      ta.placeholder = campo.placeholder;
      ta.value = p.respuestas[campo.id] || '';
      ta.style.cssText = 'width:100%;min-height:' + (campo.minHeight || 100) + 'px;border:2px solid var(--gris-2);border-radius:8px;padding:12px;font-size:14px;font-family:inherit;resize:vertical;';
      ta.addEventListener('input', function () { p.respuestas[campo.id] = ta.value; self.persist(); });
      field.appendChild(label);
      field.appendChild(ta);
      if (campo.hint) {
        var hint = document.createElement('div');
        hint.style.cssText = 'font-size:12px;color:var(--gris-3);margin-top:6px;';
        hint.textContent = campo.hint;
        field.appendChild(hint);
      }
      wrap.appendChild(field);
    });
    return wrap;
  };

  Deck.render_evaluar = function () {
    var self = this;
    var p = ensureProyecto();
    var wrap = document.createElement('div');
    wrap.className = 'slide-inner';
    wrap.innerHTML = '<h2 style="text-align:center;">Evalúa tu proyecto</h2>' +
      '<p style="text-align:center;">Cuando hayas completado las secciones, evalúa tu SGSI. No hay respuestas incorrectas: se valora que cada sección esté suficientemente desarrollada y sea coherente con la organización elegida.</p>' +
      '<div style="text-align:center;margin:20px 0;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
      '<button class="btn-nav" id="btnEvaluar">🎓 Evaluar mi proyecto</button>' +
      '<button class="btn-nav secundario" id="btnExportar">📄 Exportar mi SGSI en PDF</button>' +
      '</div><div id="resultadoWrap"></div>';

    wrap.querySelector('#btnExportar').addEventListener('click', function () {
      var empresa = EMPRESAS.find(function (e) { return e.id === p.empresa; });
      var lines = ['SISTEMA DE GESTIÓN DE SEGURIDAD DE LA INFORMACIÓN — ISO/IEC 27001', '='.repeat(50), ''];
      lines.push('Organización: ' + (empresa ? empresa.nombre : '(sin seleccionar)'));
      lines.push('Elaborado el: ' + new Date().toLocaleDateString('es-ES'));
      lines.push('');
      CAMPOS.forEach(function (c) {
        lines.push(c.nombre.toUpperCase());
        lines.push(p.respuestas[c.id] || '(sin completar)');
        lines.push('');
      });
      buildDocumentPDF('Proyecto final — Sistema de Gestión de Seguridad de la Información', lines.join('\n'), 'sgsi-proyecto-final-iso27001.pdf');
    });

    function renderResultado() {
      var completados = 0;
      var feedback = '';
      CAMPOS.forEach(function (c) {
        var palabras = contarPalabras(p.respuestas[c.id]);
        if (palabras >= c.min) {
          completados++;
        } else {
          feedback += '<div style="padding:8px 0;border-bottom:1px solid var(--gris-2);font-size:13.5px;color:var(--rojo);">⚠️ <strong>' + c.nombre + '</strong>: amplía esta sección (' + palabras + ' palabras, mínimo recomendado ' + c.min + ').</div>';
        }
      });
      var score = Math.round((completados / CAMPOS.length) * 10);
      p.score = score;
      self.persist();
      var passed = score >= PASS_SCORE;
      var color = passed ? 'var(--verde)' : score >= 6 ? 'var(--acento)' : 'var(--rojo)';
      var label = passed ? '🎉 Proyecto completado — puedes avanzar a tu certificado' : score >= 6 ? '📖 Buen trabajo — completa las secciones marcadas para obtener el certificado' : '✏️ Desarrolla más las secciones indicadas';
      wrap.querySelector('#resultadoWrap').innerHTML =
        '<div style="text-align:center;font-family:\'DM Serif Display\',serif;font-size:56px;color:' + color + ';">' + score + '/10</div>' +
        '<div style="text-align:center;margin-bottom:18px;color:var(--gris-3);">' + label + '</div>' +
        (feedback || '<p style="text-align:center;color:var(--verde);">✅ Todas las secciones están bien desarrolladas.</p>');
      self.updateNavBar();
    }

    wrap.querySelector('#btnEvaluar').addEventListener('click', renderResultado);
    if (p.score !== undefined) renderResultado();
    return wrap;
  };

  Deck.render_certificado = function () {
    var p = ensureProyecto();
    var wrap = document.createElement('div');
    wrap.className = 'slide-inner';
    if (p.score === undefined || p.score < PASS_SCORE) {
      wrap.innerHTML = '<h2 style="text-align:center;">Aún no has superado el proyecto</h2><p style="text-align:center;">Necesitas una puntuación de al menos 8/10. Vuelve a las secciones del proyecto, completa o amplía tus respuestas y vuelve a evaluar.</p>';
      return wrap;
    }
    var fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    wrap.innerHTML =
      '<div style="background:linear-gradient(135deg,#1B3F6E 0%,#2A5FA8 50%,#1B3F6E 100%);border-radius:16px;padding:40px;color:#fff;text-align:center;">' +
      '<div style="font-size:12px;letter-spacing:2px;color:var(--acento);margin-bottom:18px;">ISOTECNIA</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.6);margin-bottom:8px;">Certifica que</div>' +
      '<div id="certNombrePreview" style="font-family:\'DM Serif Display\',serif;font-size:28px;margin-bottom:18px;">' + (p.nombreAlumno ? esc_(p.nombreAlumno) : 'Profesional en Seguridad de la Información') + '</div>' +
      '<p style="font-size:14px;color:rgba(255,255,255,0.85);max-width:560px;margin:0 auto 18px;">ha completado satisfactoriamente el curso <strong style="color:#fff;">ISO/IEC 27001 &amp; 27701 — Implementador de SGSI y SGPI</strong>, con proyecto final aprobado (' + p.score + '/10 puntos).</p>' +
      '<div style="font-size:12.5px;color:rgba(255,255,255,0.6);">14 módulos · 30 horas · evaluación por lección · ' + fecha + '</div>' +
      '</div>' +
      '<div style="max-width:360px;margin:24px auto 0;">' +
      '<label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;">Tu nombre completo (aparecerá en el certificado)</label>' +
      '<input type="text" id="inputNombre" placeholder="Nombre y apellidos" value="' + (p.nombreAlumno ? esc_(p.nombreAlumno) : '') + '" style="width:100%;padding:10px 12px;border:2px solid var(--gris-2);border-radius:8px;font-size:14px;font-family:inherit;">' +
      '</div>' +
      '<div style="text-align:center;margin-top:22px;"><button class="btn-nav" id="btnDescargarCert">⬇ Descargar certificado en PDF</button></div>';

    function esc_(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
    var self = this;
    wrap.querySelector('#inputNombre').addEventListener('input', function (e) {
      p.nombreAlumno = e.target.value;
      self.persist();
      wrap.querySelector('#certNombrePreview').textContent = p.nombreAlumno || 'Profesional en Seguridad de la Información';
    });
    wrap.querySelector('#btnDescargarCert').addEventListener('click', function () {
      buildCertificatePDF({ nombre: p.nombreAlumno || 'Profesional en Seguridad de la Información', puntuacion: p.score, fecha: fecha });
    });
    return wrap;
  };

  function buildCertificatePDF(data) {
    var jsPDFCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    var w = doc.internal.pageSize.getWidth();
    var h = doc.internal.pageSize.getHeight();
    var azul = [27, 63, 110], acento = [232, 160, 32], dorado = [196, 154, 60], gris = [110, 120, 135];

    doc.setFillColor(252, 252, 250);
    doc.rect(0, 0, w, h, 'F');

    doc.setDrawColor(azul[0], azul[1], azul[2]);
    doc.setLineWidth(2.2);
    doc.rect(28, 28, w - 56, h - 56);
    doc.setDrawColor(dorado[0], dorado[1], dorado[2]);
    doc.setLineWidth(0.8);
    doc.rect(40, 40, w - 80, h - 80);

    [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(function (c) {
      doc.setFillColor(dorado[0], dorado[1], dorado[2]);
      doc.circle(c[0], c[1], 3, 'F');
    });

    var cx = w / 2;

    doc.setTextColor(acento[0], acento[1], acento[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('ISOTECNIA', cx, 88, { align: 'center' });

    doc.setTextColor(azul[0], azul[1], azul[2]);
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(30);
    doc.text('Certificado de Finalización', cx, 124, { align: 'center' });

    doc.setDrawColor(dorado[0], dorado[1], dorado[2]);
    doc.setLineWidth(1);
    doc.line(cx - 90, 138, cx + 90, 138);

    doc.setTextColor(gris[0], gris[1], gris[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12.5);
    doc.text('Se otorga el presente certificado a', cx, 172, { align: 'center' });

    doc.setTextColor(20, 24, 32);
    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.text(data.nombre, cx, 212, { align: 'center' });
    doc.setDrawColor(azul[0], azul[1], azul[2]);
    doc.setLineWidth(0.7);
    doc.line(cx - 160, 222, cx + 160, 222);

    doc.setTextColor(50, 56, 66);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12.5);
    var body = 'por haber completado satisfactoriamente el curso "ISO/IEC 27001 & 27701 — Implementador de SGSI y SGPI",\ndemostrando competencia en el diseño, implantación, gestión de riesgos y auditoría de Sistemas\nde Gestión de Seguridad de la Información y Privacidad conforme a las normas ISO/IEC 27001:2022 y 27701:2019.';
    var by = 250;
    body.split('\n').forEach(function (l) { doc.text(l, cx, by, { align: 'center' }); by += 18; });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(azul[0], azul[1], azul[2]);
    doc.text('Proyecto final aprobado · Puntuación: ' + data.puntuacion + '/10 · Resultado: APTO', cx, by + 14, { align: 'center' });

    var sigY = h - 118;
    doc.setDrawColor(120, 128, 140);
    doc.setLineWidth(0.6);
    doc.line(110, sigY, 290, sigY);
    doc.line(w - 290, sigY, w - 110, sigY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(70, 78, 90);
    doc.text('Director Académico', 200, sigY + 16, { align: 'center' });
    doc.text(data.fecha, w - 200, sigY + 16, { align: 'center' });

    doc.setDrawColor(dorado[0], dorado[1], dorado[2]);
    doc.setLineWidth(1.4);
    doc.circle(cx, sigY - 10, 26);
    doc.setFontSize(8);
    doc.setTextColor(dorado[0], dorado[1], dorado[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('ISO 27001', cx, sigY - 12, { align: 'center' });
    doc.text('27701', cx, sigY - 2, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setTextColor(150, 158, 170);
    doc.setFont('helvetica', 'normal');
    doc.text('ISO/IEC 27001:2022 · ISO/IEC 27701:2019 · 30 horas · Proyecto final de implementación SGSI', cx, h - 58, { align: 'center' });

    doc.save('certificado-iso27001-' + data.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.pdf');
  }
})();
