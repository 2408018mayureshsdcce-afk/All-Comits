/* ==========================================================================
   Dashboard schema: the single description of everything the dashboard can
   edit. backend.js uses it to validate and clean input; admin.js builds its
   forms and tables from it. Loaded by both Node (require) and the browser.
   ========================================================================== */
(function (root) {
  'use strict';

  const KINDS = ['robot', 'rocket', 'code', 'design', 'business', 'gaming', 'science', 'civil', 'bio', 'lecture', 'exhibit', 'night', 'ignite', 'stay', 'cap', 'globe', 'spark', 'seal'];
  const TZ = '+05:30'; // Date-times are entered and stored in IST.
  const TIERS = ['Title Sponsor', 'Powered By', 'Gold Partners', 'Silver Partners', 'Community & Media'];
  const GROUPS = ['Faculty Coordinators', 'Student Coordinators', 'Core Team', 'Volunteers'];

  const kind = def => ({ key: 'kind', type: 'select', label: 'Emblem', options: KINDS, default: def, half: true });
  const hue = def => ({ key: 'hue', type: 'hue', label: 'Colour', default: def, half: true });
  // A form section title in the dashboard; it holds no data.
  const heading = (label, hint = '') => ({ type: 'heading', label, hint });

  const collections = {
    competitions: {
      label: 'Events', singular: 'Event', icon: 'trophy', path: ['competitions'],
      slug: true, view: 'event.html?id=', title: 'name',
      columns: [['cat', 'Category'], ['status', 'Status'], ['date', 'Event day'], ['deadline', 'Register by'], ['prize', 'Prize']],
      fields: [
        { key: 'name', type: 'text', label: 'Name', required: true, max: 80, half: true },
        { key: 'subtitle', type: 'text', label: 'Subtitle', placeholder: '36-Hour Hackathon', max: 60, half: true, hint: 'Shown under the name on the event page.' },
        { key: 'id', type: 'slug', label: 'Page id', hint: 'Used in the page address. Leave empty to create one from the name.', half: true },
        { key: 'cat', type: 'text', label: 'Category', required: true, max: 40, suggest: 'cat', half: true, hint: 'Events are filtered by category on the Events page.' },

        heading('Event details', 'The six tiles on the event page. Empty date, time or venue fall back to the first schedule session linked to this event.'),
        { key: 'team', type: 'text', label: 'Participants', placeholder: '2–4 members', required: true, max: 40, half: true },
        { key: 'rounds', type: 'text', label: 'Rounds', placeholder: 'Online round + Onsite final', max: 60, half: true },
        { key: 'theme', type: 'text', label: 'Theme', placeholder: 'Autonomous robotics', max: 60, half: true },
        { key: 'venue', type: 'text', label: 'Venue', placeholder: 'Robo Arena', max: 60, suggest: 'venue', half: true },
        { key: 'date', type: 'date', label: 'Date', half: true },
        { key: 'time', type: 'time', label: 'Time (IST)', half: true },

        heading('Registration'),
        { key: 'status', type: 'select', label: 'Status', options: [['open', 'Open'], ['closed', 'Closed']], default: 'open', half: true },
        { key: 'mode', type: 'select', label: 'Format', options: ['Onsite', 'Online', 'Online + Onsite', 'Zonals + Finale'], default: 'Onsite', half: true },
        { key: 'deadline', type: 'date', label: 'Register by', required: true, half: true },
        { key: 'prize', type: 'number', label: 'Prize pool (₹)', min: 0, default: 0, half: true },
        { key: 'fee', type: 'number', label: 'Entry fee (₹)', min: 0, default: 0, hint: '0 shows a "Free entry" tag.', half: true },
        { key: 'registerUrl', type: 'url', label: 'External registration link', placeholder: 'https://forms.gle/…', hint: 'Optional, e.g. a Google Form. Without it the built-in form sends registrations to the inbox here.' },

        heading('Content'),
        { key: 'tagline', type: 'text', label: 'Tagline', required: true, max: 160, hint: 'One line on the card. Stays visible on sealed events.' },
        { key: 'overview', type: 'textarea', label: 'Description', max: 2000 },
        { key: 'statement', type: 'textarea', label: 'The challenge', max: 4000, hint: 'The problem statement, shown under the description.' },
        { key: 'rules', type: 'rules', label: 'Rules & regulations', hint: 'One line per point. A plain line is a numbered rule or round (1, 2, 3…). Start a line with "- " to make it a dotted sub-point of the rule above it. Indent it two more spaces ("  - ") for a point under a sub-point. Use the buttons to add them.' },
        { key: 'judging', type: 'rules', label: 'Judging criteria', hint: 'One criterion per line. Start a line with "- " to add a sub-point under the criterion above it (for example the marks split inside a criterion).' },

        heading('Coordinators'),
        { key: 'coordinators', type: 'people', label: 'Coordinators', hint: 'One per line: Name | Role | Phone | Email. Roles containing "Faculty" are shown in violet.' },

        heading('Appearance'),
        { key: 'image', type: 'image', label: 'Event image', hint: 'Shown on the event card and the event page. Upload your own, or leave it as the default.' },
        kind('robot'), hue(210),
        { key: 'sealed', type: 'bool', label: 'Sealed event', hint: 'Show only the name, subtitle and tagline until the reveal time.', half: true },
        { key: 'revealAt', type: 'datetime', label: 'Reveal at (IST)', half: true },
      ],
    },

    schedule: {
      label: 'Schedule', singular: 'Session', icon: 'calendar', path: ['schedule'],
      view: 'schedule.html', title: 'title', sort: ['day', 'start', 'end'],
      columns: [['day', 'Day'], ['start', 'Starts'], ['end', 'Ends'], ['cat', 'Type'], ['venue', 'Venue']],
      fields: [
        { key: 'title', type: 'text', label: 'Title', required: true, max: 100 },
        { key: 'day', type: 'date', label: 'Day', required: true, half: true },
        { key: 'cat', type: 'select', label: 'Type', options: ['Registration', 'Ceremony', 'Competition', 'Surprise', 'Break'], default: 'Competition', half: true },
        { key: 'start', type: 'time', label: 'Starts (IST)', required: true, half: true },
        { key: 'end', type: 'time', label: 'Ends (IST)', required: true, half: true },
        { key: 'venue', type: 'text', label: 'Venue', max: 60, suggest: 'venue' },
        { key: 'link', type: 'url', label: 'Link', suggest: 'links', placeholder: 'event.html?id=… or https://…', hint: 'Pick a page from the suggestions, or paste any address.' },
        { key: 'note', type: 'text', label: 'Note', max: 120, hint: 'Optional extra line on the card, e.g. a submission deadline.' },
      ],
      check: s => (s.end <= s.start ? 'The session must end after it starts.' : ''),
    },

    zonals: {
      label: 'City qualifiers', singular: 'Qualifier', icon: 'pin', path: ['zonals'],
      view: 'events.html', title: 'city', sort: ['date'],
      columns: [['date', 'Date']],
      fields: [
        { key: 'city', type: 'text', label: 'City', required: true, max: 40, half: true },
        { key: 'date', type: 'date', label: 'Date', required: true, half: true },
      ],
    },

    sponsors: {
      label: 'Sponsors', singular: 'Sponsor', icon: 'star', path: ['sponsors'],
      view: 'sponsors.html', title: 'name',
      columns: [['tier', 'Tier'], ['tag', 'Sector']],
      fields: [
        { key: 'name', type: 'text', label: 'Name', required: true, max: 60, half: true },
        { key: 'tier', type: 'select', label: 'Tier', options: TIERS, default: 'Gold Partners', half: true },
        { key: 'tag', type: 'text', label: 'Sector', placeholder: 'Cloud & AI', max: 40, half: true },
        { key: 'url', type: 'url', label: 'Website', half: true },
        { key: 'logo', type: 'url', label: 'Logo file', placeholder: 'assets/sponsors/name.png', hint: 'Put the image in the site folder (e.g. assets/sponsors/) and enter its path. Without a logo a monogram plate is shown.' },
      ],
    },

    team: {
      label: 'Team', singular: 'Member', icon: 'users', path: ['team'],
      view: 'team.html', title: 'name',
      columns: [['role', 'Role'], ['group', 'Group']],
      fields: [
        { key: 'name', type: 'text', label: 'Name', required: true, max: 60, half: true },
        { key: 'role', type: 'text', label: 'Role', required: true, max: 60, half: true },
        { key: 'group', type: 'select', label: 'Group', options: GROUPS, default: 'Core Team', half: true },
        { key: 'dept', type: 'text', label: 'Department / year', max: 60, half: true },
        { key: 'email', type: 'email', label: 'Email', max: 80, half: true },
        { key: 'linkedin', type: 'url', label: 'LinkedIn', half: true },
        { key: 'photo', type: 'url', label: 'Photo file', placeholder: 'assets/team/name.jpg', hint: 'Put a square photo in the site folder and enter its path. Initials are shown otherwise.' },
      ],
    },

    gallery: {
      label: 'Gallery', singular: 'Photo', icon: 'image', path: ['gallery'],
      view: 'gallery.html', title: 'caption',
      columns: [['cat', 'Category'], ['year', 'Year']],
      fields: [
        { key: 'caption', type: 'text', label: 'Caption', required: true, max: 80 },
        { key: 'cat', type: 'text', label: 'Category', required: true, max: 40, suggest: 'cat', half: true },
        { key: 'year', type: 'number', label: 'Year', min: 0, default: 0, half: true },
        { key: 'src', type: 'url', label: 'Image file', placeholder: 'assets/gallery/photo.jpg', hint: 'Put the image in the site folder (e.g. assets/gallery/) and enter its path. Empty shows generated artwork.' },
      ],
    },

    faqs: {
      label: 'FAQs', singular: 'Question', icon: 'help', path: ['faqs'],
      view: 'index.html#faq', title: 'q',
      columns: [],
      fields: [
        { key: 'q', type: 'text', label: 'Question', required: true, max: 160 },
        { key: 'a', type: 'textarea', label: 'Answer', required: true, max: 1200, hint: '{dates} and {venue} are filled in from Settings.' },
      ],
    },
  };

  const settings = {
    fest: {
      label: 'Festival',
      fields: [
        { key: 'name', type: 'text', label: 'Festival name', required: true, max: 40, half: true },
        { key: 'host', type: 'text', label: 'Tagline', placeholder: 'Techno-Management Fest', required: true, max: 60, half: true },
        { key: 'theme', type: 'text', label: 'Theme', required: true, max: 80, half: true },
        { key: 'edition', type: 'text', label: 'Edition', max: 20, half: true },
        { key: 'start', type: 'datetime', label: 'Starts (IST)', required: true, half: true },
        { key: 'end', type: 'datetime', label: 'Ends (IST)', required: true, half: true },
        { key: 'earlyBirdEnds', type: 'datetime', label: 'Confirm participation by (IST)', required: true, half: true },
        { key: 'phone', type: 'text', label: 'Phone', max: 30, half: true },
        { key: 'email', type: 'email', label: 'Email', required: true, max: 80, half: true },
        { key: 'venueShort', type: 'text', label: 'Venue (short)', max: 60, half: true },
        { key: 'venue', type: 'text', label: 'Venue (full address)', max: 160 },
        { key: 'coords', type: 'text', label: 'Coordinates', placeholder: '20.5937° N · 78.9629° E', max: 40, half: true, hint: 'Shown in the corner of the home page hero.' },
        { key: 'mapUrl', type: 'url', label: 'Map link', half: true },
        { key: 'brochureUrl', type: 'url', label: 'Brochure link', placeholder: 'assets/brochure.pdf or https://…', hint: 'A PDF link, or a file you put in the site folder such as assets/brochure.pdf. Brochure buttons appear once this is set.' },
      ],
      check: f => (f.end <= f.start ? 'The festival must end after it starts.' : ''),
    },
    protocols: {
      label: 'Protocols',
      fields: [
        { key: 'general', type: 'rules', label: 'General protocols', hint: 'Shown in the sealed codex on the home page. A plain line is a numbered section; start a line with "- " to add a point under it.' },
        { key: 'dayOf', type: 'list', label: 'On the day', hint: 'One per line.' },
      ],
    },
  };

  /* ------------------------------------------------------------ cleaning */
  const LIMITS = { text: 200, textarea: 4000, listItem: 400, list: 60, rules: 120, people: 12 };

  // Plain text only: angle brackets and control characters are removed, so
  // nothing typed in the dashboard can inject markup into the public pages.
  function text(v, max) {
    return String(v == null ? '' : v)
      .replace(/[<>]/g, '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim()
      .slice(0, max || LIMITS.text);
  }

  // One line of a nested rules list. Leading spaces are kept (they mark
  // sub-points), but a tab counts as two spaces and the line is capped.
  function ruleLine(x, max) {
    const raw = String(x == null ? '' : x).replace(/\t/g, '  ');
    const indent = (raw.match(/^ */) || [''])[0].length;
    const body = text(raw, max);
    return body ? ' '.repeat(Math.min(indent, 8)) + body : '';
  }

  // Accepts http(s) links and relative site paths; rejects other schemes.
  function url(v) {
    const s = text(v, 500).replace(/\s/g, '');
    if (!s) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) {
      try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null;
      } catch (e) { return null; }
    }
    if (/^[\\/]{2}/.test(s)) return null;
    return s.replace(/["'`]/g, '');
  }

  const slugify = s => text(s, 200).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00Z'));
  const optionValues = f => f.options.map(o => (Array.isArray(o) ? o[0] : o));

  // Parses "Name | Role | Phone | Email" lines or {name, role, phone, email} objects.
  function people(v) {
    const rows = Array.isArray(v) ? v : String(v || '').split('\n');
    return rows.map(r => {
      if (typeof r === 'string') { const [name, role, phone, email] = r.split('|'); r = { name, role, phone, email }; }
      const email = text(r && r.email, 80).replace(/\s/g, '');
      return {
        name: text(r && r.name, 60),
        role: text(r && r.role, 60),
        phone: text(r && r.phone, 30).replace(/[^0-9+()\- ]/g, ''),
        email: /^[^\s@"']+@[^\s@"']+\.[^\s@"']+$/.test(email) ? email : '',
      };
    }).filter(p => p.name).slice(0, LIMITS.people);
  }

  // Returns { value, errors } with only known fields, each coerced to its type.
  function clean(fields, input, check) {
    const src = input && typeof input === 'object' ? input : {};
    const out = {}, errors = [];
    for (const f of fields) {
      if (f.type === 'heading') continue;
      let v = src[f.key];
      const empty = v == null || v === '';
      switch (f.type) {
        case 'number':
          v = empty ? (f.default != null ? f.default : 0) : Number(v);
          if (!Number.isFinite(v) || (f.min != null && v < f.min)) { errors.push(`${f.label} must be a number${f.min != null ? ` of at least ${f.min}` : ''}.`); v = f.default || 0; }
          v = Math.round(v);
          break;
        case 'hue':
          v = empty ? f.default : Math.round(Number(v));
          if (!Number.isFinite(v)) v = f.default;
          v = ((v % 360) + 360) % 360;
          break;
        case 'bool':
          v = v === true || v === 'true' || v === 'on' || v === 1;
          break;
        case 'select':
          v = empty ? f.default : String(v);
          if (!optionValues(f).includes(v)) { if (!empty) errors.push(`${f.label} has an unknown value.`); v = f.default; }
          break;
        case 'list':
          v = (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => text(x, LIMITS.listItem)).filter(Boolean).slice(0, LIMITS.list);
          break;
        case 'rules':
          v = (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => ruleLine(x, LIMITS.listItem)).filter(Boolean).slice(0, LIMITS.rules);
          break;
        case 'people':
          v = people(v);
          break;
        case 'url':
        case 'image':
          v = url(v);
          if (v === null) { errors.push(`${f.label} must be an http(s) link or a path on this site.`); v = ''; }
          break;
        case 'email':
          v = text(v, f.max);
          if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errors.push(`${f.label} is not a valid email address.`);
          break;
        case 'slug':
          v = text(v, 60).toLowerCase();
          if (v && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) errors.push(`${f.label} may use only lowercase letters, digits and single hyphens.`);
          break;
        case 'date':
          v = text(v, 10);
          if (v && !validDate(v)) errors.push(`${f.label} must be a date.`);
          break;
        case 'time':
          v = text(v, 5);
          if (v && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)) errors.push(`${f.label} must be a time like 09:30.`);
          break;
        case 'datetime': {
          v = text(v, 40);
          // From an <input type=datetime-local> ("2026-11-20T09:00") or already stored with an offset.
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) v += ':00' + TZ;
          if (v && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(v) || isNaN(new Date(v)))) errors.push(`${f.label} must be a date and time.`);
          break;
        }
        case 'textarea':
          v = text(v, f.max || LIMITS.textarea);
          break;
        default:
          v = text(v, f.max);
      }
      if (f.required && (v === '' || (Array.isArray(v) && !v.length))) errors.push(`${f.label} is required.`);
      out[f.key] = v;
    }
    if (check && !errors.length) { const e = check(out); if (e) errors.push(e); }
    return { value: out, errors };
  }

  const itemTitle = (col, item) => {
    const t = typeof col.title === 'function' ? col.title(item) : item[col.title];
    return t || '(untitled)';
  };

  const api = { KINDS, TZ, TIERS, GROUPS, collections, settings, clean, slugify, itemTitle, text };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TN_SCHEMA = api;
})(typeof window !== 'undefined' ? window : globalThis);
