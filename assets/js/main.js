document.querySelector('#copyright-year').textContent = new Date().getFullYear();

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const homeLink = document.querySelector('.logo');
const sectionLinks = [...document.querySelectorAll('.nav-links a')];
const sections = sectionLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

homeLink.addEventListener('click', event => {
  event.preventDefault();
  window.history.replaceState(null, '', window.location.pathname);
  window.scrollTo({top:0, behavior:'smooth'});
});

sectionLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

document.addEventListener('keydown', event => {
  const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);

  if (event.key === 'Escape') {
    if (navLinks.classList.contains('is-open')) {
      navLinks.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
    if (skillSearch?.value) {
      skillSearch.value = '';
      updateSkillSearch();
    }
    return;
  }

  if (isTyping) return;

  if (event.key === '/') {
    event.preventDefault();
    skillSearch?.scrollIntoView({behavior:'smooth', block:'center'});
    skillSearch?.focus({preventScroll:true});
  }

  if (event.key.toLowerCase() === 't') {
    themeToggle?.click();
  }
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.15});

document.querySelectorAll('section:not(.hero) > .container').forEach(container => {
  revealObserver.observe(container);
});

const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, {rootMargin:'-35% 0px -55%'});

sections.forEach(section => activeObserver.observe(section));

const progressBar = document.querySelector('.scroll-progress');
const updateScrollProgress = () => {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0})`;
};

window.addEventListener('scroll', updateScrollProgress, {passive:true});
updateScrollProgress();

const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-number').forEach(stat => {
      const experienceStart = stat.dataset.experienceStart ? new Date(`${stat.dataset.experienceStart}T00:00:00`) : null;
      const now = new Date();
      const target = experienceStart
        ? now.getFullYear() - experienceStart.getFullYear() - (now < new Date(now.getFullYear(), experienceStart.getMonth(), experienceStart.getDate()) ? 1 : 0)
        : Number(stat.dataset.count);
      const suffix = stat.dataset.suffix || '';
      const start = performance.now();
      const duration = 900;
      const update = now => {
        const progress = Math.min((now - start) / duration, 1);
        stat.textContent = `${Math.round(target * progress)}${suffix}`;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    });
    statObserver.unobserve(entry.target);
  });
}, {threshold:0.5});

statObserver.observe(document.querySelector('.stats'));

document.querySelectorAll('.role-header').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const role = toggle.closest('.role');
    const isCollapsed = role.classList.toggle('is-collapsed');
    toggle.setAttribute('aria-expanded', String(!isCollapsed));
    toggle.querySelector('.role-disclosure-label').textContent = isCollapsed ? 'Show details' : 'Hide details';
  });
});

const skillFilters = [...document.querySelectorAll('.skill-filter')];
const skillCards = [...document.querySelectorAll('.skill-card')];
const skillSearch = document.querySelector('#skill-search');
const skillSearchStatus = document.querySelector('#skill-search-status');
const experienceEntries = [...document.querySelectorAll('#experience .role, #experience .company-summary')];
let selectedSkillFilter = 'all';

const highlightText = (element, query) => {
  element.querySelectorAll('mark').forEach(mark => mark.replaceWith(mark.textContent));
  if (!query) return;

  const pattern = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const textNodes = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let textNode;

  while (textNode = walker.nextNode()) textNodes.push(textNode);

  textNodes.forEach(node => {
    const fragments = node.textContent.split(pattern);
    if (fragments.length === 1) return;

    const replacement = document.createDocumentFragment();
    fragments.forEach((fragment, index) => {
      replacement.append(index % 2 ? Object.assign(document.createElement('mark'), {textContent:fragment}) : document.createTextNode(fragment));
    });
    node.replaceWith(replacement);
  });
};

const updateSkillSearch = () => {
  const query = skillSearch.value.trim();
  const normalizedQuery = query.toLowerCase();
  let visibleSkills = 0;
  let relatedExperience = 0;

  skillCards.forEach(card => {
    const matchesFilter = selectedSkillFilter === 'all' || card.dataset.category === selectedSkillFilter;
    const matchesSearch = !normalizedQuery || card.textContent.toLowerCase().includes(normalizedQuery);
    card.classList.toggle('is-filtered-out', !matchesFilter || !matchesSearch);
    highlightText(card, query);
    card.querySelectorAll('li').forEach(item => {
      item.classList.toggle('is-search-match', Boolean(normalizedQuery) && item.textContent.toLowerCase().includes(normalizedQuery));
    });
    if (matchesFilter && matchesSearch) visibleSkills += 1;
  });

  experienceEntries.forEach(entry => {
    const matches = normalizedQuery && entry.textContent.toLowerCase().includes(normalizedQuery);
    entry.classList.toggle('experience-search-match', Boolean(matches));
    if (matches) relatedExperience += 1;
  });

  skillSearchStatus.textContent = query
    ? `${visibleSkills} skill area${visibleSkills === 1 ? '' : 's'} and ${relatedExperience} related experience entr${relatedExperience === 1 ? 'y' : 'ies'} found.`
    : '';

  initializeSkillDetails();
};

skillFilters.forEach(filter => {
  filter.addEventListener('click', () => {
    selectedSkillFilter = filter.dataset.filter;
    skillFilters.forEach(button => button.setAttribute('aria-pressed', String(button === filter)));
    updateSkillSearch();
  });
});

skillSearch.addEventListener('input', updateSkillSearch);

const skillDescriptions = {
  'Robot Framework':'Keyword-driven test automation framework.',
  'Python':'Scripting language for reusable automation utilities.',
  'Selenium':'Browser automation for web UI testing.',
  'Cypress':'End-to-end testing for modern web applications.',
  'Appium':'Mobile application automation across platforms.',
  'GitHub Copilot':'AI assistant for coding and test development.',
  'Microsoft Copilot':'AI assistance for analysis and productivity.',
  'LLM Test Generation':'AI-generated test ideas and scenarios.',
  'LLM-based Robot Framework and Python automation generation':'LLM support for generating automation assets.',
  'AI Test Analysis':'AI-assisted interpretation of test outcomes.',
  'AI-assisted requirements analysis':'AI support for clarifying testable requirements.',
  'AI Defect Analysis':'AI-assisted defect triage and pattern analysis.',
  'Visual Testing':'Validation of visual UI changes and regressions.',
  'Jenkins':'CI server for automated build and test pipelines.',
  'Docker':'Containerized environments for consistent execution.',
  'Git':'Distributed version control for source code.',
  'GitHub':'Repository collaboration and code review platform.',
  'SourceTree':'Graphical client for Git repository workflows.',
  'Bitbucket':'Git repository hosting and team collaboration.',
  'API Testing':'Validation of service behavior and integrations.',
  'Postman and REST APIs':'API request testing and REST service validation.',
  'Performance Testing':'Measures responsiveness, scalability, and stability.',
  'Functional Testing':'Checks software behavior against requirements.',
  'Regression Testing':'Confirms changes do not break existing behavior.',
  'Smoke, load and memory-leak testing':'Early health, capacity, and stability checks.',
  'KPI/stability and alpha/beta testing':'Measures product quality through release stages.',
  'User Acceptance Testing (UAT)':'Validates readiness with business users.',
  'Test design, test creation and automation architecture':'Designs maintainable, high-signal test coverage.',
  'Test management, bug tracking, continuous integration and code-quality control':'Coordinates quality work from planning through delivery.',
  'Jira':'Issue tracking and Agile project management.',
  'Bugzilla':'Defect tracking and issue reporting.',
  'Jama':'Requirements, traceability, and quality management.',
  'Confluence':'Team documentation and knowledge sharing.',
  'TestRail':'Test case management and execution reporting.',
  'PractiTest':'Test management and quality analytics.',
  'Zephyr':'Test planning, execution, and reporting.',
  'Kanban':'Visual workflow management with work-in-progress limits.',
  'Pylint':'Static analysis and code-quality checks for Python.',
  'Robocop':'Quality checks and linting for Robot Framework.',
  'Robotidy':'Formatting and standardization for Robot Framework.',
  'Windows':'Desktop operating system test environment.',
  'Linux (Debian)':'Linux-based automation and test environment.',
  'Android':'Mobile operating system testing platform.',
  'iOS':'Apple mobile operating system testing platform.',
  'POS':'Point-of-sale device and payment workflow testing.',
  'WebOS':'Smart TV and embedded application platform.',
  'TV':'Connected-TV and media-device testing environment.',
  'Agile':'Iterative delivery with continuous feedback.',
  'Waterfall':'Sequential delivery model for planned projects.',
  'Scrum':'Sprint-based Agile delivery framework.',
  'SAFe':'Scaled Agile framework for enterprise delivery.',
  'Cura':'3D-print slicing and print-preparation software.',
  'SketchUp':'3D modeling and design software.',
  'OpenBuilds':'CNC machine control and build ecosystem.',
  'Universal Gcode Sender':'Cross-platform CNC G-code sender.'
};

const initializeSkillDetails = () => {
  document.querySelectorAll('.skill-card li').forEach(item => {
    const skillName = item.textContent.trim();
    const category = item.closest('.skill-card').querySelector('h3').textContent;
    item.dataset.description = skillDescriptions[skillName] || `${category} capability used in quality engineering delivery.`;
    item.tabIndex = 0;
  });
};

document.querySelector('.skills-grid').addEventListener('click', event => {
  const item = event.target.closest('li[data-description]');
  if (item) item.classList.toggle('is-detail-open');
});

const clientCards = [...document.querySelectorAll('.client-card')];
const toggleClientDomain = card => {
  const shouldOpen = !card.classList.contains('is-domain-open');
  clientCards.forEach(item => item.classList.remove('is-domain-open'));
  card.classList.toggle('is-domain-open', shouldOpen);
};

clientCards.forEach(card => {
  card.addEventListener('click', () => toggleClientDomain(card));
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleClientDomain(card);
  });
});

const leadershipCards = [...document.querySelectorAll('.leadership-card')];
const toggleLeadershipDescription = card => {
  const shouldOpen = !card.classList.contains('is-description-open');
  leadershipCards.forEach(item => item.classList.remove('is-description-open'));
  card.classList.toggle('is-description-open', shouldOpen);
};

leadershipCards.forEach(card => {
  card.addEventListener('click', () => toggleLeadershipDescription(card));
  card.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleLeadershipDescription(card);
  });
});

initializeSkillDetails();

const themeToggle = document.querySelector('.theme-toggle');
const themeLabel = themeToggle.querySelector('.theme-label');
const applyTheme = theme => {
  const isLight = theme === 'light';
  document.body.classList.toggle('light-theme', isLight);
  themeToggle.dataset.theme = theme;
  themeLabel.textContent = isLight ? 'Dark' : 'Light';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
};

const savedTheme = localStorage.getItem('portfolio-theme');
applyTheme(savedTheme || 'dark');

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
  applyTheme(nextTheme);
  localStorage.setItem('portfolio-theme', nextTheme);
});

const resumeDownload = document.querySelector('.primary[download]');
const downloadLabel = resumeDownload.querySelector('.download-label');

resumeDownload.addEventListener('click', () => {
  downloadLabel.textContent = 'Resume Downloading';
  window.setTimeout(() => {
    downloadLabel.textContent = 'Download Resume';
  }, 1800);
});

const copyText = async value => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = value;
  document.body.append(temporaryInput);
  temporaryInput.select();
  document.execCommand('copy');
  temporaryInput.remove();
};

document.querySelectorAll('.copy-action').forEach(button => {
  button.addEventListener('click', async () => {
    const originalText = button.textContent;
    try {
      await copyText(button.dataset.copy);
      button.textContent = 'Copied';
      button.setAttribute('aria-label', `${button.dataset.copyLabel} copied`);
    } catch {
      button.textContent = 'Copy failed';
    }
    window.setTimeout(() => {
      button.textContent = originalText;
      button.removeAttribute('aria-label');
    }, 1600);
  });
});
