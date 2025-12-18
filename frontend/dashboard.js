// Command history
let commandHistory = [];
let historyIndex = -1;

function runIntro() {
  const textEl = document.getElementById("intro-text");

  const msg = "Welcome, Cormac Greaney // Greanium OS v2.0 initializing...";
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

let allProjects = [];
let filteredProjects = [];

function renderProjects(projects, filterTech = '', searchTerm = '') {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  
  allProjects = projects;
  
  // Filter projects
  filteredProjects = projects.filter(project => {
    const matchesTech = !filterTech || (project.tech || []).some(t => 
      t.toLowerCase().includes(filterTech.toLowerCase())
    );
    const matchesSearch = !searchTerm || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.tech || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesTech && matchesSearch;
  });
  
  grid.innerHTML = '';
  
  if (filteredProjects.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;padding:40px">No projects found matching your criteria.</p>';
    return;
  }
  
  filteredProjects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.cursor = 'pointer';
    
    const techTags = (project.tech || []).map(t => 
      `<span class="tech-tag">${t}</span>`
    ).join('');
    
    const links = [];
    if (project.url) links.push(`<a href="${project.url}" target="_blank" onclick="event.stopPropagation()">🌐 Live</a>`);
    if (project.github) links.push(`<a href="${project.github}" target="_blank" onclick="event.stopPropagation()">💻 Code</a>`);
    
    card.innerHTML = `
      <h3>${project.name}</h3>
      <div class="project-description">${project.description || ''}</div>
      <div class="project-tech">${techTags}</div>
      ${links.length > 0 ? `<div class="project-links">${links.join('')}</div>` : ''}
    `;
    
    card.addEventListener('click', () => showProjectDetail(project));
    
    grid.appendChild(card);
  });
  
  // Update filter dropdown with unique tech
  updateTechFilter(projects);
}

function updateTechFilter(projects) {
  const filterSelect = document.getElementById('project-filter');
  if (!filterSelect) return;
  
  const allTech = new Set();
  projects.forEach(p => {
    (p.tech || []).forEach(t => allTech.add(t));
  });
  
  // Clear existing options (except "All Technologies")
  while (filterSelect.children.length > 1) {
    filterSelect.removeChild(filterSelect.lastChild);
  }
  
  Array.from(allTech).sort().forEach(tech => {
    const option = document.createElement('option');
    option.value = tech;
    option.textContent = tech;
    filterSelect.appendChild(option);
  });
}

function showProjectDetail(project) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'project-modal';
  modal.innerHTML = `
    <div class="project-modal-content">
      <div class="project-modal-header">
        <h2>${project.name}</h2>
        <button class="project-modal-close" onclick="this.closest('.project-modal').remove()">×</button>
      </div>
      <div class="project-modal-body">
        <div class="project-modal-description">
          <h3>Description</h3>
          <p>${project.description || 'No description available.'}</p>
        </div>
        ${project.tech && project.tech.length > 0 ? `
        <div class="project-modal-tech">
          <h3>Technologies</h3>
          <div class="project-tech">${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}</div>
        </div>
        ` : ''}
        ${(project.url || project.github) ? `
        <div class="project-modal-links">
          <h3>Links</h3>
          <div class="project-links">
            ${project.url ? `<a href="${project.url}" target="_blank">🌐 View Live Demo</a>` : ''}
            ${project.github ? `<a href="${project.github}" target="_blank">💻 View on GitHub</a>` : ''}
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Close on ESC key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
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
        <a href="tel:+353838325683">📱 +353 83 832 5683</a>
        <a href="https://www.linkedin.com/in/cormac-greaney-46277425a/" target="_blank">💼 LinkedIn</a>
        <a href="https://github.com/cormacGreaney" target="_blank">💻 GitHub</a>
        <a href="https://instagram.com/cormacgreaney18" target="_blank">📷 Instagram</a>
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
  const skillCount = (bio.skills || []).length;
  
  overview.innerHTML = `
    <div class="portfolio-overview-content">
      <div class="bio-header">
        <h3 style="color:var(--accent);font-size:24px;margin:0 0 8px 0;text-shadow:0 0 10px rgba(55,255,90,0.3)">${bio.name || 'Cormac Greaney'}</h3>
        <p style="color:var(--muted);font-size:16px;margin:0 0 24px 0">${bio.tagline || 'Developer & Creator'}</p>
      </div>
      
      <div class="bio-about" style="margin-bottom:32px;padding:20px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid var(--glass)">
        <p style="font-size:14px;line-height:1.8;margin:0;color:var(--muted)">${bio.about || 'Personal portfolio and operating system.'}</p>
      </div>
      
      <div class="stats-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px">
        <div style="padding:20px;background:rgba(55,255,90,0.05);border-radius:8px;border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;font-weight:700;color:var(--accent);margin-bottom:8px;text-shadow:0 0 10px rgba(55,255,90,0.3)">${projectCount}</div>
          <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Projects</div>
        </div>
        <div style="padding:20px;background:rgba(55,255,90,0.05);border-radius:8px;border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;font-weight:700;color:var(--accent);margin-bottom:8px;text-shadow:0 0 10px rgba(55,255,90,0.3)">${featuredCount}</div>
          <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Featured</div>
        </div>
        <div style="padding:20px;background:rgba(55,255,90,0.05);border-radius:8px;border:1px solid var(--border);text-align:center">
          <div style="font-size:32px;font-weight:700;color:var(--accent);margin-bottom:8px;text-shadow:0 0 10px rgba(55,255,90,0.3)">${skillCount}</div>
          <div style="font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Skills</div>
        </div>
      </div>
      
      <div style="padding:16px;background:rgba(0,0,0,0.2);border-radius:8px;border:1px solid var(--glass)">
        <p style="font-size:13px;color:var(--muted);margin:0;line-height:1.8">
          Type <code style="background:rgba(55,255,90,0.1);padding:2px 6px;border-radius:3px;color:var(--accent);font-size:12px;border:1px solid var(--border)">projects</code> in the terminal to view all projects, or use the tabs above to navigate.
        </p>
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
  
  // Load GitHub stats
  await loadGitHubStats();
  
  // Initialize project filters
  initProjectFilters();
  
  // Initialize contact form
  initContactForm();
  
  // Instagram link is now always shown in renderAbout()

  // Initialize terminal
  initTerminal();
  
  // Add welcome message
  setTimeout(() => {
    addOutput("Greanium OS v2.0 ready. Type 'help' for available commands.");
  }, 500);
}

async function loadGitHubStats() {
  const githubContent = document.getElementById('github-content');
  if (!githubContent) return;
  
  try {
    const data = await fetchJSON('/github/stats');
    
    githubContent.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:16px;margin-bottom:24px">
        <div style="padding:16px;background:rgba(55,255,90,0.05);border-radius:8px;border:1px solid var(--border);text-align:center">
          <div style="font-size:24px;font-weight:700;color:var(--accent);margin-bottom:4px">${data.stats.repositories}</div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase">Repos</div>
        </div>
        <div style="padding:16px;background:rgba(55,255,90,0.05);border-radius:8px;border:1px solid var(--border);text-align:center">
          <div style="font-size:24px;font-weight:700;color:var(--accent);margin-bottom:4px">${data.stats.stars}</div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase">Stars</div>
        </div>
        <div style="padding:16px;background:rgba(55,255,90,0.05);border-radius:8px;border:1px solid var(--border);text-align:center">
          <div style="font-size:24px;font-weight:700;color:var(--accent);margin-bottom:4px">${data.stats.followers}</div>
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase">Followers</div>
        </div>
      </div>
      
      ${data.top_languages && data.top_languages.length > 0 ? `
      <div style="margin-bottom:24px">
        <h3 style="color:var(--accent);font-size:14px;margin-bottom:12px">Top Languages</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${data.top_languages.map(lang => `<span class="skill-tag">${lang}</span>`).join('')}
        </div>
      </div>
      ` : ''}
      
      ${data.recent_repos && data.recent_repos.length > 0 ? `
      <div>
        <h3 style="color:var(--accent);font-size:14px;margin-bottom:12px">Recent Repositories</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          ${data.recent_repos.map(repo => `
            <div style="padding:12px;background:rgba(255,255,255,0.02);border:1px solid var(--glass);border-radius:6px">
              <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px">
                <a href="${repo.url}" target="_blank" style="color:var(--accent);font-weight:600;font-size:13px">${repo.name}</a>
                <span style="font-size:11px;color:var(--muted)">⭐ ${repo.stars}</span>
              </div>
              ${repo.description ? `<p style="font-size:12px;color:var(--muted);margin:0">${repo.description}</p>` : ''}
              ${repo.language ? `<span class="skill-tag" style="margin-top:8px;display:inline-block">${repo.language}</span>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="margin-top:16px;text-align:center">
          <a href="${data.profile_url}" target="_blank" style="color:var(--accent);font-size:13px">View All Repositories →</a>
        </div>
      </div>
      ` : ''}
    `;
  } catch(e) {
    console.error(e);
    githubContent.innerHTML = '<p style="color:var(--muted)">GitHub data unavailable. Check configuration.</p>';
  }
}

function initProjectFilters() {
  const searchInput = document.getElementById('project-search');
  const filterSelect = document.getElementById('project-filter');
  
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const filterTech = filterSelect ? filterSelect.value : '';
        renderProjects(allProjects, filterTech, e.target.value);
      }, 300);
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      const searchTerm = searchInput ? searchInput.value : '';
      renderProjects(allProjects, e.target.value, searchTerm);
    });
  }
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const messageDiv = document.getElementById('contact-message');
  
  if (!form || !messageDiv) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: form.querySelector('[name="name"]').value,
      email: form.querySelector('[name="email"]').value,
      message: form.querySelector('[name="message"]').value
    };
    
        messageDiv.style.display = 'block';
        messageDiv.textContent = 'Sending...';
        messageDiv.style.color = 'var(--muted)';
        messageDiv.style.background = 'rgba(0,0,0,0.3)';
        messageDiv.style.border = '1px solid var(--glass)';
    
    try {
      const res = await fetch('/contact/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        messageDiv.textContent = data.message || 'Message sent successfully!';
        messageDiv.style.color = 'var(--accent)';
        messageDiv.style.background = 'rgba(55,255,90,0.1)';
        messageDiv.style.border = '1px solid var(--border)';
        form.reset();
        
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 5000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch(err) {
      messageDiv.textContent = err.message || 'Failed to send message. Please try again.';
      messageDiv.style.color = '#ff6b6b';
      messageDiv.style.background = 'rgba(255,107,107,0.1)';
      messageDiv.style.border = '1px solid rgba(255,107,107,0.3)';
    }
  });
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
    addOutput("Available Commands:");
    addOutput("");
    addOutput("help              Shows this help message");
    addOutput("clear, cls        Clears the terminal");
    addOutput("open <name>       Opens a link by name");
    addOutput("projects          Lists all projects");
    addOutput("skills            Displays skills overview");
    addOutput("about             Shows bio information");
    addOutput("portfolio         Opens portfolio overview");
    addOutput("version, ver      Shows system version");
    addOutput("ai <question>     Chat with Greanium AI");
    addOutput("tab <name>        Switches to specified tab");
    addOutput("resume, cv        Downloads CV/Resume");
    addOutput("contact           Opens contact form");
    addOutput("github            Shows GitHub statistics");
    addOutput("");
    addOutput("Use arrow keys (↑/↓) for command history.");
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
    addOutput("Greanium OS v2.0");
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

  // Resume/CV command
  if(cmdName === "resume" || cmdName === "cv"){
    addOutput("Downloading CV/Resume...");
    window.location.href = "/files/download/CV_Cormac_Greaney.md";
    return;
  }

  // Contact command
  if(cmdName === "contact"){
    const tabBtn = document.querySelector(`[data-tab="about"]`);
    if (tabBtn) tabBtn.click();
    setTimeout(() => {
      const contactForm = document.getElementById('contact-form');
      if (contactForm) contactForm.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    addOutput("Opening contact form...");
    return;
  }

  // GitHub command
  if(cmdName === "github"){
    const tabBtn = document.querySelector(`[data-tab="about"]`);
    if (tabBtn) tabBtn.click();
    setTimeout(() => {
      const githubContent = document.getElementById('github-content');
      if (githubContent) githubContent.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    addOutput("Showing GitHub stats...");
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
