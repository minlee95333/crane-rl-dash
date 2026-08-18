"""Regression: the 양중계획 Report must print/PDF-save as exactly one A4 page.

The report card is a fixed-height flex column laid out for A4 landscape. It
regressed once because the main row (minimap + stats) hard-claimed 140mm, which
left the gantt row only 24mm for 41.5mm of content -- the chart was clipped and
the card's own content ran 201.9mm past its 190mm box. The fix inverted the
priority: head/gantt/foot take their intrinsic height and the main row absorbs
what is left, with the card held under the 190mm printable area.

jsdom cannot fragment pages, so this drives real Chromium through Playwright and
counts pages in the produced PDF. It skips when Playwright or its browser binary
is unavailable so the rest of the suite still runs.
"""
import pathlib
import re

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
HTML = ROOT / "web" / "index.html"

# A4 landscape at the page's own 10mm margins.
CONTENT_AREA_MM = 190.0

# Fills the report with a realistic worst case: a full KPI table, a six-item
# issue list and a five-row cost table -- the content that starved the gantt.
FILL_REPORT = """
() => {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('rptSub', '시나리오 S-04 · 크레인 3기 · 양중 28건');
  set('rptMeta', '생성 2026-07-20 16:20\\n사용자 tester');
  set('rptScoreTotal', '87.4');
  set('rptScoreGrade', 'A');
  set('rptComplete', '28/28 (100%)');
  set('rptMakespan', '412.6 min');
  set('rptTravel', '3,842.5 m');
  set('rptSoft', '6 건');
  set('rptRestricted', '0 건');
  set('rptAvgLift', '14.7 min');
  set('rptCostTotal', '128,450,000');
  set('rptStamp', '2026-07-20 16:20:31');
  set('rptFootRight', 'run 4f21a9 · seed 2026');
  const issues = document.getElementById('rptIssues');
  if (issues) issues.innerHTML = [
    ['bad',  'C2 · C3 간섭 반경 중첩이 6회 발생했습니다. 동시 선회 구간 재검토 필요.'],
    ['warn', '제한구역 RZ-2 경계에서 2.4m 이내로 접근한 경로가 3건 있습니다.'],
    ['warn', '피크 시간대(120~180min) 크레인 가동률이 96%로 여유가 거의 없습니다.'],
    ['ok',   '제한구역 직접 진입 위반은 0건입니다.'],
    ['ok',   '모든 양중물이 정격하중 85% 이내에서 처리되었습니다.'],
    ['warn', 'C1 유휴시간이 전체의 18%로 재배분 여지가 있습니다.'],
  ].map(([c, t]) => `<li class="${c}">${t}</li>`).join('');
  const cost = document.getElementById('rptCostBody');
  if (cost) cost.innerHTML = [
    ['크레인 임대료', '86,400,000'], ['유휴 비용', '12,300,000'],
    ['연료비', '9,750,000'], ['인건비', '18,200,000'], ['기타 경비', '1,800,000'],
  ].map(([n, v]) => `<tr><td class="metric-name">${n}</td><td class="metric-val">${v}</td></tr>`).join('');
}
"""

# Mirrors what printPlanReport() does: clone the card into .report-print-mount
# and flip body.printing-report on.
MOUNT_FOR_PRINT = """
() => {
  const src = document.getElementById('planReportCard');
  const mount = document.createElement('div');
  mount.className = 'report-print-mount';
  mount.appendChild(src.cloneNode(true));
  document.body.appendChild(mount);
  document.body.classList.add('printing-report');
}
"""

MEASURE = """
() => {
  const card = document.querySelector('.report-print-mount .report-card');
  const mm = (px) => +(px / (96 / 25.4)).toFixed(1);
  const h = (sel) => {
    const el = card.querySelector(sel);
    return el ? mm(el.getBoundingClientRect().height) : null;
  };
  return {
    card: mm(card.getBoundingClientRect().height),
    content: mm(card.scrollHeight),
    gantt_row: h('.rpt-grid-gantt'),
    gantt_content: h('.rpt-mini-gantt'),
    gantt_canvas: h('.rpt-mini-gantt canvas'),
    map_canvas: h('.rpt-mini-map canvas'),
  };
}
"""


def _pdf_page_count(data: bytes) -> int:
    pages = len(re.findall(rb"/Type\s*/Page[^s]", data))
    if pages:
        return pages
    counts = [int(m) for m in re.findall(rb"/Count\s+(\d+)", data)]
    return max(counts) if counts else -1


@pytest.fixture(scope="module")
def printed_report(tmp_path_factory):
    playwright_api = pytest.importorskip(
        "playwright.sync_api", reason="playwright is not installed"
    )
    pdf_path = tmp_path_factory.mktemp("report") / "report.pdf"
    try:
        with playwright_api.sync_playwright() as p:
            browser = p.chromium.launch()
            try:
                page = browser.new_page()
                page.goto(HTML.as_uri())
                page.wait_for_timeout(600)
                page.evaluate(FILL_REPORT)
                page.evaluate(MOUNT_FOR_PRINT)
                page.emulate_media(media="print")
                page.wait_for_timeout(200)
                metrics = page.evaluate(MEASURE)
                page.pdf(path=str(pdf_path), prefer_css_page_size=True, print_background=True)
            finally:
                browser.close()
    except Exception as exc:  # missing browser binary, sandbox denial, ...
        pytest.skip(f"Chromium unavailable for print test: {exc}")
    return metrics, _pdf_page_count(pdf_path.read_bytes())


def test_report_prints_on_a_single_page(printed_report):
    _, pages = printed_report
    assert pages == 1, f"report should print on 1 page, got {pages}"


def test_report_card_fits_the_printable_area(printed_report):
    metrics, _ = printed_report
    assert metrics["card"] <= CONTENT_AREA_MM, (
        f"card is {metrics['card']}mm, over the {CONTENT_AREA_MM}mm printable height"
    )
    # Exact-fit is what let sub-pixel rounding spill onto a second page.
    assert metrics["card"] <= CONTENT_AREA_MM - 2.0, (
        f"card {metrics['card']}mm leaves under 2mm of rounding slack"
    )


def test_report_content_does_not_overflow_the_card(printed_report):
    metrics, _ = printed_report
    assert metrics["content"] <= metrics["card"] + 0.5, (
        f"content is {metrics['content']}mm inside a {metrics['card']}mm card"
    )


def test_gantt_band_is_not_clipped(printed_report):
    """The original defect: the gantt row was squeezed below its own content."""
    metrics, _ = printed_report
    assert metrics["gantt_canvas"] and metrics["gantt_canvas"] > 20, (
        f"gantt canvas collapsed to {metrics['gantt_canvas']}mm"
    )
    assert metrics["gantt_row"] + 0.5 >= metrics["gantt_content"], (
        f"gantt row {metrics['gantt_row']}mm is shorter than its content "
        f"{metrics['gantt_content']}mm -- the chart is being cut off"
    )


def test_minimap_still_dominates_the_page(printed_report):
    """Guard the fix from over-correcting and starving the minimap instead."""
    metrics, _ = printed_report
    assert metrics["map_canvas"] and metrics["map_canvas"] >= 90, (
        f"minimap shrank to {metrics['map_canvas']}mm"
    )
