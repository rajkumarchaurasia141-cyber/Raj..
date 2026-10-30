// Safe JSON & Console handler to prevent "TypeError: Converting circular structure to JSON"
// caused by Firestore WebChannel / internal event listeners or dev server iframe wrappers.

(function initSafeJson() {
  if (typeof window === 'undefined') return;

  const originalStringify = JSON.stringify;

  // Safe global JSON.stringify patch that prevents circular structure crashes
  JSON.stringify = function (value: any, replacer?: any, space?: any) {
    try {
      return originalStringify(value, replacer, space);
    } catch (err: any) {
      if (err instanceof TypeError && typeof err.message === 'string' && err.message.toLowerCase().includes('circular')) {
        const seen = new WeakSet();
        try {
          return originalStringify(
            value,
            function (key, val) {
              if (typeof val === 'object' && val !== null) {
                if (seen.has(val)) {
                  return '[Circular]';
                }
                seen.add(val);
              }
              return typeof replacer === 'function' ? replacer(key, val) : val;
            },
            space
          );
        } catch {
          return '"[Unserializable Object]"';
        }
      }
      throw err;
    }
  };

  // Helper to sanitize an argument for safe logging
  function sanitizeForLog(arg: any, depth = 0): any {
    if (arg === null || typeof arg !== 'object') {
      return arg;
    }
    if (depth > 2) {
      return '[Object]';
    }
    if (arg instanceof Error) {
      return `${arg.name}: ${arg.message}`;
    }
    if (Array.isArray(arg)) {
      return arg.slice(0, 10).map((item) => sanitizeForLog(item, depth + 1));
    }
    // For DOM elements or Window
    if (typeof window !== 'undefined' && (arg instanceof EventTarget || arg === window)) {
      return `[${arg.constructor?.name || 'EventTarget'}]`;
    }
    return arg;
  }

  // Safe console wrappers
  const origError = console.error;
  console.error = function (...args: any[]) {
    try {
      const sanitized = args.map((a) => sanitizeForLog(a));
      origError.apply(console, sanitized);
    } catch {
      origError.apply(console, ['[Logged Error]']);
    }
  };

  const origWarn = console.warn;
  console.warn = function (...args: any[]) {
    try {
      const sanitized = args.map((a) => sanitizeForLog(a));
      origWarn.apply(console, sanitized);
    } catch {
      origWarn.apply(console, ['[Logged Warning]']);
    }
  };
})();

export function formatError(err: any): string {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  return err.message || err.code || String(err);
}
