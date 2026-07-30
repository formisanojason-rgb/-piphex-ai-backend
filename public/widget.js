(() => {
  if (document.getElementById("piphex-ai")) return;

  const API_BASE = String(window.PIPHEX_API_URL || "https://piphex-ai.onrender.com/api/").replace(/\/?$/, "/");
  const IMAGE = window.PIPHEX_IMAGE_URL || "https://raw.githubusercontent.com/formisanojason-rgb/gizmo-assets/main/piphex-holding-ball.png";
  const MEMORY_KEY = "piphex-memory-v1";
  const VISITED_KEY = "piphex-visited";
  const OPENING = "Well, look what the gates let back in. Welcome—the books have lowered their expectations accordingly.";
  const EMPTY_MEMORY = {
    enabled: false,
    visitorId: "",
    preferredName: "",
    favoriteCharacters: "",
    booksRead: "",
    spoilerPermission: "spoiler-free",
    favoriteJokes: "",
    sarcasmLevel: "medium",
    loreQuestions: "",
    unfinishedConversations: ""
  };

  const readMemory = () => {
    try {
      return { ...EMPTY_MEMORY, ...JSON.parse(localStorage.getItem(MEMORY_KEY) || "{}") };
    } catch {
      return { ...EMPTY_MEMORY };
    }
  };
  let memory = readMemory();
  const saveMemory = () => localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
  const safeList = value => String(value || "").trim().slice(0, 240);
  const rememberFrom = message => {
    if (!memory.enabled) return;
    const rules = [
      [/\b(?:my name is|call me)\s+([a-z][a-z '-]{0,38})/i, "preferredName"],
      [/\bmy favorite character is\s+(.{1,80})/i, "favoriteCharacters"],
      [/\b(?:i read|i have read|i finished)\s+(.{1,100})/i, "booksRead"],
      [/\bmy favorite joke is\s+(.{1,120})/i, "favoriteJokes"]
    ];
    for (const [pattern, key] of rules) {
      const match = message.match(pattern);
      if (match) memory[key] = safeList(match[1].replace(/[.!?]+$/, ""));
    }
    memory.loreQuestions = safeList([memory.loreQuestions, message].filter(Boolean).slice(-2).join(" | "));
    saveMemory();
  };
  const memorySummary = () => {
    if (!memory.enabled) return "Memory is off. Nothing personal is being remembered.";
    const facts = [
      memory.preferredName && `name: ${memory.preferredName}`,
      memory.favoriteCharacters && `favorite characters: ${memory.favoriteCharacters}`,
      memory.booksRead && `books read: ${memory.booksRead}`,
      `spoilers: ${memory.spoilerPermission}`,
      `sarcasm: ${memory.sarcasmLevel}`,
      memory.favoriteJokes && `favorite jokes: ${memory.favoriteJokes}`,
      memory.loreQuestions && `recent lore: ${memory.loreQuestions}`
    ].filter(Boolean);
    return facts.length ? `I remember ${facts.join("; ")}.` : "Memory is on, but the ledger is still empty.";
  };

  const style = document.createElement("style");
  style.textContent = `
    #piphex-ai{position:fixed;right:12px;bottom:5px;z-index:9999;width:clamp(112px,12vw,158px);overflow:visible;color:#f8ead5;font:15px/1.35 Georgia,serif;filter:drop-shadow(0 14px 20px #000b)}
    #piphex-image{display:block;width:100%;height:auto;border-radius:18px;cursor:pointer;transform-origin:50% 100%;animation:piphex-breathe 4.8s ease-in-out infinite}
    #piphex-more{position:absolute;left:50%;top:-31px;transform:translateX(-50%);z-index:3;padding:6px 14px;border:1px solid #d6a85c;border-radius:999px;color:#fff4df;background:#2a170ff2;box-shadow:0 4px 14px #000a,0 0 10px #d6a85c44;font:700 12px Georgia,serif;cursor:pointer;white-space:nowrap}
    #piphex-panel{position:absolute;right:72%;bottom:16%;display:none;width:min(330px,calc(100vw - 32px));padding:13px;border:1px solid #8d6332;border-radius:16px;background:linear-gradient(160deg,#25120ff8,#120b0af8);box-shadow:0 18px 46px #000d,0 0 24px #8d381933}
    #piphex-ai.open #piphex-panel{display:block;animation:piphex-arrive .2s ease-out}
    #piphex-close{position:absolute;right:8px;top:7px;width:28px;height:28px;border:0;border-radius:50%;color:#f8ead5;background:#4b261f;cursor:pointer;font:700 18px/1 Arial}
    #piphex-answer{min-height:42px;padding:4px 34px 8px 2px;color:#fff4df}
    #piphex-status{font:700 11px/1.2 system-ui,sans-serif;color:#d6a85c;margin:0 0 8px}
    #piphex-controls,#piphex-memory-actions{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}
    #piphex-controls button,#piphex-memory-actions button,#piphex-hints button,#piphex-send{border:1px solid #7d542c;border-radius:999px;padding:6px 9px;color:#f8ead5;background:#331b16;cursor:pointer;font:700 11px Georgia,serif}
    #piphex-controls button[aria-pressed="true"]{background:#6e2e18;box-shadow:0 0 10px #d34b2877}
    #piphex-hints{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}
    #piphex-memory{border-top:1px solid #6b422b;margin-top:8px;padding-top:3px}
    #piphex-memory summary{cursor:pointer;color:#d6a85c;font-weight:700;font-size:12px}
    #piphex-form{display:flex;gap:6px;margin-top:9px}
    #piphex-question{min-width:0;flex:1;border:1px solid #8d6332;border-radius:9px;padding:9px;color:#fff;background:#090605;font:14px Georgia,serif}
    #piphex-send{border-radius:9px;background:#a86626;color:#160b07;padding-inline:12px}
    #piphex-orb{position:absolute;right:4px;bottom:8px;width:30px;height:30px;border:2px solid #f4d357;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#72f1ff 18%,#bc4cff 46%,#ff5a27 72%,#3a120b);box-shadow:0 0 14px #c65cff;cursor:pointer;animation:piphex-orb 1.8s ease-in-out infinite}
    #piphex-orb[aria-pressed="true"]{box-shadow:0 0 20px #63f2ff,0 0 32px #63f2ff;animation-duration:.75s}
    #piphex-ai.thinking #piphex-image{filter:drop-shadow(0 0 12px #d34b28);transform:translateY(-2px)}
    @keyframes piphex-breathe{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-3px) rotate(.35deg)}}
    @keyframes piphex-orb{50%{transform:scale(1.08)}}
    @keyframes piphex-arrive{from{opacity:0;transform:translateY(7px) scale(.98)}to{opacity:1;transform:none}}
    @media(max-width:650px){#piphex-ai{right:7px;width:112px}#piphex-panel{position:fixed;left:10px;right:10px;bottom:126px;width:auto;max-height:65vh;overflow:auto}}
    @media(prefers-reduced-motion:reduce){#piphex-image,#piphex-orb{animation:none!important}}
  `;
  document.head.append(style);

  const box = document.createElement("aside");
  box.id = "piphex-ai";
  box.innerHTML = `
    <div id="piphex-panel" role="dialog" aria-label="Talk with Piphex">
      <button id="piphex-close" type="button" aria-label="Close Piphex">×</button>
      <div id="piphex-answer" aria-live="polite"></div>
      <div id="piphex-status">Ready for questionable decisions.</div>
      <div id="piphex-controls">
        <button id="piphex-mic" type="button" aria-pressed="false">Mic Off</button>
        <button id="piphex-sound" type="button" aria-pressed="true">Sound On</button>
        <button id="piphex-memory-toggle" type="button" aria-pressed="false">Memory Off</button>
      </div>
      <div id="piphex-hints">
        <button type="button">Who are you?</button><button type="button">Show me the books</button><button type="button">Who lives here?</button>
      </div>
      <details id="piphex-memory">
        <summary>Memory controls</summary>
        <div id="piphex-memory-actions">
          <button id="piphex-memory-show" type="button">What you remember</button>
          <button id="piphex-memory-correct" type="button">Correct memory</button>
          <button id="piphex-memory-forget" type="button">Forget this</button>
          <button id="piphex-memory-clear" type="button">Forget everything</button>
        </div>
      </details>
      <form id="piphex-form"><input id="piphex-question" maxlength="800" autocomplete="off" placeholder="Ask Piphex..." aria-label="Question for Piphex"><button id="piphex-send" type="submit">Ask</button></form>
    </div>
    <button id="piphex-more" type="button" aria-expanded="false">More</button>
    <img id="piphex-image" src="${IMAGE}" alt="Piphex, the Gizmolife guide">
    <button id="piphex-orb" type="button" aria-label="Start or stop voice conversation" aria-pressed="false" title="Talk with Piphex"></button>`;
  document.body.append(box);

  const panel = box.querySelector("#piphex-panel");
  const answer = box.querySelector("#piphex-answer");
  const status = box.querySelector("#piphex-status");
  const more = box.querySelector("#piphex-more");
  const close = box.querySelector("#piphex-close");
  const image = box.querySelector("#piphex-image");
  const orb = box.querySelector("#piphex-orb");
  const mic = box.querySelector("#piphex-mic");
  const sound = box.querySelector("#piphex-sound");
  const memoryToggle = box.querySelector("#piphex-memory-toggle");
  const form = box.querySelector("#piphex-form");
  const input = box.querySelector("#piphex-question");
  const send = box.querySelector("#piphex-send");
  let history = [];
  let soundOn = true;
  let audio = null;
  let peer = null;
  let stream = null;
  let channel = null;
  let remoteAudio = null;
  let connecting = false;
  let realtimeText = "";

  const setAnswer = text => {
    answer.textContent = soundOn ? "Piphex is speaking…" : text;
  };
  const setStatus = text => { status.textContent = text; };
  const stopAudio = () => {
    if (audio) { audio.pause(); audio.src = ""; }
    if (remoteAudio) remoteAudio.muted = !soundOn;
  };
  const speak = async text => {
    if (!soundOn || !text || peer?.connectionState === "connected") return;
    stopAudio();
    try {
      const response = await fetch(`${API_BASE}speech`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!response.ok) throw new Error();
      audio = audio || new Audio();
      audio.src = URL.createObjectURL(await response.blob());
      audio.onended = () => setStatus("Ready. Try not to waste the opportunity.");
      await audio.play();
    } catch {
      answer.textContent = text;
      setStatus("Sound failed; text has reluctantly appeared.");
    }
  };
  const showReply = text => {
    setAnswer(text);
    setStatus(soundOn ? "Speaking" : "Ready for another question.");
    speak(text);
  };
  const updateMemoryButton = () => {
    memoryToggle.textContent = memory.enabled ? "Memory On" : "Memory Off";
    memoryToggle.setAttribute("aria-pressed", String(memory.enabled));
  };
  updateMemoryButton();

  const stopVoice = () => {
    channel?.close(); peer?.close(); stream?.getTracks().forEach(track => track.stop());
    channel = null; peer = null; stream = null; connecting = false;
    mic.textContent = "Mic Off"; mic.setAttribute("aria-pressed", "false");
    orb.setAttribute("aria-pressed", "false"); form.hidden = false;
    setStatus("Microphone off. Keyboard ready.");
  };
  const onRealtimeEvent = event => {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }
    if (data.type === "input_audio_buffer.speech_started") {
      stopAudio(); realtimeText = ""; setStatus("Listening…");
    }
    if (data.type === "response.output_audio_transcript.delta" || data.type === "response.output_text.delta") realtimeText += data.delta || "";
    if (data.type === "response.done") {
      const text = realtimeText.trim();
      if (!soundOn && text) answer.textContent = text;
      else answer.textContent = "Piphex is speaking…";
      realtimeText = ""; setStatus("Listening… interrupt whenever you like.");
    }
    if (data.type === "error") setStatus("Voice stumbled. Even infernal magic has paperwork.");
  };
  const startVoice = async () => {
    if (connecting || peer?.connectionState === "connected") return;
    if (!window.RTCPeerConnection || !navigator.mediaDevices?.getUserMedia) {
      setStatus("This browser does not support live voice."); return;
    }
    connecting = true; setStatus("Requesting microphone permission…");
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      peer = new RTCPeerConnection();
      stream.getAudioTracks().forEach(track => peer.addTrack(track, stream));
      remoteAudio = remoteAudio || new Audio(); remoteAudio.autoplay = true; remoteAudio.muted = !soundOn;
      peer.ontrack = event => { remoteAudio.srcObject = event.streams[0]; };
      channel = peer.createDataChannel("oai-events"); channel.onmessage = onRealtimeEvent;
      channel.onopen = () => {
        connecting = false; mic.textContent = "Mic On"; mic.setAttribute("aria-pressed", "true"); orb.setAttribute("aria-pressed", "true"); form.hidden = true;
        setStatus("Listening… interrupt whenever you like.");
        channel.send(JSON.stringify({ type: "response.create", response: { output_modalities: ["audio"], instructions: `Greet the visitor in one lively sentence. ${memory.enabled && memory.preferredName ? `Their preferred name is ${memory.preferredName}.` : ""}` } }));
      };
      peer.onconnectionstatechange = () => { if (["failed", "closed", "disconnected"].includes(peer?.connectionState)) stopVoice(); };
      const offer = await peer.createOffer(); await peer.setLocalDescription(offer);
      const response = await fetch(`${API_BASE}realtime`, { method: "POST", headers: { "Content-Type": "application/sdp" }, body: peer.localDescription?.sdp || offer.sdp });
      if (!response.ok) throw new Error();
      await peer.setRemoteDescription({ type: "answer", sdp: await response.text() });
    } catch {
      stopVoice(); setStatus("Microphone unavailable. The keyboard still works, tragically.");
    } finally { connecting = false; }
  };

  const openPanel = () => {
    box.classList.add("open"); more.setAttribute("aria-expanded", "true"); input.focus();
    const returning = localStorage.getItem(VISITED_KEY) === "yes";
    localStorage.setItem(VISITED_KEY, "yes");
    const name = memory.enabled && memory.preferredName ? `, ${memory.preferredName}` : "";
    const line = returning ? `Back again${name}. The books have been warned.` : OPENING;
    answer.textContent = line; speak(line);
  };
  const closePanel = () => { box.classList.remove("open"); more.setAttribute("aria-expanded", "false"); stopAudio(); };
  more.addEventListener("click", () => box.classList.contains("open") ? closePanel() : openPanel());
  image.addEventListener("click", openPanel); close.addEventListener("click", closePanel);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closePanel(); });
  mic.addEventListener("click", () => peer ? stopVoice() : startVoice());
  orb.addEventListener("click", () => peer ? stopVoice() : startVoice());
  sound.addEventListener("click", () => {
    soundOn = !soundOn; sound.textContent = soundOn ? "Sound On" : "Sound Off"; sound.setAttribute("aria-pressed", String(soundOn));
    if (!soundOn) stopAudio(); if (remoteAudio) remoteAudio.muted = !soundOn;
    setStatus(soundOn ? "Sound on." : "Sound off. Text answers enabled.");
  });
  memoryToggle.addEventListener("click", () => {
    memory.enabled = !memory.enabled;
    if (memory.enabled && !memory.visitorId) memory.visitorId = crypto.randomUUID?.() || `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    saveMemory(); updateMemoryButton(); answer.textContent = memory.enabled ? "Memory is on. I will remember only what you choose to tell me." : "Memory is off. Your private ledger is closed.";
  });
  box.querySelector("#piphex-memory-show").addEventListener("click", () => { answer.textContent = memorySummary(); });
  box.querySelector("#piphex-memory-clear").addEventListener("click", () => {
    if (!confirm("Forget everything Piphex remembers on this browser?")) return;
    memory = { ...EMPTY_MEMORY }; localStorage.removeItem(MEMORY_KEY); updateMemoryButton(); answer.textContent = "Everything is forgotten. An impressively clean ledger.";
  });
  box.querySelector("#piphex-memory-correct").addEventListener("click", () => {
    if (!memory.enabled) { answer.textContent = "Turn memory on first. Even I require consent."; return; }
    const name = prompt("Correct your preferred name or nickname:", memory.preferredName || "");
    if (name === null) return; memory.preferredName = safeList(name); saveMemory(); answer.textContent = "Corrected. The ledger has survived the embarrassment.";
  });
  box.querySelector("#piphex-memory-forget").addEventListener("click", () => {
    if (!memory.enabled) { answer.textContent = "Memory is already off."; return; }
    const choice = prompt("Forget which item? Type: name, characters, books, jokes, lore, or conversation.", "");
    const map = { name: "preferredName", characters: "favoriteCharacters", books: "booksRead", jokes: "favoriteJokes", lore: "loreQuestions", conversation: "unfinishedConversations" };
    const key = map[String(choice || "").toLowerCase().trim()];
    if (!key) return; memory[key] = ""; saveMemory(); answer.textContent = "Forgotten. I shall deny the ledger ever contained it.";
  });
  box.querySelectorAll("#piphex-hints button").forEach(button => button.addEventListener("click", () => { input.value = button.textContent; form.requestSubmit(); }));
  form.addEventListener("submit", async event => {
    event.preventDefault(); const message = input.value.trim(); if (!message) return;
    stopAudio(); rememberFrom(message); input.value = ""; send.disabled = true; box.classList.add("thinking"); answer.textContent = "Consulting the forbidden index…"; setStatus("Thinking");
    try {
      const response = await fetch(`${API_BASE}chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history, memory }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Piphex cannot answer right now.");
      const reply = String(data.reply || data.answer || "").replace(/\*\*/g, "").replace(/\s+([.,!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
      showReply(reply); history.push({ role: "user", content: message }, { role: "assistant", content: reply }); if (history.length > 12) history = history.slice(-12);
    } catch (error) {
      answer.textContent = error.message || "The library wards are flickering. Try again shortly."; setStatus("Connection trouble");
    } finally { send.disabled = false; box.classList.remove("thinking"); input.focus(); }
  });

  answer.textContent = memory.enabled && memory.preferredName ? `Welcome back, ${memory.preferredName}. The books remembered you. I considered objecting.` : "Piphex is nearby. Press More when your judgment fails.";
})();
