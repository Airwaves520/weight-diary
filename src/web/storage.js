// 体重日记 2.0 数据层
// 说明：所有数据仍保存在本机 localStorage，保证 1.0 用户已有记录不被破坏。

const WeightDiaryStorage = (() => {
  const recordsKey = "fitness-weight-diary-v1";
  const configKey = "fitness-weight-diary-config-v2";
  const defaultConfig = {
    is_pro: true,
    target_weight: null,
    activated_at: null
  };

  function loadRecords() {
    try {
      const raw = localStorage.getItem(recordsKey);
      const records = raw ? JSON.parse(raw) : [];
      return Array.isArray(records) ? normalizeRecords(records) : [];
    } catch {
      return [];
    }
  }

  function saveRecords(records) {
    const normalized = normalizeRecords(records).sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(recordsKey, JSON.stringify(normalized));
    return normalized;
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(configKey);
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...defaultConfig, ...parsed, is_pro: true };
    } catch {
      return { ...defaultConfig };
    }
  }

  function saveConfig(config) {
    const next = { ...defaultConfig, ...config, is_pro: true };
    localStorage.setItem(configKey, JSON.stringify(next));
    return next;
  }

  function setTargetWeight(value) {
    const config = loadConfig();
    const numeric = Number(value);
    const target = Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 10) / 10 : null;
    return saveConfig({ ...config, target_weight: target });
  }

  function normalizeRecords(records) {
    return records
      .filter((record) => record && record.date && Number.isFinite(Number(record.weight)))
      .map((record) => ({
        date: String(record.date).slice(0, 10),
        weight: Math.round(Number(record.weight) * 10) / 10,
        note: String(record.note || ""),
        updatedAt: record.updatedAt || new Date().toISOString()
      }));
  }

  return {
    loadRecords,
    saveRecords,
    loadConfig,
    saveConfig,
    setTargetWeight
  };
})();
