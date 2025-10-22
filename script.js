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
fetch('courses_indexed.json')
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
      renderCourses(); // Update filtering based on concentration
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
    div.className = 'col-md-4 course-card card p-2';
    div.innerHTML = `<strong>${course.number}</strong>: ${course.name}<br><small>${course.tags.join(', ')}</small>`;
    div.addEventListener('click', () => addCourseToSchedule(course));
    container.appendChild(div);
  });
}

// Search input listener
document.getElementById('searchBar').addEventListener('input', renderCourses);

// Add course to schedule with validation
function addCourseToSchedule(course) {
  const tagsUpper = course.tags.map(t => t.toUpperCase());

  // AREA, TECH, ECON
  if (tagsUpper.includes('AREA') && !schedule.AREA) { schedule.AREA = course; updateSlot('AREA', course); return; }
  if (tagsUpper.includes('TECH') && !schedule.TECH) { schedule.TECH = course; updateSlot('TECH', course); return; }
  if (tagsUpper.includes('ECON') && !schedule.ECON) { schedule.ECON = course; updateSlot('ECON', course); return; }

  // CORE must match concentration
  if (tagsUpper.includes('CORE') && activeConcentration && tagsUpper.includes(activeConcentration.toUpperCase()) && !schedule.CORE) {
    schedule.CORE = course;
    updateSlot('CORE', course);
    return;
  }

  // Concentration courses
  if (activeConcentration && tagsUpper.includes(activeConcentration.toUpperCase()) && schedule.CONC.length < maxConcentration) {
    schedule.CONC.push(course);
    updateSlot('CONC', course);
    return;
  }

  // Electives
  if (schedule.ELECT.length < maxElectives) {
    schedule.ELECT.push(course);
    updateSlot('ELECT', course);
    return;
  }

  alert('This course cannot be added or the relevant slot is full.');
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
  // Clear slots visually
  ['AREA','TECH','ECON','CORE','CONC','ELECT'].forEach(slot => document.getElementById(`slot-${slot}`).innerHTML = '');
});
