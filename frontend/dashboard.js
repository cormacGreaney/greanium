// Command history
let commandHistory = [];
let historyIndex = -1;

function runIntro() {
  const textEl = document.getElementById("intro-text");

  const msg = "Welcome, Cormac Greaney // Greanium OS v1.2 initializing...";
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

// Tab Navigation
function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      // Remove active class from all tabs
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab
      btn.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });
}

// Load Portfolio Data
async function loadPortfolio() {
  try {
    const portfolio = await fetchJSON('/portfolio/');
    
    // Load projects
    if (portfolio.projects) {
      renderProjects(portfolio.projects);
      window._projects = portfolio.projects;
    }
    
    // Load bio/about
    if (portfolio.bio) {
      renderAbout(portfolio.bio);
      renderSkills(portfolio.bio.skills || []);
      window._bio = portfolio.bio;
    }
    
    // Load portfolio overview
    renderPortfolioOverview(portfolio);
    
  } catch(e) {
    console.error(e);
    document.getElementById('projects-grid').innerHTML = '<p style="color:var(--muted)">Failed to load portfolio data.</p>';
  }
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const techTags = (project.tech || []).map(t => 
      `<span class="tech-tag">${t}</span>`
    ).join('');
    
    const links = [];
    if (project.url) links.push(`<a href="${project.url}" target="_blank">🌐 Live</a>`);
    if (project.github) links.push(`<a href="${project.github}" target="_blank">💻 Code</a>`);
    
    card.innerHTML = `
      <h3>${project.name}</h3>
      <div class="project-description">${project.description || ''}</div>
      <div class="project-tech">${techTags}</div>
      ${links.length > 0 ? `<div class="project-links">${links.join('')}</div>` : ''}
    `;
    
    grid.appendChild(card);
  });
}

function renderAbout(bio) {
  const aboutContent = document.getElementById('about-content');
  if (!aboutContent) return;
  
  aboutContent.innerHTML = `
    <div class="bio-section">
      <h3>About</h3>
      <p>${bio.about || 'No description available.'}</p>
    </div>
    
    ${bio.location ? `
    <div class="bio-section">
      <h3>Location</h3>
      <p>${bio.location}</p>
    </div>
    ` : ''}
    
    ${bio.experience && bio.experience.length > 0 ? `
    <div class="bio-section">
      <h3>Experience</h3>
      ${bio.experience.map(exp => `
        <p><strong>${exp.title}</strong> at ${exp.company}<br>
        <span style="color:var(--muted);font-size:11px">${exp.period}</span><br>
        ${exp.description || ''}</p>
      `).join('')}
    </div>
    ` : ''}
    
    ${bio.education && bio.education.length > 0 ? `
    <div class="bio-section">
      <h3>Education</h3>
      ${bio.education.map(edu => `
        <p><strong>${edu.degree}</strong><br>
        ${edu.institution}<br>
        <span style="color:var(--muted);font-size:11px">${edu.period}</span></p>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="bio-section">
      <h3>Contact</h3>
      <div class="contact-info">
        ${bio.email ? `<a href="mailto:${bio.email}">📧 ${bio.email}</a>` : ''}
        <a href="https://www.linkedin.com/in/cormac-greaney-46277425a/" target="_blank">💼 LinkedIn</a>
        <a href="https://github.com/cormacGreaney" target="_blank">💻 GitHub</a>
      </div>
    </div>
  `;
}

function renderSkills(skills) {
  const skillsContent = document.getElementById('skills-content');
  if (!skillsContent) return;
  
  // Group skills by category
  const byCategory = {};
  skills.forEach(skill => {
    const cat = skill.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(skill.name);
  });
  
  skillsContent.innerHTML = Object.keys(byCategory).map(category => `
    <div class="skill-category">
      <h3>${category}</h3>
      <div class="skill-tags">
        ${byCategory[category].map(skillName => `
          <span class="skill-tag">${skillName}</span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderPortfolioOverview(portfolio) {
  const overview = document.getElementById('portfolio-overview');
  if (!overview) return;
  
  const bio = portfolio.bio || {};
  const projectCount = (portfolio.projects || []).length;
  const featuredCount = (portfolio.projects || []).filter(p => p.featured).length;
  
  overview.innerHTML = `
    <div style="line-height:1.8">
      <p><strong style="color:var(--accent)">${bio.name || 'Cormac Greaney'}</strong></p>
      <p style="color:var(--muted)">${bio.tagline || 'Developer & Creator'}</p>
      <p style="margin-top:16px;font-size:13px">${bio.about || 'Personal portfolio and operating system.'}</p>
      
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--glass)">
        <div style="display:flex;gap:24px;font-size:12px;color:var(--muted)">
          <div><strong style="color:var(--accent)">${projectCount}</strong> Projects</div>
          <div><strong style="color:var(--accent)">${featuredCount}</strong> Featured</div>
          <div><strong style="color:var(--accent)">${(bio.skills || []).length}</strong> Skills</div>
        </div>
      </div>
      
      <div style="margin-top:16px">
        <p style="font-size:12px;color:var(--muted)">Type <code>projects</code> in the terminal to view all projects, or use the tabs above to navigate.</p>
      </div>
    </div>
  `;
}

async function init(){
  // Initialize tabs
  initTabs();
  
  // Load links
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
    const listEl = document.getElementById('links-list');
    if (listEl) listEl.innerText = 'Failed to load links';
  }

  // Load files
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
    const filesEl = document.getElementById('files-list');
    if (filesEl) filesEl.innerText = 'Failed to load files';
  }
  
  // Load portfolio
  await loadPortfolio();

  // Initialize terminal
  initTerminal();
  
  // Add welcome message
  setTimeout(() => {
    addOutput("Greanium OS v1.2 ready. Type 'help' for available commands.");
  }, 500);
}

function initTerminal() {
  const cmdInput = document.getElementById('cmd');
  const runBtn = document.getElementById('runcmd');
  
  if (!cmdInput || !runBtn) return;
  
  // Command execution
  runBtn.addEventListener('click', () => {
    const val = cmdInput.value.trim();
    if (val) {
      commandHistory.push(val);
      historyIndex = commandHistory.length;
      runCmd(val);
      cmdInput.value = '';
    }
  });
  
  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = cmdInput.value.trim();
      if (val) {
        commandHistory.push(val);
        historyIndex = commandHistory.length;
        runCmd(val);
        cmdInput.value = '';
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        cmdInput.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        cmdInput.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        cmdInput.value = '';
      }
    }
  });
}

async function runCmd(cmd){
  if(!cmd) return;
  const parts = cmd.split(/\s+/);
  const cmdName = parts[0].toLowerCase();
  
  addOutput("> " + cmd);

  // Help command
  if(cmdName === "help" || cmdName === "?"){
    addOutput(`Available commands:
  help, ?              - Show this help message
  clear, cls           - Clear terminal
  open <name>          - Open a link by name
  projects             - List all projects
  skills               - Show skills overview
  about                - Show about information
  portfolio            - Show portfolio overview
  version, ver         - Show system version
  ai <question>        - Chat with Greanium AI
  tab <name>           - Switch to tab (dashboard/portfolio/projects/about)`);
    return;
  }

  // Clear command
  if(cmdName === "clear" || cmdName === "cls"){
    const output = document.getElementById("terminal-output");
    if (output) output.innerHTML = '';
    return;
  }

  // Version command
  if(cmdName === "version" || cmdName === "ver"){
    addOutput("Greanium OS v1.2");
    addOutput("Created by Cormac Greaney © 2025");
    return;
  }

  // Tab switching
  if(cmdName === "tab" && parts[1]){
    const tabName = parts[1].toLowerCase();
    const validTabs = ['dashboard', 'portfolio', 'projects', 'about'];
    if (validTabs.includes(tabName)) {
      const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
      if (tabBtn) tabBtn.click();
      addOutput(`Switched to ${tabName} tab.`);
    } else {
      addOutput(`Invalid tab. Available: ${validTabs.join(', ')}`);
    }
    return;
  }

  // Projects command
  if(cmdName === "projects"){
    if (window._projects && window._projects.length > 0) {
      addOutput(`Found ${window._projects.length} project(s):`);
      window._projects.forEach((p, i) => {
        addOutput(`  ${i+1}. ${p.name} - ${p.description || 'No description'}`);
        if (p.url) addOutput(`     URL: ${p.url}`);
      });
    } else {
      addOutput("No projects available.");
    }
    return;
  }

  // Skills command
  if(cmdName === "skills"){
    if (window._bio && window._bio.skills) {
      // Group by category
      const byCategory = {};
      window._bio.skills.forEach(skill => {
        const cat = skill.category || 'Other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(skill.name);
      });
      
      Object.keys(byCategory).forEach(category => {
        addOutput(`${category}:`);
        addOutput(`  ${byCategory[category].join(', ')}`);
      });
    } else {
      addOutput("Skills data not available.");
    }
    return;
  }

  // About command
  if(cmdName === "about"){
    if (window._bio) {
      addOutput(`Name: ${window._bio.name || 'Cormac Greaney'}`);
      addOutput(`Tagline: ${window._bio.tagline || 'Developer & Creator'}`);
      addOutput(`Location: ${window._bio.location || 'Not specified'}`);
      addOutput(`About: ${window._bio.about || 'No description available.'}`);
    } else {
      addOutput("About information not available.");
    }
    return;
  }

  // Portfolio command
  if(cmdName === "portfolio"){
    const tabBtn = document.querySelector(`[data-tab="portfolio"]`);
    if (tabBtn) tabBtn.click();
    addOutput("Opening portfolio overview...");
    return;
  }

  // AI command
  if(cmdName === "ai"){
    const query = parts.slice(1).join(" ");
    if(!query){
      addOutput("Usage: ai <your question>");
      return;
    }

    try {
      addOutput("Thinking...");
      const res = await fetch("/ai", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({prompt: query})
      });
      const data = await res.json();
      if(data.reply){
        // Split long replies into multiple lines
        const lines = data.reply.split('\n');
        lines.forEach(line => addOutput(line || ' '));
      } else {
        addOutput("AI error: " + (data.error || "Unknown error"));
      }
    } catch(err){
      addOutput("AI connection error: " + err.message);
    }
    return;
  }

  // Open command
  if(cmdName === 'open' && parts[1]){
    const name = slug(parts.slice(1).join(' '));
    if(window._linkMap && window._linkMap.has(name)){
      window.open(window._linkMap.get(name).url, '_blank');
      addOutput("Opened link: " + parts.slice(1).join(' '));
      return;
    }
    addOutput("No link matched: " + parts.slice(1).join(' '));
    return;
  }

  // Unknown command
  addOutput(`Unknown command: ${cmdName}. Type 'help' for available commands.`);
}

function addOutput(text){
  const out = document.createElement("div");
  out.textContent = text;
  const terminalOutput = document.getElementById("terminal-output");
  if (terminalOutput) {
    terminalOutput.appendChild(out);
    out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
