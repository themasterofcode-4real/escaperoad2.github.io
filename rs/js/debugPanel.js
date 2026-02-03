// js/debugPanel.js
(() => {
  // Turn on with ?debug=1 once, then it persists in this browser.
  const params = new URLSearchParams(location.search);
  if (params.get("debug") === "1") localStorage.setItem("DEBUG_ENABLED", "1");
  const enabled = localStorage.getItem("DEBUG_ENABLED") === "1";
  if (!enabled) return;

  const root = document.createElement("div");
  root.id = "debug-panel";
  root.innerHTML = `
    <div class="dp-h">
      <strong>Dev Panel</strong>
      <div class="dp-btns">
        <button id="dp-state">State</button>
        <button id="dp-close">×</button>
      </div>
    </div>
    <div class="dp-b">
      <div class="dp-row">
        <input id="dp-cmd" placeholder="help" />
        <button id="dp-run">Run</button>
      </div>
      <pre id="dp-log"></pre>
      <div class="dp-row">
        <button id="dp-off">Disable</button>
      </div>
      <div class="dp-note">
        Expose <code>window.__DEV__</code> from game code for safe dev hooks.
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const style = document.createElement("style");
  style.textContent = `
    #debug-panel{position:fixed;right:16px;bottom:16px;z-index:999999;
      width:360px;background:#111;color:#eee;border:1px solid #444;border-radius:12px;
      font:12px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);overflow:hidden}
    #debug-panel .dp-h{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#1a1a1a;border-bottom:1px solid #333}
    #debug-panel .dp-btns{display:flex;gap:8px}
    #debug-panel .dp-b{padding:12px;display:flex;flex-direction:column;gap:10px}
    #debug-panel .dp-row{display:flex;gap:8px}
    #debug-panel input{flex:1;padding:8px;border-radius:8px;border:1px solid #333;background:#0b0b0b;color:#eee}
    #debug-panel button{padding:8px 10px;border-radius:8px;border:1px solid #333;background:#222;color:#eee;cursor:pointer}
    #debug-panel pre{margin:0;padding:10px;background:#0b0b0b;border:1px solid #333;border-radius:8px;max-height:180px;overflow:auto;white-space:pre-wrap}
    #debug-panel .dp-note{color:#bbb}
    #debug-panel code{color:#ddd}
  `;
  document.head.appendChild(style);

  const logEl = root.querySelector("#dp-log");
  const log = (msg) => (logEl.textContent = `${msg}\n` + logEl.textContent);

  const commands = {
    help() {
      return "Commands: help | dev | state | call <fn> [args...]";
    },
    dev() {
      return window.__DEV__ ? "__DEV__ present ✅" : "__DEV__ missing ❌";
    },
    state() {
      if (!window.__DEV__?.getState) return "Add __DEV__.getState() in game code.";
      try { return JSON.stringify(window.__DEV__.getState(), null, 2); }
      catch (e) { return `getState error: ${e?.message || e}`; }
    },
    call(fnName, ...args) {
      if (!fnName) return "Usage: call <fn> [args...]";
      const fn = window.__DEV__?.[fnName];
      if (typeof fn !== "function") return `No such __DEV__ fn: ${fnName}`;
      const out = fn(...args);
      return out === undefined ? "ok" : String(out);
    }
  };

  const run = () => {
    const raw = root.querySelector("#dp-cmd").value.trim();
    if (!raw) return;
    const [name, ...args] = raw.split(/\s+/);
    const fn = commands[name];
    if (!fn) return log(`Unknown: ${name} (try: help)`);
    try { log(fn(...args)); } catch (e) { log(`Error: ${e?.message || e}`); }
  };

  root.querySelector("#dp-run").onclick = run;
  root.querySelector("#dp-cmd").addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
  root.querySelector("#dp-state").onclick = () => log(commands.state());
  root.querySelector("#dp-close").onclick = () => root.remove();
  root.querySelector("#dp-off").onclick = () => { localStorage.removeItem("DEBUG_ENABLED"); root.remove(); };

  log("Dev Panel enabled. Type: help");
})();
