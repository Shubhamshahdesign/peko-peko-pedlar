// Peko Peko Pedlar — small helpers: mobile menu, open-now status, today's hours, menu tabs, sketch reveal.
document.documentElement.classList.add('js');

// Opening hours (24h). 0 = Sunday. Edit here if hours change.
const HOURS = {
  0: [8.5, 15], 1: [7.5, 15], 2: [7.5, 15], 3: [7.5, 15],
  4: [7.5, 15], 5: [7.5, 15], 6: [8.5, 15]
};

function fmt(h) {
  const hr = Math.floor(h), min = Math.round((h - hr) * 60);
  const ampm = hr >= 12 ? 'pm' : 'am';
  const h12 = ((hr + 11) % 12) + 1;
  return h12 + (min ? ':' + String(min).padStart(2, '0') : '') + ampm;
}

function londonNow() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: days[get('weekday')], time: (+get('hour') % 24) + (+get('minute')) / 60 };
}

function updateStatus() {
  const { day, time } = londonNow();
  const [open, close] = HOURS[day];
  const isOpen = time >= open && time < close;
  let text;
  if (isOpen) {
    text = 'Open until ' + fmt(close);
  } else if (time < open) {
    text = 'Opens today ' + fmt(open);
  } else {
    const next = (day + 1) % 7;
    text = 'Opens tomorrow ' + fmt(HOURS[next][0]);
  }
  document.querySelectorAll('[data-status]').forEach(el => {
    el.classList.toggle('is-open', isOpen);
    el.classList.toggle('is-closed', !isOpen);
    el.querySelector('[data-status-text]').textContent = text;
  });
  const t = document.querySelector('[data-today-hours]');
  if (t) t.textContent = fmt(open) + '–' + fmt(close);
  document.querySelectorAll('.hours tr').forEach(tr => tr.classList.toggle('today', +tr.dataset.day === day));
}
updateStatus();
setInterval(updateStatus, 60000);

// Mobile menu
const btn = document.querySelector('[data-menu]');
const nav = document.getElementById('nav');
if (btn && nav) {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  }));
}

// Header border on scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Tabs (arrow keys supported)
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectTab(t));
  t.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(n); n.focus();
  });
});

// Sketch reveal, once
const sketch = document.querySelector('[data-sketch]');
if (sketch) {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { sketch.classList.add('drawn'); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(sketch);
  } else {
    sketch.classList.add('drawn');
  }
}

// Year
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
