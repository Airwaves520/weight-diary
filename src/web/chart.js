// 体重日记 2.0 图表层
// 支持：月度趋势、全部历史趋势、Pro 目标体重参考线。

const WeightDiaryChart = (() => {
  function render(canvas, emptyEl, records, options = {}) {
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.floor(rect.width * pixelRatio);
    canvas.height = Math.floor(rect.height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const sorted = records.slice().sort((a, b) => a.date.localeCompare(b.date));
    emptyEl.classList.toggle("is-hidden", sorted.length > 0);

    drawGrid(ctx, width, height);
    if (!sorted.length) return;

    const padding = { top: 24, right: 24, bottom: 46, left: 58 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const targetWeight = Number(options.targetWeight);
    const weights = sorted.map((record) => record.weight);

    if (Number.isFinite(targetWeight)) {
      weights.push(targetWeight);
    }

    let min = Math.min(...weights);
    let max = Math.max(...weights);

    if (min === max) {
      min -= 1;
      max += 1;
    } else {
      const gap = (max - min) * 0.18;
      min -= gap;
      max += gap;
    }

    const yForWeight = (weight) => padding.top + chartHeight - ((weight - min) / (max - min)) * chartHeight;
    const points = sorted.map((record, index) => {
      const x = sorted.length === 1
        ? padding.left + chartWidth / 2
        : padding.left + (chartWidth * index) / (sorted.length - 1);
      return { x, y: yForWeight(record.weight), record };
    });

    drawAxisLabels(ctx, { height, padding, min, max });
    if (Number.isFinite(targetWeight)) {
      drawTargetLine(ctx, { width, padding, y: yForWeight(targetWeight), targetWeight });
    }
    drawLine(ctx, points, height);
    drawPoints(ctx, points);
    drawDateLabels(ctx, points, height, padding, options.mode);
  }

  function drawGrid(ctx, width, height) {
    const padding = { top: 24, right: 24, bottom: 46, left: 58 };
    const rows = 4;
    ctx.strokeStyle = "#dce5df";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= rows; i += 1) {
      const y = padding.top + ((height - padding.top - padding.bottom) * i) / rows;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();
  }

  function drawAxisLabels(ctx, { height, padding, min, max }) {
    ctx.fillStyle = "#637269";
    ctx.font = "12px Microsoft YaHei, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= 4; i += 1) {
      const value = max - ((max - min) * i) / 4;
      const y = padding.top + ((height - padding.top - padding.bottom) * i) / 4;
      ctx.fillText(`${roundOne(value)}`, padding.left - 10, y);
    }
  }

  function drawTargetLine(ctx, { width, padding, y, targetWeight }) {
    ctx.save();
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = "#c84d4d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#c84d4d";
    ctx.font = "12px Microsoft YaHei, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(`目标 ${roundOne(targetWeight)}kg`, padding.left + 8, y - 6);
    ctx.restore();
  }

  function drawLine(ctx, points, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(22, 120, 95, 0.24)");
    gradient.addColorStop(1, "rgba(22, 120, 95, 0)");

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });

    ctx.strokeStyle = "#16785f";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    if (points.length > 1) {
      ctx.lineTo(points[points.length - 1].x, height - 46);
      ctx.lineTo(points[0].x, height - 46);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  function drawPoints(ctx, points) {
    points.forEach((point) => {
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#16785f";
      ctx.lineWidth = 3;
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#17211c";
      ctx.font = "12px Microsoft YaHei, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`${point.record.weight}kg`, point.x, point.y - 9);
    });
  }

  function drawDateLabels(ctx, points, height, padding, mode) {
    ctx.fillStyle = "#637269";
    ctx.font = "12px Microsoft YaHei, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const maxLabels = mode === "all" ? 6 : 8;
    const step = Math.max(1, Math.ceil(points.length / maxLabels));
    points.forEach((point, index) => {
      if (index % step !== 0 && index !== points.length - 1) return;
      const label = mode === "all" ? point.record.date.slice(5) : point.record.date.slice(8, 10);
      ctx.fillText(label, point.x, height - padding.bottom + 18);
    });
  }

  function roundOne(value) {
    return Math.round(value * 10) / 10;
  }

  return { render };
})();
