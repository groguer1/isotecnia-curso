window.MODULE_TITLE = "Implementa tu SGSI";
window.SLIDES = [
  { type: 'portada', eyebrow: 'Módulo 14 de 14 — Proyecto Final', title: 'Implementa tu SGSI',
    intro: 'Es el momento de aplicar todo lo aprendido. En este proyecto final diseñarás un Sistema de Gestión de Seguridad de la Información básico para una organización real o ficticia, cubriendo desde el alcance hasta la Declaración de Aplicabilidad y el plan de auditoría.',
    meta: ['⏱ 4 horas', '🎓 Certificado de finalización', '📋 SGSI completo exportable'] },
  { type: 'callout', variant: 'info', label: 'Cómo funciona este proyecto',
    html: '<p>Elige una organización, completa los campos de cada sección aplicando los conocimientos del curso, y al finalizar recibirás tu certificado de finalización y podrás exportar tu SGSI en PDF. No hay respuestas incorrectas: lo que importa es que las respuestas sean coherentes y específicas para la organización elegida.</p>' },
  { type: 'empresas' },
  { type: 'proyecto', num: 1, title: '🎯 Alcance y política de seguridad', campos: [
    { id: 'p1_alcance', label: 'Declaración de alcance del SGSI', placeholder: 'Ejemplo: El SGSI aplica a los sistemas de información que tratan datos de pacientes y al personal sanitario y administrativo de la clínica...', hint: 'Incluye: qué procesos, ubicaciones, sistemas y activos de información abarca.' },
    { id: 'p1_politica', label: 'Redacta la política de seguridad de la información', placeholder: 'En [organización], nuestro compromiso es proteger la confidencialidad, integridad y disponibilidad de...', minHeight: 110, hint: 'Debe incluir compromiso de cumplimiento legal/normativo y de mejora continua.' }
  ]},
  { type: 'proyecto', num: 2, title: '⚠️ Riesgos y tratamiento', campos: [
    { id: 'p2_activos', label: 'Lista los 5 activos de información más críticos', placeholder: '1. Base de datos de clientes\n2. Servidor de aplicaciones\n3. Backups en la nube\n4. Credenciales de administradores\n5. Documentación contractual', minHeight: 110 },
    { id: 'p2_riesgos', label: 'Evalúa 2 riesgos (activo, amenaza, vulnerabilidad, probabilidad, impacto, nivel)', placeholder: 'RIESGO 1: Fuga de datos de clientes por acceso no autorizado\nProbabilidad: 3 · Impacto: 4 · Nivel: 12-CRÍTICO\n\nRIESGO 2: ...', minHeight: 140 },
    { id: 'p2_tratamiento', label: 'Define el plan de tratamiento para esos riesgos', placeholder: 'Riesgo 1: Mitigar mediante MFA + cifrado de BD + revisión de permisos. Responsable: CISO. Plazo: Q2.\nRiesgo 2: ...', minHeight: 120 }
  ]},
  { type: 'proyecto', num: 3, title: '📑 Declaración de Aplicabilidad (SoA)', campos: [
    { id: 'p3_soa', label: 'Selecciona 5 controles del Anexo A aplicables y 2 excluidos, con justificación', placeholder: 'A.5.1 Política de seguridad — Aplicable: sí. Justificación: requerido por el alcance del SGSI.\nA.8.24 Uso de criptografía — Aplicable: sí.\n...\nA.5.23 Seguridad en la nube — Excluido: no se usan servicios cloud propios.', minHeight: 140 },
    { id: 'p3_controles', label: '¿Qué controles técnicos vas a priorizar en los primeros 6 meses?', placeholder: 'MFA en accesos administrativos, cifrado en tránsito y reposo, gestión de logs centralizada, copias de seguridad cifradas...' }
  ]},
  { type: 'proyecto', num: 4, title: '⚖️ Cumplimiento legal', campos: [
    { id: 'p4_legal', label: '¿Qué requisitos legales (RGPD, LOPDGDD, NIS2) aplican a tu organización y por qué?', placeholder: 'Aplica el RGPD porque tratamos datos de salud (categoría especial). Aplica NIS2 porque somos operador de servicios esenciales en el sector sanitario...' }
  ]},
  { type: 'proyecto', num: 5, title: '🔍 Auditoría y mejora continua', campos: [
    { id: 'p5_auditoria', label: 'Plan de auditoría interna: alcance, frecuencia y auditor', placeholder: 'Frecuencia: anual. Alcance: cláusulas 4-10 + controles del Anexo A seleccionados. Auditor: independiente del área de TI.' },
    { id: 'p5_indicadores', label: 'Define 3 indicadores del SGSI y cómo se revisarán en la revisión por la dirección', placeholder: 'Nº de incidentes de seguridad/mes · Tiempo medio de detección · % de empleados formados en concienciación. Revisión: semestral por el Comité de Seguridad.' }
  ]},
  { type: 'evaluar' },
  { type: 'certificado' }
];
