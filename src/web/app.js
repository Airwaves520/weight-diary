// 体重日记 2.0 应用交互层
// 所有核心功能免费开放；赞助入口只用于展示关于信息与收款码。

const state = {
  records: WeightDiaryStorage.loadRecords(),
  config: WeightDiaryStorage.loadConfig(),
  selectedMonth: toMonthValue(new Date()),
  chartMode: "month"
};

const els = {
  monthPicker: document.querySelector("#monthPicker"),
  prevMonth: document.querySelector("#prevMonth"),
  nextMonth: document.querySelector("#nextMonth"),
  entryForm: document.querySelector("#entryForm"),
  entryDate: document.querySelector("#entryDate"),
  entryWeight: document.querySelector("#entryWeight"),
  entryNote: document.querySelector("#entryNote"),
  todayButton: document.querySelector("#todayButton"),
  clearForm: document.querySelector("#clearForm"),
  targetWeight: document.querySelector("#targetWeight"),
  saveTarget: document.querySelector("#saveTarget"),
  statCount: document.querySelector("#statCount"),
  statAverage: document.querySelector("#statAverage"),
  statChange: document.querySelector("#statChange"),
  statLatest: document.querySelector("#statLatest"),
  canvas: document.querySelector("#weightChart"),
  emptyChart: document.querySelector("#emptyChart"),
  recordsTitle: document.querySelector("#records-title"),
  recordsList: document.querySelector("#recordsList"),
  recordTemplate: document.querySelector("#recordTemplate"),
  exportData: document.querySelector("#exportData"),
  exportCsv: document.querySelector("#exportCsv"),
  importData: document.querySelector("#importData"),
  vipStatus: document.querySelector("#vipStatus"),
  vipDialog: document.querySelector("#vipDialog"),
  vipDialogTitle: document.querySelector("#vipDialogTitle"),
  vipDialogCopy: document.querySelector("#vipDialogCopy"),
  activateMessage: document.querySelector("#activateMessage"),
  wechatPayTab: document.querySelector("#wechatPayTab"),
  alipayTab: document.querySelector("#alipayTab"),
  payQrImage: document.querySelector("#payQrImage"),
  saveQrButton: document.querySelector("#saveQrButton"),
  payHintText: document.querySelector("#payHintText"),
  monthlyTrend: document.querySelector("#monthlyTrend"),
  allTrend: document.querySelector("#allTrend"),
  targetLegend: document.querySelector("#targetLegend")
};

boot();

function boot() {
  els.monthPicker.value = state.selectedMonth;
  els.entryDate.value = toDateValue(new Date());
  els.targetWeight.value = state.config.target_weight || "";
  bindEvents();
  render();
}

function bindEvents() {
  els.monthPicker.addEventListener("change", () => {
    state.selectedMonth = els.monthPicker.value || toMonthValue(new Date());
    state.chartMode = "month";
    render();
  });

  els.prevMonth.addEventListener("click", () => shiftMonth(-1));
  els.nextMonth.addEventListener("click", () => shiftMonth(1));

  els.todayButton.addEventListener("click", () => {
    const today = new Date();
    els.entryDate.value = toDateValue(today);
    state.selectedMonth = toMonthValue(today);
    state.chartMode = "month";
    els.monthPicker.value = state.selectedMonth;
    render();
  });

  els.clearForm.addEventListener("click", clearForm);
  els.entryForm.addEventListener("submit", saveEntry);
  els.exportData.addEventListener("click", exportJson);
  els.importData.addEventListener("change", importJson);
  els.vipStatus.addEventListener("click", openSponsorDialog);
  els.wechatPayTab.addEventListener("click", () => switchPayMethod("wechat"));
  els.alipayTab.addEventListener("click", () => switchPayMethod("alipay"));
  els.saveQrButton.addEventListener("click", saveCurrentQr);

  els.monthlyTrend.addEventListener("click", () => {
    state.chartMode = "month";
    render();
  });

  els.allTrend.addEventListener("click", () => {
    state.chartMode = "all";
    render();
  });

  els.saveTarget.addEventListener("click", () => {
    state.config = WeightDiaryStorage.setTargetWeight(els.targetWeight.value);
    render();
  });

  els.exportCsv.addEventListener("click", () => {
    exportCsv();
  });

  window.addEventListener("resize", () => renderChart());
}

function openSponsorDialog() {
  els.vipDialogTitle.textContent = "关于《体重日记》与独立开发";
  els.vipDialogCopy.textContent = "《体重日记》会一直免费使用。它是一款纯本地存储的独立个人作品，没有任何云端服务器，也绝不上传您的任何体重与健康数据。";
  els.activateMessage.textContent = "";
  els.activateMessage.className = "activate-message";
  renderPayExperience();
  switchPayMethod("wechat");

  if (typeof els.vipDialog.showModal === "function") {
    els.vipDialog.showModal();
  } else {
    window.alert("感谢支持《体重日记》。所有核心功能已免费开放。");
  }
}

function switchPayMethod(method) {
  const isWechat = method === "wechat";
  els.wechatPayTab.classList.toggle("is-active", isWechat);
  els.alipayTab.classList.toggle("is-active", !isWechat);
  els.payQrImage.src = isWechat ? "wechat_pay.png" : "alipay.jpg";
  els.payQrImage.alt = isWechat ? "微信赞助二维码" : "支付宝赞助二维码";
}

function renderPayExperience() {
  const android = isAndroidRuntime();
  els.saveQrButton.classList.toggle("is-hidden", !android);
  els.payHintText.textContent = android
    ? "提示：点击下方按钮可保存赞助码，再打开微信/支付宝从相册识别。赞助完全自愿，不是购买功能，也不会影响任何使用权限。"
    : "提示：赞助完全自愿，不是购买功能，也不会影响任何使用权限。愿意支持的话，就当请我喝杯水。";
}

function isAndroidRuntime() {
  return /Android/i.test(navigator.userAgent || "");
}

async function saveCurrentQr() {
  const src = els.payQrImage.getAttribute("src");
  const filename = src.includes("alipay") ? "体重日记-支付宝收款码.jpg" : "体重日记-微信收款码.png";

  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    els.activateMessage.textContent = "二维码已保存或开始下载。请到相册/下载目录查看。";
    els.activateMessage.className = "activate-message is-success";
  } catch {
    window.open(src, "_blank");
    els.activateMessage.textContent = "已打开二维码图片，请长按保存到相册。";
    els.activateMessage.className = "activate-message";
  }
}

function shiftMonth(offset) {
  const [year, month] = state.selectedMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  state.selectedMonth = toMonthValue(date);
  state.chartMode = "month";
  els.monthPicker.value = state.selectedMonth;
  render();
}

function saveEntry(event) {
  event.preventDefault();
  const date = els.entryDate.value;
  const weight = Number(els.entryWeight.value);
  const note = els.entryNote.value.trim();

  if (!date || !Number.isFinite(weight)) return;

  const existingIndex = state.records.findIndex((record) => record.date === date);
  const record = {
    date,
    weight: roundOne(weight),
    note,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    state.records[existingIndex] = record;
  } else {
    state.records.push(record);
  }

  state.records = WeightDiaryStorage.saveRecords(state.records);
  state.selectedMonth = date.slice(0, 7);
  state.chartMode = "month";
  els.monthPicker.value = state.selectedMonth;
  clearForm(false);
  render();
}

function clearForm(resetDate = true) {
  if (resetDate) {
    els.entryDate.value = toDateValue(new Date());
  }
  els.entryWeight.value = "";
  els.entryNote.value = "";
  els.entryWeight.focus();
}

function editRecord(record) {
  els.entryDate.value = record.date;
  els.entryWeight.value = record.weight;
  els.entryNote.value = record.note || "";
  els.entryWeight.focus();
}

function deleteRecord(date) {
  const record = state.records.find((item) => item.date === date);
  if (!record) return;

  const ok = window.confirm(`删除 ${formatDate(date)} 的 ${record.weight} kg 记录吗？`);
  if (!ok) return;

  state.records = WeightDiaryStorage.saveRecords(state.records.filter((item) => item.date !== date));
  render();
}

function render() {
  renderVipState();
  renderStats(getMonthRecords());
  renderChart();
  renderRecords(getVisibleRecords());
}

function renderVipState() {
  els.vipStatus.textContent = "关于 / 赞助作者";
  els.vipStatus.classList.add("is-pro");
  els.targetLegend.classList.toggle("is-visible", Number.isFinite(Number(state.config.target_weight)));
  els.monthlyTrend.classList.toggle("is-active", state.chartMode === "month");
  els.allTrend.classList.toggle("is-active", state.chartMode === "all");
}

function getMonthRecords() {
  return state.records
    .filter((record) => record.date.startsWith(state.selectedMonth))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getVisibleRecords() {
  if (state.chartMode === "all") {
    return state.records.slice().sort((a, b) => a.date.localeCompare(b.date));
  }
  return getMonthRecords();
}

function renderStats(records) {
  els.statCount.textContent = `${records.length} 天`;

  if (!records.length) {
    els.statAverage.textContent = "-- kg";
    els.statChange.textContent = "-- kg";
    els.statLatest.textContent = "--";
    return;
  }

  const weights = records.map((record) => record.weight);
  const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  const change = weights[weights.length - 1] - weights[0];
  const latest = records[records.length - 1];

  els.statAverage.textContent = `${roundOne(average)} kg`;
  els.statChange.textContent = `${change > 0 ? "+" : ""}${roundOne(change)} kg`;
  els.statLatest.textContent = `${latest.weight} kg`;
}

function renderChart() {
  const chartRecords = state.chartMode === "all" ? state.records : getMonthRecords();
  const targetWeight = state.config.target_weight;
  WeightDiaryChart.render(els.canvas, els.emptyChart, chartRecords, {
    mode: state.chartMode,
    targetWeight
  });
}

function renderRecords(records) {
  els.recordsTitle.textContent = state.chartMode === "all" ? "全部日记" : "本月日记";
  els.recordsList.innerHTML = "";

  if (!records.length) {
    const empty = document.createElement("p");
    empty.className = "empty-row";
    empty.textContent = state.chartMode === "all" ? "暂无历史日记。" : "本月暂无日记，先记录一条吧。";
    els.recordsList.append(empty);
    return;
  }

  records
    .slice()
    .reverse()
    .forEach((record) => {
      const node = els.recordTemplate.content.firstElementChild.cloneNode(true);
      const main = node.querySelector(".record-main");
      node.querySelector("time").textContent = formatDate(record.date);
      node.querySelector("strong").textContent = `${record.weight} kg`;
      node.querySelector("p").textContent = record.note || "没有写日记";
      main.addEventListener("click", () => editRecord(record));
      node.querySelector(".delete-button").addEventListener("click", () => deleteRecord(record.date));
      els.recordsList.append(node);
    });
}

function exportJson() {
  const payload = JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), records: state.records }, null, 2);
  downloadText(payload, `体重日记备份-${toDateValue(new Date())}.json`, "application/json;charset=utf-8");
}

function exportCsv() {
  const header = ["日期", "体重(kg)", "日记"];
  const rows = state.records
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((record) => [record.date, record.weight, record.note || ""]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  downloadText(`\ufeff${csv}`, `体重日记全部记录-${toDateValue(new Date())}.csv`, "text/csv;charset=utf-8");
}

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const data = JSON.parse(reader.result);
      const incoming = Array.isArray(data) ? data : data.records;
      if (!Array.isArray(incoming)) throw new Error("Invalid file");

      const byDate = new Map(state.records.map((record) => [record.date, record]));
      incoming
        .filter((record) => record.date && Number.isFinite(Number(record.weight)))
        .forEach((record) => {
          byDate.set(String(record.date).slice(0, 10), {
            date: String(record.date).slice(0, 10),
            weight: roundOne(Number(record.weight)),
            note: String(record.note || ""),
            updatedAt: record.updatedAt || new Date().toISOString()
          });
        });

      state.records = WeightDiaryStorage.saveRecords(Array.from(byDate.values()));
      render();
    } catch {
      window.alert("导入失败，请选择正确的 JSON 备份文件。");
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file, "utf-8");
}

function downloadText(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toDateValue(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function toMonthValue(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0")
  ].join("-");
}

function formatDate(value) {
  const [year, month, day] = value.split("-");
  return state.chartMode === "all" ? `${year}-${month}-${day}` : `${month}月${day}日`;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}
