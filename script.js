let coursesData = null;
let activeTags = new Set();
let activeConcentration = null;

const maxConcentration = 3;
const maxElectives = 3;

const schedule = { AREA:null, TECH:null, ECON:null, CORE:null, CONC:[], ELECT:[] };
const tags = ["AREA","ECON","TECH","INTEL","IS","MILOPS","TSV","USNP","CORE"];
const concentrations = ["TECH","INTEL","IS","MILOPS","TSV","USNP"];

// Fetch JSON and initialize
fetch('courses_indexed.json')
  .then(res => res.json())
  .then(data => {
    coursesData = data.courses;
    initTagButtons();
    initConcentrationButtons();
    renderCourses();
  });

// Initialize global filter buttons
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
      Array.from(container.children).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCourses();
    });
    container.appendChild(btn);
  });
}

// Render courses list
function renderCourses() {
  const container = document.getElementById('courseList');
  container.innerHTML = '';

  const searchValue = document.getElementById('searchBar').value.toLowerCase();

  const filtered = coursesData.filter(course => {
    if (activeTags.size > 0 && !course.tags.some(t => activeTags.has(t))) return false;
    if (searchValue) {
      const text = [course.number, course.name, ...course.tags].join(' ').toLowerCase();
      if (!text.includes(searchValue)) return false;
    }
    return true;
  });

  filtered.forEach(course => {
    const div = document.createElement('div');
    div.className = 'col-md-4 course-card card p-2 mb-2';
    if (isCourseSelected(course)) div.classList.add('selected');

    const tagsHtml = course.tags.map(tag => `<button class="btn btn-outline-secondary btn-sm me-1 mb-1 tag-btn-course">${tag}</button>`).join('');

    div.innerHTML = `
      <strong>${course.number}</strong>: ${course.name}<br>
      <div class="course-tags">${tagsHtml}</div>
      <button class="btn btn-outline-warning btn-sm ms-1 mb-1">Add to Electives</button>
    `;

    // Tag buttons
    div.querySelectorAll('.tag-btn-course').forEach((btn, idx) => {
      btn.addEventListener('click', () => addCourseToSlot(course, course.tags[idx]));
    });

    // Electives button
    div.querySelector('button.btn-outline-warning').addEventListener('click', () => addCourseToSlot(course, 'ELECT'));

    container.appendChild(div);
  });
}

// Check if course already in schedule
function isCourseSelected(course) {
  const slots = [schedule.AREA, schedule.TECH, schedule.ECON, schedule.CORE, ...schedule.CONC, ...schedule.ELECT];
  return slots.some(c => c && c.number === course.number);
}

// Search listener
document.getElementById('searchBar').addEventListener('input', renderCourses);

// Add course to a slot
function addCourseToSlot(course, tag) {
  // Prevent duplicates
  if (isCourseSelected(course)) {
    alert('This course is already in your schedule.');
    return;
  }

  const tagUpper = tag.toUpperCase();
  const tagsUpper = course.tags.map(t => t.toUpperCase());

  switch(tagUpper) {
    case 'AREA':
      if (!schedule.AREA) schedule.AREA = course;
      else { alert('AREA slot full'); return; }
      break;
    case 'TECH':
      if (!schedule.TECH) schedule.TECH = course;
      else { alert('TECH slot full'); return; }
      break;
    case 'ECON':
      if (!schedule.ECON) schedule.ECON = course;
      else { alert('ECON slot full'); return; }
      break;
    case 'CORE':
      if (!activeConcentration) { alert('Select a concentration first'); return; }
      if (!tagsUpper.includes(activeConcentration.toUpperCase())) { alert('Course does not match CORE concentration'); return; }
      if (!schedule.CORE) schedule.CORE = course;
      else { alert('CORE slot full'); return; }
      break;
    case activeConcentration?.toUpperCase():
      if (schedule.CONC.length < maxConcentration) schedule.CONC.push(course);
      else { alert('Concentration courses full'); return; }
      break;
    case 'ELECT':
      if (schedule.ELECT.length < maxElectives) schedule.ELECT.push(course);
      else { alert('Electives full'); return; }
      break;
    default:
      alert('Cannot assign course to this slot'); return;
  }

  updateScheduleSlots();
  renderCourses(); // refresh highlighting
}


// Update all schedule slot displays
function updateScheduleSlots() {
  const el = id => document.getElementById(`slot-${id}`);
  el('AREA').innerHTML = schedule.AREA ? `${schedule.AREA.number}: ${schedule.AREA.name}` : '';
  el('TECH').innerHTML = schedule.TECH ? `${schedule.TECH.number}: ${schedule.TECH.name}` : '';
  el('ECON').innerHTML = schedule.ECON ? `${schedule.ECON.number}: ${schedule.ECON.name}` : '';
  el('CORE').innerHTML = schedule.CORE ? `${schedule.CORE.number}: ${schedule.CORE.name}` : '';
  el('CONC').innerHTML = schedule.CONC.map(c => `${c.number}: ${c.name}`).join('<br>');
  el('ELECT').innerHTML = schedule.ELECT.map(c => `${c.number}: ${c.name}`).join('<br>');
}

// CLEAR button
document.getElementById('clearSchedule').addEventListener('click', () => {
  schedule.AREA = schedule.TECH = schedule.ECON = schedule.CORE = null;
  schedule.CONC = [];
  schedule.ELECT = [];
  updateScheduleSlots();
  renderCourses();
});
