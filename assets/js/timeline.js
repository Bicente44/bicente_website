(function () {
  'use strict';

  const TIMELINE_HEIGHT = 800;
  const MIN_HEIGHT = 80;
  const PADDING_TOP = 60;

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                  'Jul','Aug','Sep','Oct','Nov','Dec'];

  function parseDate(str) {
    if (!str || str.trim().toLowerCase() === 'present') return new Date();
    const parts = str.trim().split('-');
    if (parts.length < 2) return new Date();
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    if (isNaN(year) || isNaN(month)) return new Date();
    return new Date(year, month, 1);
  }

  function monthsBetween(a, b) {
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  }

  const now = new Date();
  const cards = document.querySelectorAll('.timeline-card');
  if (!cards.length) return;

  // Find earliest date across all cards
  let earliest = now;
  cards.forEach(function (card) {
    const s = parseDate(card.dataset.start);
    if (s < earliest) earliest = s;
  });

  const totalMonths = monthsBetween(earliest, now);
  if (totalMonths <= 0) return;

  function dateToPx(date) {
    const mFromNow = monthsBetween(date, now);
    return PADDING_TOP + (mFromNow / totalMonths) * TIMELINE_HEIGHT;
  }

  // Set timeline container height
  const timeline = document.querySelector('.timeline');
  if (timeline) timeline.style.height = (TIMELINE_HEIGHT + PADDING_TOP + 80) + 'px';

  // Lane assignment for overlapping cards
  function assignLanes(cardDataArr) {
    const lanes = [];
    cardDataArr.forEach(function (d) {
      let placed = false;
      for (let i = 0; i < lanes.length; i++) {
        const fits = lanes[i].every(function (c) {
          return d.bottomPx <= c.topPx || d.topPx >= c.bottomPx;
        });
        if (fits) {
          lanes[i].push(d);
          d.lane = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        lanes.push([d]);
        d.lane = lanes.length - 1;
      }
    });
    return lanes.length;
  }

  function formatDates(card, start, cappedEnd, endRaw) {
    const el = card.querySelector('.card-dates');
    if (!el) return;
    const startStr = MONTHS[start.getMonth()] + ' ' + start.getFullYear();
    const endStr = (!endRaw || endRaw.trim().toLowerCase() === 'present')
      ? 'Present'
      : MONTHS[cappedEnd.getMonth()] + ' ' + cappedEnd.getFullYear();
    el.textContent = startStr + ' \u2013 ' + endStr;
  }

  // Left column (Work)
  const leftCards = document.querySelectorAll('.timeline-left .timeline-card');
  const leftData = [];

  leftCards.forEach(function (card) {
    const start = parseDate(card.dataset.start);
    const endRaw = card.dataset.end;
    const end = parseDate(endRaw);
    const cappedEnd = end > now ? now : end;
    const topPx = dateToPx(cappedEnd);
    const heightPx = Math.max(dateToPx(start) - topPx, MIN_HEIGHT);
    leftData.push({ card, start, cappedEnd, endRaw, topPx, bottomPx: topPx + heightPx });
  });

  leftData.sort(function (a, b) { return a.topPx - b.topPx; });
  assignLanes(leftData);

  leftData.forEach(function (d) {
  const CARD_WIDTH = 160;
  d.card.style.top = d.topPx + 'px';
  d.card.style.height = (d.bottomPx - d.topPx) + 'px';
  d.card.style.width = CARD_WIDTH + 'px';
  d.card.style.maxWidth = CARD_WIDTH + 'px';
  d.card.style.right = (d.lane * (CARD_WIDTH + 8)) + 'px';
  d.card.style.left = 'auto';
  formatDates(d.card, d.start, d.cappedEnd, d.endRaw);
});

  // Right column (education)
  document.querySelectorAll('.timeline-right .timeline-card').forEach(function (card) {
    const start = parseDate(card.dataset.start);
    const endRaw = card.dataset.end;
    const end = parseDate(endRaw);
    const cappedEnd = end > now ? now : end;
    const topPx = dateToPx(cappedEnd);
    const heightPx = Math.max(dateToPx(start) - topPx, MIN_HEIGHT);
    card.style.top = topPx + 'px';
    card.style.height = heightPx + 'px';
    formatDates(card, start, cappedEnd, endRaw);
  });

  // Year markers
  document.querySelectorAll('.timeline-year').forEach(function (marker) {
  if (marker.dataset.year === 'present') {
    marker.style.top = PADDING_TOP + 'px';
    return;
  }
    const year = parseInt(marker.dataset.year);
    if (!year) return;
    const markerDate = new Date(year, 0, 1);
    if (markerDate > now) return;
    marker.style.top = dateToPx(markerDate) + 'px';
  });

  // Scroll animations
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  document.querySelectorAll('.timeline-card').forEach(function (card) {
    observer.observe(card);
  });

})();
