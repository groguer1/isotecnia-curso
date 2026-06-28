/* SCORM 1.2 API wrapper. Busca el API en la ventana padre/opener; si no hay LMS
   (p.ej. abriendo el HTML suelto para probar), usa localStorage como respaldo
   para que el curso siga siendo navegable y testeable. */
(function (global) {
  function findAPI(win) {
    var tries = 0;
    while (win && !win.API && win.parent && win.parent !== win && tries < 10) {
      win = win.parent;
      tries++;
    }
    if (win && win.API) return win.API;
    if (global.opener) return findAPI(global.opener);
    return null;
  }

  var lms = findAPI(global);
  var initialized = false;
  var FALLBACK_KEY = 'iso27001_scorm_fallback_cmi';

  function fallbackStore() {
    try {
      return JSON.parse(localStorage.getItem(FALLBACK_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }
  function fallbackSave(data) {
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  var SCORM = {
    isLMSPresent: !!lms,

    init: function () {
      if (initialized) return true;
      if (lms) {
        var ok = lms.LMSInitialize('');
        initialized = (ok === 'true' || ok === true);
      } else {
        initialized = true;
      }
      return initialized;
    },

    get: function (key) {
      if (lms) {
        return lms.LMSGetValue(key);
      }
      var data = fallbackStore();
      return data[key] !== undefined ? data[key] : '';
    },

    set: function (key, value) {
      if (lms) {
        lms.LMSSetValue(key, String(value));
        lms.LMSCommit('');
      } else {
        var data = fallbackStore();
        data[key] = String(value);
        fallbackSave(data);
      }
    },

    commit: function () {
      if (lms) lms.LMSCommit('');
    },

    finish: function () {
      if (lms && initialized) {
        lms.LMSCommit('');
        lms.LMSFinish('');
        initialized = false;
      }
    }
  };

  global.SCORM = SCORM;
  global.addEventListener('beforeunload', function () {
    SCORM.finish();
  });
})(window);
