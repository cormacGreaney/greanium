function runIntro() {
  const textEl = document.getElementById("intro-text");

  const msg = "Welcome, Cormac Greaney // Greanium OS v1.1 initializing...";
  let i = 0;

  function typeWriter() {
    if (i < msg.length) {
      textEl.textContent += msg.charAt(i);
      i++;
      setTimeout(typeWriter, 50);
    } else {
      setTimeout(() => {
        document.getElementById("intro").classList.add("fade-out");
        setTimeout(() => {
          document.getElementById("intro").remove();
          document.getElementById("app").style.display = "block";
          init();
        }, 1000);
      }, 1000);
    }
  }

  typeWriter();
}


// Kick off intro when page loads
window.addEventListener("load", runIntro);

// --- Dashboard logic ---
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} load failed`);
  return res.json();
}

function slug(s){ return s.toLowerCase().replace(/\s+/g,'-') }

async function init(){
  // load links
  try{
    const links = await fetchJSON('/links/');
    const list = document.getElementById('links-list');
    list.innerHTML = '';
    const items = Array.isArray(links) ? links : (links.items || []);
    items.forEach(l=>{
      const li = document.createElement('li');
      li.innerHTML = `<a href="${l.url}" target="_blank" data-name="${l.name}">${l.name}</a>`;
      list.appendChild(li);
    });
    window._linkMap = new Map(items.map(i=>[slug(i.name), i]));
  }catch(e){
    console.error(e);
    document.getElementById('links-list').innerText = 'Failed to load links';
  }

  // load files
  try{
    const files = await fetchJSON('/files/');
    const fl = document.getElementById('files-list');
    fl.innerHTML = '';
    (files.files || []).forEach(f=>{
      const li = document.createElement('li');
      li.innerHTML = `<span>${f}</span><a class="badge" href="/files/download/${encodeURIComponent(f)}">dl</a>`;
      fl.appendChild(li);
    });
  }catch(e){
    console.error(e);
    document.getElementById('files-list').innerText = 'Failed to load files';
  }

  // command bar
  document.getElementById('runcmd').addEventListener('click', ()=>{
    const val = document.getElementById('cmd').value.trim();
    runCmd(val);
  });
  document.getElementById('cmd').addEventListener('keydown', (e)=>{
    if (e.key === 'Enter') runCmd(e.target.value.trim());
  });
}

async function runCmd(cmd){
  if(!cmd) return;
  const parts = cmd.split(/\s+/);

  // AI command
  if(parts[0].toLowerCase() === "ai"){
    const query = parts.slice(1).join(" ");
    if(!query){
      addOutput("Usage: ai <your question>");
      return;
    }

    addOutput("> " + cmd); // show what the user typed

    try {
      const res = await fetch("/Greanium", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({prompt: query})
      });
      const data = await res.json();
      if(data.reply){
        addOutput("Greanium AI: " + data.reply);
      } else {
        addOutput("AI error: " + (data.error || "Unknown error"));
      }
    } catch(err){
      addOutput("AI connection error: " + err.message);
    }
    return;
  }

  // Existing 'open' command
  if(parts[0].toLowerCase() === 'open' && parts[1]){
    const name = slug(parts.slice(1).join(' '));
    if(window._linkMap && window._linkMap.has(name)){
      addOutput("> " + cmd);
      window.open(window._linkMap.get(name).url, '_blank');
      addOutput("Opened link: " + parts.slice(1).join(' '));
      return;
    }
    addOutput("No link matched: " + parts.slice(1).join(' '));
    return;
  }

  // Unknown command
  addOutput("Unknown command: " + cmd);
}

function addOutput(text){
  const out = document.createElement("div");
  out.textContent = text;
  document.getElementById("terminal-output").appendChild(out);
  out.scrollIntoView();
}

