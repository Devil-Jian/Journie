'use strict';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const norm = v => String(v ?? '').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9\u4e00-\u9fff]/g,'');
const tokens = v => String(v ?? '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
const state = { journals: [], hits: [], ready: false };
const distinct = arr => [...new Set(arr.filter(Boolean))];
const allNames = j => distinct([j.name, j.abbreviation, ...(j.aliases || []), ...((j.ccf || []).map(v => v.abbreviation))]);
const allIds = j => distinct([j.issn, j.eissn, ...(j.issns || [])]);
const jcrPrimary = j => (j.jcr || [])[0] || null;
const casPrimary = j => (j.cas || [])[0] || null;
const ccfPrimary = j => (j.ccf || [])[0] || null;
const ACRONYMS = new Set(['IEEE','ACM','JAMA','BMJ','NEJM','PNAS','PLOS','DNA','RNA','MRI','CT','AI','USA','UK','EU','WHO','NASA','ACS','RSC','AAAS','SPIE','ISPRS','MDPI','BMC','NPJ','IF','JCR']);
function displayTitle(value) {
  return String(value || '未命名期刊').replace(/[A-Za-z]+(?:'[A-Za-z]+)?/g, word => {
    const upper = word.toUpperCase();
    if (ACRONYMS.has(upper) || (/^[IVX]+$/.test(upper) && upper.length > 1)) return upper;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}
function rankJournal(j, input) {
  if (!input) return 1;
  const q = norm(input), words = tokens(input);
  if (!q) return 0;
  let best = 0;
  for (const id of allIds(j)) {
    const clean = norm(id);
    if (clean === q) return 400;
    if (clean.startsWith(q)) best = Math.max(best, 260);
  }
  for (const name of allNames(j)) {
    const clean = norm(name);
    if (clean === q) return 390;
    if (clean.startsWith(q)) best = Math.max(best, 320);
    else if (clean.includes(q)) best = Math.max(best, 230);
    const parts = tokens(name);
    if (words.length > 1 && words.every(w => parts.some(p => p.startsWith(w)))) best = Math.max(best, 210);
    if (words.length === 1 && words[0].length >= 3 && parts.some(p => p.startsWith(words[0]))) best = Math.max(best, 170);
  }
  return best;
}
function performSearch() {
  if (!state.ready) return;
  const query = $('query').value.trim();
  const found = [];
  for (let i = 0; i < state.journals.length; i++) {
    const j = state.journals[i];
    const s = query ? rankJournal(j, query) : 1;
    if (s > 0) found.push({ i, s });
  }
  found.sort((a, b) => b.s - a.s || Number(!!state.journals[b.i].school) - Number(!!state.journals[a.i].school) || state.journals[a.i].name.localeCompare(state.journals[b.i].name));
  state.hits = found;
  $('counter').textContent = `找到 ${found.length.toLocaleString('zh-CN')} 条`;
  $('more').hidden = found.length <= 12;
  renderResults(query);
}
function badge(label, value, cls) {
  return `<span class="badge ${cls}">${esc(label)}: ${esc(value ?? '—')}</span>`;
}
function renderResults(query) {
  const root = $('results');
  if (!query) {
    root.innerHTML = '<div class="empty">输入期刊名称、简称或 ISSN<br>欢迎检索期刊分区与影响因子～</div>';
    return;
  }
  if (!state.hits.length) {
    root.innerHTML = '<div class="empty">还没有找到匹配的期刊，换个关键词试试吧～</div>';
    return;
  }
  root.innerHTML = state.hits.slice(0, 12).map(({ i }) => {
    const j = state.journals[i], jcr = jcrPrimary(j), cas = casPrimary(j), ccf = ccfPrimary(j);
    const name = esc(displayTitle(j.name));
    const school = j.school?.grade || '—';
    const jcrGrade = jcr?.quartile || '—';
    const casGrade = cas?.major ? `${cas.major}区${cas.is_top ? ' Top' : ''}` : '—';
    const ccfGrade = ccf?.grade || '—';
    const ifValue = jcr?.impact_factor ?? '—';
    const queryTerm = encodeURIComponent(j.name || j.abbreviation || j.issn || '');
    const issn = esc(j.issn || j.eissn || '暂无 ISSN');
    return `<article class="result-card" data-i="${i}">
      <div class="card-top">
        <div class="journal-heading">
          <span class="result-name" title="${name}">${name}</span>
          <span class="journal-issn">ISSN ${issn}</span>
        </div>
        <a class="out-link" href="https://www.ablesci.com/journal/index?keywords=${queryTerm}" target="_blank" rel="noopener noreferrer" aria-label="查看 ${name} 的期刊详情">查看详情 ↗</a>
      </div>
      <div class="badge-row" aria-label="期刊等级及影响因子">
        ${badge('川大', school, 'school')}
        ${badge('JCR', jcrGrade, 'jcr')}
        ${badge('中科院', casGrade, 'cas')}
        ${badge('CCF', ccfGrade, 'ccf')}
        ${badge('IF', ifValue, 'if')}
      </div>
    </article>`;
  }).join('');
}
function bindEvents() {
  let t = null;
  const rerun = () => { clearTimeout(t); t = setTimeout(performSearch, 80); };
  $('query').addEventListener('input', rerun);
  $('query').addEventListener('keydown', e => { if (e.key === 'Enter') {clearTimeout(t); performSearch();} });
  $('searchBtn').addEventListener('click', () => {clearTimeout(t); performSearch();});
  $('clear').addEventListener('click', () => { $('query').value = ''; performSearch(); $('query').focus(); });
}
(async function init() {
  bindEvents();
  try {
    const r = await fetch(chrome.runtime.getURL('data/integrated_journals.json'));
    if (!r.ok) throw new Error('期刊数据加载失败，请重新打开插件。');
    const data = await r.json();
    state.journals = Array.isArray(data.journals) ? data.journals : [];
    state.ready = true;
    $('counter').textContent = `共 ${state.journals.length.toLocaleString('zh-CN')} 本期刊`;
    performSearch();
  } catch (e) {
    $('results').innerHTML = `<div class="empty">${esc(e.message || '加载失败，请重试')}</div>`;
  }
})();