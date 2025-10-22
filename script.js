let coursesData = null;
let activeTags = new Set();
let activeConcentration = null;

// Maximum slots
const maxConcentration = 3;
const maxElectives = 3;

// Current schedule state
const schedule = {
  AREA: null,
  TECH: null,
  ECON: null,
  CORE: null,
  CONC: [],
  ELECT: []
};

// Tags and concentration options
const tags = ["AREA", "Econ", "Tech", "Intel", "IS", "Mil Ops", "TSV", "USNP", "CORE"];
const concentrations = ["Tech", "Intel", "IS", "Mil Ops", "TSV", "USNP"];

// Fetch JSON and initialize
fetch('data/courses_indexed.json')
  .then(res => res.json())
  .then(data => {
    coursesData = data.courses;
    initTagButtons();
    initConcentrationButtons();
    renderCourses();
  });

// Initialize tag filter buttons
function initTagButtons() {
  const container = document.getElementById('tagFilters');
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary btn-sm me-1 mb-1 tag-btn';
    btn.textContent = tag;
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      if (activeTags.has(tag)) activeTags.delete(tag);
      else activeTags.add(tag);
      renderCourses();
    });
    container.appendChild(btn);
  });
}

// Initialize concentration buttons
function initConcentrationButtons() {
  const container = document.getElementById('concentrationButtons');
  concentrations.forEach(conc => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-success btn-sm me-1';
    btn.textContent = conc;
    btn.addEventListener('click', () => {
      activeConcentration = conc;
      // Highlight active
      Array.from(container.children).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCourses();
    });
    container.appendChild(btn);
  });
}

// Render courses based on search + tag filters
function renderCourses() {
  const container = document.getElementById('courseList');
  container.innerHTML = '';

  const searchValue = document.getElementById('searchBar').value.toLowerCase();

  const filtered = coursesData.filter(course => {
    // Tag filter
    if (activeTags.size > 0 && !course.tags.some(t => activeTags.has(t))) return false;

    // Search filter (number, name, tags)
    if (searchValue) {
      const text = [course.number, course.name, ...course.tags].join(' ').toLowerCase();
      if (!text.includes(searchValue)) return false;
    }
    return true;
  });

  filtered.forEach(course => {
    const div = document.createElement('div');
    div.className = 'col-md-4 course-card card p-2 mb-2';

    // Tags buttons + elective button
    const tagsHtml = course.tags.map(tag => `<button class="btn btn-outline-secondary btn-sm me-1 mb-1 tag-btn-course">${tag}</button>`).join('');
    div.innerHTML = `
      <strong>${course.number}</strong>: ${course.name}<br>
      ${tagsHtml}
      <button class="btn btn-outline-warning btn-sm ms-1 mb-1">Add to Electives</button>
    `;

    // Tag button clicks
    div.querySelectorAll('.tag-btn-course').forEach((btn, idx) => {
      btn.addEventListener('click', () => addCourseToSlot(course, course.tags[idx]));
    });

    // Electives button click
    div.querySelector('button.btn-outline-warning').addEventListener('click', () => addCourseToSlot(course, 'ELECT'));

    container.appendChild(div);
  });
}

// Search input listener
document.getElementById('searchBar').addEventListener('input', renderCourses);

// Add course to a specific slot
function addCourseToSlot(course, tag) {
  const tagUpper = tag.toUpperCase();
  const tagsUpper = course.tags.map(t => t.toUpperCase());

  switch(tagUpper) {
    case 'AREA':
      if (!schedule.AREA) { schedule.AREA = course; updateSlot('AREA', course); }
      else alert('AREA slot is full'); 
      break;
    case 'TECH':
      if (!schedule.TECH) { schedule.TECH = course; updateSlot('TECH', course); }
      else alert('TECH slot is full');
      break;
    case 'ECON':
      if (!schedule.ECON) { schedule.ECON = course; updateSlot('ECON', course); }
      else alert('ECON slot is full');
      break;
    case 'CORE':
      if (!activeConcentration) { alert('Select a concentration first'); break; }
      if (!tagsUpper.includes(activeConcentration.toUpperCase())) { alert('This course does not match the concentration for CORE'); break; }
      if (!schedule.CORE) { schedule.CORE = course; updateSlot('CORE', course); }
      else alert('CORE slot is full'); 
      break;
    case activeConcentration?.toUpperCase():
      if (schedule.CONC.length < maxConcentration) { schedule.CONC.push(course); updateSlot('CONC', course); }
      else alert('Concentration courses full'); 
      break;
    case 'ELECT':
      if (schedule.ELECT.length < maxElectives) { schedule.ELECT.push(course); updateSlot('ELECT', course); }
      else alert('Electives full'); 
      break;
    default:
      alert('Cannot assign course to this slot');
  }
}

// Update the schedule slot display
function updateSlot(slot, course) {
  const el = document.getElementById(`slot-${slot}`);
  if (slot === 'CONC' || slot === 'ELECT') {
    el.innerHTML = schedule[slot].map(c => `${c.number}: ${c.name}`).join('<br>');
  } else {
    el.innerHTML = `${course.number}: ${course.name}`;
  }
}

// CLEAR button
document.getElementById('clearSchedule').addEventListener('click', () => {
  schedule.AREA = null;
  schedule.TECH = null;
  schedule.ECON = null;
  schedule.CORE = null;
  schedule.CONC = [];
  schedule.ELECT = [];
  ['AREA','TECH','ECON','CORE','CONC','ELECT'].forEach(slot => document.getElementById(`slot-${slot}`).innerHTML = '');
});
