// ============================================
// VKTX STOCK PITCH — Interactive Charts & App
// ============================================

// Dark mode toggle
(function(){
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = r.getAttribute('data-theme') || 'dark';
  r.setAttribute('data-theme', d);
  t && t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
    t.innerHTML = d === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    // Redraw charts on theme change
    setTimeout(() => {
      Object.values(window.charts || {}).forEach(c => c && c.destroy && c.destroy());
      window.charts = {};
      initCharts();
    }, 50);
  });
})();

// Active section nav tracking
const snavLinks = document.querySelectorAll('.snav-link');
const sections = document.querySelectorAll('.content-section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      snavLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-20% 0px -70% 0px' });
sections.forEach(s => s.id && observer.observe(s));

// ============ CHART HELPERS ============
function getColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    primary:  s.getPropertyValue('--color-primary').trim(),
    green:    s.getPropertyValue('--color-green').trim(),
    red:      s.getPropertyValue('--color-red').trim(),
    amber:    s.getPropertyValue('--color-amber').trim(),
    blue:     s.getPropertyValue('--color-blue').trim(),
    text:     s.getPropertyValue('--color-text').trim(),
    muted:    s.getPropertyValue('--color-text-muted').trim(),
    faint:    s.getPropertyValue('--color-text-faint').trim(),
    border:   s.getPropertyValue('--color-border').trim(),
    surface:  s.getPropertyValue('--color-surface').trim(),
  };
}

function baseChartOpts(c) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.surface,
        borderColor: c.border,
        borderWidth: 1,
        titleColor: c.text,
        bodyColor: c.muted,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter', weight: '600', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
      }
    },
    scales: {
      x: {
        grid: { color: c.faint + '40', drawBorder: false },
        ticks: { color: c.muted, font: { family: 'Inter', size: 11 }, maxRotation: 0 },
        border: { display: false },
      },
      y: {
        grid: { color: c.faint + '40', drawBorder: false },
        ticks: { color: c.muted, font: { family: 'Inter', size: 11 } },
        border: { display: false },
      }
    }
  };
}

// ============ CHART DATA ============
window.charts = {};

function initCharts() {
  const c = getColors();

  // 1. PRICE CHART
  const priceCtx = document.getElementById('priceChart').getContext('2d');
  const priceData = {
    labels: ['Jan\'24','Feb\'24','Mar\'24','Apr\'24','May\'24','Jun\'24','Jul\'24','Aug\'24','Sep\'24','Oct\'24','Nov\'24','Dec\'24','Jan\'25','Feb\'25','Mar\'25','Apr\'25','May\'25','Jun\'25','Jul\'25','Aug\'25','Sep\'25','Oct\'25','Nov\'25','Dec\'25','Jan\'26','Feb\'26','Mar\'26'],
    prices: [24.14,77.05,82.00,79.58,62.26,53.01,57.00,64.12,63.31,72.54,52.94,40.24,32.75,28.87,24.15,28.87,26.80,26.50,32.57,27.05,26.28,38.08,36.81,35.18,29.04,33.84,32.41]
  };

  // Gradient fill
  const gradient = priceCtx.createLinearGradient(0, 0, 0, 280);
  gradient.addColorStop(0, c.primary + '30');
  gradient.addColorStop(1, c.primary + '02');

  window.charts.price = new Chart(priceCtx, {
    type: 'line',
    data: {
      labels: priceData.labels,
      datasets: [{
        label: 'VKTX Price',
        data: priceData.prices,
        borderColor: c.primary,
        backgroundColor: gradient,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: c.primary,
        tension: 0.3,
        fill: true,
      }]
    },
    options: {
      ...baseChartOpts(c),
      plugins: {
        ...baseChartOpts(c).plugins,
        legend: { display: false },
        annotation: undefined,
        tooltip: {
          ...baseChartOpts(c).plugins.tooltip,
          callbacks: {
            label: ctx => ' $' + ctx.parsed.y.toFixed(2),
          }
        }
      },
      scales: {
        x: { ...baseChartOpts(c).scales.x, ticks: { ...baseChartOpts(c).scales.x.ticks, maxTicksLimit: 10 } },
        y: {
          ...baseChartOpts(c).scales.y,
          ticks: { ...baseChartOpts(c).scales.y.ticks, callback: v => '$' + v },
        }
      }
    }
  });

  // 2. EFFICACY CHART — bar
  const effCtx = document.getElementById('efficacyChart').getContext('2d');
  window.charts.efficacy = new Chart(effCtx, {
    type: 'bar',
    data: {
      labels: ['VK2735 Injectable\n(VENTURE Ph2, 13wk)', 'VK2735 Oral\n(VENTURE-Oral Ph2, 13wk)', "Lilly Zepbound\n(Ph3, 72wk adj.)", "Novo Wegovy\n(Ph3, 68wk adj.)", "Amgen MariTide\n(Ph3)"],
      datasets: [{
        label: 'Body weight reduction (%)',
        data: [14.7, 12.2, 15.0, 12.0, 10.8],
        backgroundColor: [c.primary + 'cc', c.primary + '88', c.blue + '88', c.muted + '66', c.muted + '66'],
        borderColor: [c.primary, c.primary + 'aa', c.blue + 'aa', 'transparent', 'transparent'],
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      ...baseChartOpts(c),
      indexAxis: 'y',
      plugins: {
        ...baseChartOpts(c).plugins,
        tooltip: {
          ...baseChartOpts(c).plugins.tooltip,
          callbacks: { label: ctx => ' ' + ctx.parsed.x.toFixed(1) + '% body weight reduction (13 wks)' }
        }
      },
      scales: {
        x: { ...baseChartOpts(c).scales.x, ticks: { ...baseChartOpts(c).scales.x.ticks, callback: v => v + '%' } },
        y: { ...baseChartOpts(c).scales.y, ticks: { ...baseChartOpts(c).scales.y.ticks, font: { size: 11 } } }
      }
    }
  });

  // 3. MARKET GROWTH CHART
  const mktCtx = document.getElementById('marketChart').getContext('2d');
  const mktGradient = mktCtx.createLinearGradient(0, 0, 0, 200);
  mktGradient.addColorStop(0, c.green + '30');
  mktGradient.addColorStop(1, c.green + '02');
  window.charts.market = new Chart(mktCtx, {
    type: 'bar',
    data: {
      labels: ['2023', '2024', '2025E', '2026E', '2027E', '2028E', '2029E', '2030E'],
      datasets: [{
        label: 'GLP-1 Market ($B)',
        data: [6, 14, 25, 36, 52, 68, 85, 100],
        backgroundColor: [c.muted+'55',c.muted+'55',c.primary+'55',c.primary+'66',c.primary+'77',c.primary+'88',c.primary+'99',c.green+'cc'],
        borderColor: 'transparent',
        borderRadius: 6,
      }]
    },
    options: {
      ...baseChartOpts(c),
      plugins: {
        ...baseChartOpts(c).plugins,
        tooltip: {
          ...baseChartOpts(c).plugins.tooltip,
          callbacks: { label: ctx => ' $' + ctx.parsed.y + 'B' }
        }
      },
      scales: {
        x: baseChartOpts(c).scales.x,
        y: { ...baseChartOpts(c).scales.y, ticks: { ...baseChartOpts(c).scales.y.ticks, callback: v => '$' + v + 'B' } }
      }
    }
  });

  // 4. R&D CHART
  const rdCtx = document.getElementById('rdChart').getContext('2d');
  window.charts.rd = new Chart(rdCtx, {
    type: 'bar',
    data: {
      labels: ['FY2022', 'FY2023', 'FY2024', 'FY2025'],
      datasets: [{
        label: 'R&D Spend ($M)',
        data: [54.2, 63.8, 101.6, 345.0],
        backgroundColor: [c.primary+'55', c.primary+'66', c.primary+'88', c.primary+'cc'],
        borderColor: 'transparent',
        borderRadius: 6,
      }]
    },
    options: {
      ...baseChartOpts(c),
      plugins: {
        ...baseChartOpts(c).plugins,
        tooltip: { ...baseChartOpts(c).plugins.tooltip, callbacks: { label: ctx => ' $' + ctx.parsed.y.toFixed(1) + 'M R&D' } }
      },
      scales: {
        x: baseChartOpts(c).scales.x,
        y: { ...baseChartOpts(c).scales.y, ticks: { ...baseChartOpts(c).scales.y.ticks, callback: v => '$' + v + 'M' } }
      }
    }
  });

  // 5. CASH CHART
  const cashCtx = document.getElementById('cashChart').getContext('2d');
  window.charts.cash = new Chart(cashCtx, {
    type: 'bar',
    data: {
      labels: ['FY2022', 'FY2023', 'FY2024', 'FY2025'],
      datasets: [
        {
          label: 'Cash & Investments ($M)',
          data: [155.5, 362.1, 902.6, 705.7],
          backgroundColor: c.primary + '88',
          borderColor: 'transparent',
          borderRadius: 4,
        },
        {
          label: 'Operating Cash Burn ($M)',
          data: [-48.4, -73.4, -87.8, -278.7],
          backgroundColor: c.red + '66',
          borderColor: 'transparent',
          borderRadius: 4,
        }
      ]
    },
    options: {
      ...baseChartOpts(c),
      plugins: {
        ...baseChartOpts(c).plugins,
        legend: {
          display: true,
          position: 'top',
          labels: { color: c.muted, font: { family: 'Inter', size: 11 }, usePointStyle: true, boxWidth: 8, padding: 12 }
        },
        tooltip: { ...baseChartOpts(c).plugins.tooltip, callbacks: { label: ctx => ' $' + Math.abs(ctx.parsed.y).toFixed(1) + 'M' } }
      },
      scales: {
        x: baseChartOpts(c).scales.x,
        y: { ...baseChartOpts(c).scales.y, ticks: { ...baseChartOpts(c).scales.y.ticks, callback: v => '$' + Math.abs(v) + 'M' } }
      }
    }
  });

  // 6. ANALYST TARGET CHART
  const targetCtx = document.getElementById('targetChart').getContext('2d');
  const analysts = ['HC Wainwright', 'Canaccord Genuity', 'JP Morgan', 'Morgan Stanley', 'BTIG', 'Avg Target'];
  const targets = [102, 107, 75, 102, 125, 102.2];
  const currentPrice = 32.40;
  window.charts.target = new Chart(targetCtx, {
    type: 'bar',
    data: {
      labels: analysts,
      datasets: [
        {
          label: 'Price Target ($)',
          data: targets,
          backgroundColor: targets.map((t, i) => i === 5 ? c.green + 'bb' : c.primary + '88'),
          borderColor: targets.map((t, i) => i === 5 ? c.green : c.primary),
          borderWidth: 1,
          borderRadius: 6,
        }
      ]
    },
    options: {
      ...baseChartOpts(c),
      plugins: {
        ...baseChartOpts(c).plugins,
        tooltip: { ...baseChartOpts(c).plugins.tooltip, callbacks: { label: ctx => ' Price Target: $' + ctx.parsed.y } },
        annotation: undefined,
      },
      scales: {
        x: baseChartOpts(c).scales.x,
        y: {
          ...baseChartOpts(c).scales.y,
          min: 0,
          ticks: { ...baseChartOpts(c).scales.y.ticks, callback: v => '$' + v },
        }
      }
    },
    plugins: [{
      id: 'currentPriceLine',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;
        const yPos = y.getPixelForValue(currentPrice);
        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = c.amber;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(left, yPos);
        ctx.lineTo(right, yPos);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = c.amber;
        ctx.font = '11px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('Current: $32.40', left + 8, yPos - 6);
        ctx.restore();
      }
    }]
  });
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initCharts);

// Fade-in sections on scroll
const fadeObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.thesis-card, .stat-card, .kpi-card, .scenario-card, .timeline-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObs.observe(el);
});

// ============================================
// ALTERNATE REALITIES — Interactive Probability
// ============================================

const SCENARIOS = {
  bear: { midpoint: 20, label: 'Bear' },
  base: { midpoint: 92, label: 'Base' },
  bull: { midpoint: 140, label: 'Bull' },
};
const CURRENT_PRICE = 32.40;

function calcEV(bear, base, bull) {
  return (bear / 100) * SCENARIOS.bear.midpoint
       + (base / 100) * SCENARIOS.base.midpoint
       + (bull / 100) * SCENARIOS.bull.midpoint;
}

let probDistChart = null;

function initRealities() {
  const bearSlider = document.getElementById('prob-bear');
  const baseSlider = document.getElementById('prob-base');
  const bullSlider = document.getElementById('prob-bull');
  if (!bearSlider) return;

  let updating = false;

  function getProbs() {
    return {
      bear: parseInt(bearSlider.value),
      base: parseInt(baseSlider.value),
      bull: parseInt(bullSlider.value),
    };
  }

  function updateUI(changed) {
    if (updating) return;
    updating = true;

    let { bear, base, bull } = getProbs();
    const total = bear + base + bull;

    // Normalize so they sum to 100 when user drags one
    if (total !== 100 && changed) {
      const others = ['bear', 'base', 'bull'].filter(k => k !== changed);
      const remainder = 100 - (changed === 'bear' ? bear : changed === 'base' ? base : bull);
      const otherTotal = (changed === 'bear' ? base + bull : changed === 'base' ? bear + bull : bear + base);
      if (otherTotal > 0) {
        const ratio = remainder / otherTotal;
        if (changed !== 'bear') bear = Math.round(bear * ratio);
        if (changed !== 'base') base = Math.round(base * ratio);
        if (changed !== 'bull') bull = Math.round(bull * ratio);
        // Fix rounding
        const diff = 100 - bear - base - bull;
        if (changed !== 'base') base += diff;
        else bear += diff;
      }
      bearSlider.value = bear;
      baseSlider.value = base;
      bullSlider.value = bull;
    }

    const finalTotal = bear + base + bull;

    // Update display values
    document.getElementById('val-bear').textContent = bear + '%';
    document.getElementById('val-base').textContent = base + '%';
    document.getElementById('val-bull').textContent = bull + '%';
    document.getElementById('rp-bear').textContent = bear + '%';
    document.getElementById('rp-base').textContent = base + '%';
    document.getElementById('rp-bull').textContent = bull + '%';

    const totalEl = document.getElementById('prob-total');
    totalEl.textContent = 'Total: ' + finalTotal + '%';
    totalEl.classList.toggle('invalid', finalTotal !== 100);

    // Update EV
    const ev = calcEV(bear, base, bull);
    const upside = ((ev - CURRENT_PRICE) / CURRENT_PRICE * 100).toFixed(0);
    document.getElementById('ev-live').textContent = '$' + ev.toFixed(2);
    const upsideEl = document.getElementById('ev-upside');
    upsideEl.textContent = (upside > 0 ? '+' : '') + upside + '%';
    upsideEl.style.color = upside > 0 ? 'var(--color-green)' : 'var(--color-red)';

    // EV color based on value
    const evEl = document.getElementById('ev-live');
    if (ev > CURRENT_PRICE * 1.5) evEl.style.color = 'var(--color-green)';
    else if (ev < CURRENT_PRICE) evEl.style.color = 'var(--color-red)';
    else evEl.style.color = 'var(--color-primary)';

    // Update probability distribution chart
    updateProbChart(bear, base, bull, ev);

    updating = false;
  }

  bearSlider.addEventListener('input', () => updateUI('bear'));
  baseSlider.addEventListener('input', () => updateUI('base'));
  bullSlider.addEventListener('input', () => updateUI('bull'));

  // Initialize chart
  initProbChart();
  updateUI(null);
}

function initProbChart() {
  const canvas = document.getElementById('probDistChart');
  if (!canvas) return;
  const c = getColors();

  // Destroy previous if exists
  if (probDistChart) { probDistChart.destroy(); probDistChart = null; }

  const ctx = canvas.getContext('2d');
  canvas.style.height = '80px';
  canvas.style.maxHeight = '80px';
  canvas.parentElement.style.overflow = 'hidden';

  probDistChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Bear ($18–22)', 'Base ($80–105)', 'Bull ($120–160)'],
      datasets: [{
        data: [25, 50, 25],
        backgroundColor: [c.red + '99', c.primary + '99', c.green + '99'],
        borderColor: [c.red, c.primary, c.green],
        borderWidth: 1, borderRadius: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.parsed.y + '% probability',
            title: ctx => ctx[0].label.replace('\n', ' ')
          },
          backgroundColor: c.surface, borderColor: c.border, borderWidth: 1,
          titleColor: c.text, bodyColor: c.muted, padding: 10, cornerRadius: 8,
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.muted, font: { size: 10 } }, border: { display: false } },
        y: { display: false, max: 100 }
      },
      animation: { duration: 300 }
    }
  });
}

function updateProbChart(bear, base, bull, ev) {
  if (!probDistChart) return;
  const c = getColors();
  probDistChart.data.datasets[0].data = [bear, base, bull];
  probDistChart.data.datasets[0].backgroundColor = [c.red + '99', c.primary + '99', c.green + '99'];
  probDistChart.data.datasets[0].borderColor = [c.red, c.primary, c.green];
  probDistChart.update('active');
}

// ============================================
// STRATEGY TOGGLE
// ============================================
function initStrategyToggle() {
  const buttons = document.querySelectorAll('.strat-btn');
  const panels = document.querySelectorAll('.strategy-panel');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const strategy = btn.dataset.strategy;
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panels.forEach(p => {
        p.classList.toggle('hidden', p.id !== 'panel-' + strategy);
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initRealities();
  initStrategyToggle();
});
