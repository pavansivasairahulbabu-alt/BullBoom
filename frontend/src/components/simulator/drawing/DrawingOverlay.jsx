import { useEffect, useRef, useState } from "react";

const KNOB_RADIUS = 6;
const GREEN = "#32CD32";
const RED = "#FF4D4D";
const POSITION_TYPES = new Set(["long-position", "short-position"]);

export default function DrawingOverlay({
  chart,
  series,
  activeTool,
  chartContainer,
  currentPrice,
  symbol,
}) {
  const canvasRef = useRef(null);
  const editorRefs = useRef(new Map());
  const [drawings, setDrawings] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const stateRef = useRef({
    drawings: [],
    activeDrawing: null,
    drag: null,
    hoveredHandle: null,
    chart,
    series,
  });

  useEffect(() => {
    stateRef.current.chart = chart;
    stateRef.current.series = series;
  }, [chart, series]);

  useEffect(() => {
    stateRef.current.drawings = drawings;
  }, [drawings]);

  const getCoords = (point, currentChart, currentSeries) => {
    if (!point || point.time == null || point.price == null) return null;
    try {
      const x = currentChart.timeScale().timeToCoordinate(point.time);
      const y = currentSeries.priceToCoordinate(point.price);
      return x == null || y == null ? null : { x, y };
    } catch {
      return null;
    }
  };

  const drawKnob = (ctx, x, y, hot = false) => {
    ctx.beginPath();
    ctx.arc(x, y, KNOB_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = hot ? GREEN : "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = GREEN;
    ctx.stroke();
  };

  const drawPosition = (ctx, drawing, currentChart, currentSeries, canvasWidth) => {
    if (drawing.points.length < 3) return;
    const entry = getCoords(drawing.points[0], currentChart, currentSeries);
    const target = getCoords(drawing.points[1], currentChart, currentSeries);
    const stop = getCoords(drawing.points[2], currentChart, currentSeries);
    if (!entry || !target || !stop) return;

    const x1 = entry.x;
    const x2 = target.x;
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const boxWidth = Math.max(1, right - left);
    const isClosed = drawing.tradeState === "closed";
    const completionColor = drawing.status === "target-hit" ? GREEN : RED;

    ctx.fillStyle = "rgba(50, 205, 50, 0.18)";
    ctx.fillRect(left, Math.min(entry.y, target.y), boxWidth, Math.abs(target.y - entry.y));
    ctx.fillStyle = "rgba(255, 77, 77, 0.18)";
    ctx.fillRect(left, Math.min(entry.y, stop.y), boxWidth, Math.abs(stop.y - entry.y));

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = GREEN;
    ctx.strokeRect(left, Math.min(entry.y, target.y), boxWidth, Math.abs(target.y - entry.y));
    ctx.strokeStyle = RED;
    ctx.strokeRect(left, Math.min(entry.y, stop.y), boxWidth, Math.abs(stop.y - entry.y));
    if (isClosed) {
      const top = Math.min(target.y, stop.y);
      const bottom = Math.max(target.y, stop.y);
      ctx.fillStyle = drawing.status === "target-hit"
        ? "rgba(50, 205, 50, 0.16)"
        : "rgba(255, 77, 77, 0.16)";
      ctx.fillRect(left, top, boxWidth, bottom - top);
      ctx.strokeStyle = completionColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(left, top, boxWidth, bottom - top);
    }
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(left, entry.y);
    ctx.lineTo(right, entry.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const isLong = drawing.type === "long-position";
    const entryPrice = drawing.points[0].price;
    const targetPrice = drawing.points[1].price;
    const stopPrice = drawing.points[2].price;
    const risk = isLong ? entryPrice - stopPrice : stopPrice - entryPrice;
    const reward = isLong ? targetPrice - entryPrice : entryPrice - targetPrice;
    const ratio = risk > 0 ? reward / risk : 0;
    const quantity = Math.max(1, Number(drawing.quantity) || 1);
    const riskAmount = risk * quantity;
    const rewardAmount = reward * quantity;
    const capitalRequired = entryPrice * quantity;
    const format = (value) => Number(value).toFixed(2);
    const lines = [
      [`Entry Price`, format(entryPrice), "#FFFFFF"],
      [`Stop Loss`, format(stopPrice), RED],
      [`Target Price`, format(targetPrice), GREEN],
      [`Quantity`, quantity, "#FFFFFF"],
      ...(drawing.lots ? [[`Lots`, drawing.lots, "#FFFFFF"]] : []),
      [`Trade State`, (drawing.tradeState || "active").toUpperCase(), isClosed ? completionColor : "#3B82F6"],
      [`Risk Amount`, format(riskAmount), RED],
      [`Reward Amount`, format(rewardAmount), GREEN],
      [`Risk/Reward Ratio`, `1 : ${format(ratio)}`, "#FFD166"],
      [`Capital Required`, format(capitalRequired), "#60A5FA"],
    ];

    const panelWidth = 172;
    const panelHeight = 32 + lines.length * 15;
    const panelX = right + panelWidth + 8 < canvasWidth ? right + 8 : Math.max(4, left - panelWidth - 8);
    const panelY = Math.max(4, Math.min(target.y, stop.y));
    const editor = editorRefs.current.get(drawing.id);
    if (editor) {
      editor.style.left = `${panelX}px`;
      editor.style.top = `${panelY + panelHeight + 6}px`;
    }
    ctx.fillStyle = "rgba(5, 8, 22, 0.94)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, 7);
    ctx.fill();
    ctx.stroke();
    const status = drawing.status || "active";
    const statusLabel = status === "target-hit" ? "TARGET HIT" : status === "stop-loss-hit" ? "STOP LOSS HIT" : "ACTIVE";
    const statusColor = status === "target-hit" ? GREEN : status === "stop-loss-hit" ? RED : "#3B82F6";
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.roundRect(panelX + 7, panelY + 6, ctx.measureText(statusLabel).width + 14, 18, 5);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 10px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(statusLabel, panelX + 14, panelY + 15);
    ctx.font = "11px Inter, system-ui, sans-serif";
    ctx.textBaseline = "middle";
    lines.forEach(([label, value, color], index) => {
      const y = panelY + 34 + index * 15;
      ctx.fillStyle = "#B8C0D4";
      ctx.textAlign = "left";
      ctx.fillText(label, panelX + 8, y);
      ctx.fillStyle = color;
      ctx.textAlign = "right";
      ctx.fillText(value, panelX + panelWidth - 8, y);
    });
  };

  const drawShape = (ctx, drawing, currentChart, currentSeries, width, height) => {
    if (!drawing.points.length) return;
    if (POSITION_TYPES.has(drawing.type)) {
      drawPosition(ctx, drawing, currentChart, currentSeries, width);
      return;
    }
    const p1 = getCoords(drawing.points[0], currentChart, currentSeries);
    if (!p1) return;
    ctx.strokeStyle = GREEN;
    ctx.fillStyle = "rgba(50, 205, 50, 0.12)";
    ctx.lineWidth = 2;
    if (drawing.type === "horizontal") {
      ctx.beginPath(); ctx.moveTo(0, p1.y); ctx.lineTo(width, p1.y); ctx.stroke();
    } else if (drawing.type === "vertical") {
      ctx.beginPath(); ctx.moveTo(p1.x, 0); ctx.lineTo(p1.x, height); ctx.stroke();
    } else if (drawing.points.length >= 2) {
      const p2 = getCoords(drawing.points[1], currentChart, currentSeries);
      if (!p2) return;
      if (drawing.type === "trendline") {
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
      } else if (drawing.type === "rectangle") {
        ctx.beginPath(); ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y); ctx.fill(); ctx.stroke();
      }
    }
  };

  const drawHandles = (ctx, drawing, currentChart, currentSeries) => {
    if (POSITION_TYPES.has(drawing.type) && drawing.tradeState === "closed") return;
    drawing.points.forEach((point, pointIndex) => {
      const coords = getCoords(point, currentChart, currentSeries);
      if (!coords) return;
      const hot = stateRef.current.hoveredHandle?.drawingId === drawing.id
        && stateRef.current.hoveredHandle?.pointIndex === pointIndex;
      drawKnob(ctx, coords.x, coords.y, hot);
    });
  };

  useEffect(() => {
    if (!chart || !series || !canvasRef.current || !chartContainer) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const syncCanvasSize = () => {
      const rect = chartContainer.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    syncCanvasSize();
    const observer = new ResizeObserver(syncCanvasSize);
    observer.observe(chartContainer);
    let frame;
    const render = () => {
      const { chart: currentChart, series: currentSeries } = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const all = [...stateRef.current.drawings];
      if (stateRef.current.activeDrawing) all.push(stateRef.current.activeDrawing);
      all.forEach((drawing) => drawShape(ctx, drawing, currentChart, currentSeries, canvas.width, canvas.height));
      all.forEach((drawing) => drawHandles(ctx, drawing, currentChart, currentSeries));
      frame = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
    // Rendering helpers read the latest chart state through stateRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, series, chartContainer]);

  const canvasXY = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const getHitHandle = (x, y) => {
    const { chart: currentChart, series: currentSeries } = stateRef.current;
    for (const drawing of [...stateRef.current.drawings].reverse()) {
      if (POSITION_TYPES.has(drawing.type) && drawing.tradeState === "closed") continue;
      for (let i = 0; i < drawing.points.length; i += 1) {
        const point = getCoords(drawing.points[i], currentChart, currentSeries);
        if (point && Math.hypot(point.x - x, point.y - y) <= KNOB_RADIUS + 6) {
          return { drawingId: drawing.id, pointIndex: i };
        }
      }
    }
    return null;
  };

  const getHitPosition = (x, y) => {
    const { chart: currentChart, series: currentSeries } = stateRef.current;
    for (const drawing of [...stateRef.current.drawings].reverse()) {
      if (!POSITION_TYPES.has(drawing.type) || drawing.points.length < 3) continue;
      if (drawing.tradeState === "closed") continue;
      const points = drawing.points.map((point) => getCoords(point, currentChart, currentSeries));
      if (points.some((point) => !point)) continue;
      const left = Math.min(points[0].x, points[1].x);
      const right = Math.max(points[0].x, points[1].x);
      const top = Math.min(...points.map((point) => point.y));
      const bottom = Math.max(...points.map((point) => point.y));
      if (x >= left && x <= right && y >= top && y <= bottom) return drawing;
    }
    return null;
  };

  useEffect(() => {
    if (!chartContainer || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const onDown = (event) => {
      const { x, y } = canvasXY(event);
      const { chart: currentChart, series: currentSeries } = stateRef.current;
      const handle = getHitHandle(x, y);
      if (handle) {
        event.preventDefault();
        event.stopPropagation();
        stateRef.current.drag = { kind: "handle", ...handle };
        setIsDragging(true);
        canvas.setPointerCapture?.(event.pointerId);
        return;
      }
      const position = getHitPosition(x, y);
      if (position) {
        event.preventDefault();
        event.stopPropagation();
        stateRef.current.drag = {
          kind: "position",
          drawingId: position.id,
          startX: x,
          startY: y,
          original: position.points.map((point) => getCoords(point, currentChart, currentSeries)),
        };
        setIsDragging(true);
        canvas.setPointerCapture?.(event.pointerId);
        return;
      }
      if (!activeTool || activeTool === "cursor") return;
      event.preventDefault();
      event.stopPropagation();
      const time = currentChart.timeScale().coordinateToTime(x);
      const price = currentSeries.coordinateToPrice(y);
      if (time == null || price == null) return;
      const drawing = {
        id: `${Date.now()}-${Math.random()}`,
        type: activeTool,
        points: [{ time, price }],
        ...(POSITION_TYPES.has(activeTool)
          ? { quantity: 1, lots: "", status: "active", tradeState: "active", openedAt: new Date().toISOString() }
          : {}),
      };
      if (activeTool === "horizontal" || activeTool === "vertical") {
        setDrawings((previous) => [...previous, drawing]);
      } else {
        stateRef.current.activeDrawing = drawing;
      }
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onMove = (event) => {
      const { x, y } = canvasXY(event);
      const { chart: currentChart, series: currentSeries, drag } = stateRef.current;
      const time = currentChart.timeScale().coordinateToTime(x);
      const price = currentSeries.coordinateToPrice(y);

      if (drag?.kind === "handle" && time != null && price != null) {
        event.preventDefault();
        setDrawings((previous) => previous.map((drawing) => {
          if (drawing.id !== drag.drawingId) return drawing;
          const points = drawing.points.map((point) => ({ ...point }));
          if (POSITION_TYPES.has(drawing.type)) {
            const entry = points[0].price;
            const epsilon = Math.max(Math.abs(entry) * 0.000001, 0.01);
            if (drag.pointIndex === 0) {
              const low = Math.min(points[1].price, points[2].price) + epsilon;
              const high = Math.max(points[1].price, points[2].price) - epsilon;
              points[0] = { time, price: Math.max(low, Math.min(high, price)) };
            } else if (drag.pointIndex === 1) {
              const targetPrice = drawing.type === "long-position"
                ? Math.max(entry + epsilon, price)
                : Math.min(entry - epsilon, price);
              points[1] = { time, price: targetPrice };
              points[2].time = time;
            } else {
              const stopPrice = drawing.type === "long-position"
                ? Math.min(entry - epsilon, price)
                : Math.max(entry + epsilon, price);
              points[2] = { time, price: stopPrice };
              points[1].time = time;
            }
          } else {
            points[drag.pointIndex] = { time, price };
          }
          return { ...drawing, points };
        }));
        return;
      }

      if (drag?.kind === "position") {
        event.preventDefault();
        const dx = x - drag.startX;
        const dy = y - drag.startY;
        const translated = drag.original.map((point) => ({
          time: currentChart.timeScale().coordinateToTime(point.x + dx),
          price: currentSeries.coordinateToPrice(point.y + dy),
        }));
        if (translated.every((point) => point.time != null && point.price != null)) {
          setDrawings((previous) => previous.map((drawing) =>
            drawing.id === drag.drawingId ? { ...drawing, points: translated } : drawing));
        }
        return;
      }

      if (stateRef.current.activeDrawing && time != null && price != null) {
        const drawing = stateRef.current.activeDrawing;
        if (POSITION_TYPES.has(drawing.type)) {
          const entry = drawing.points[0];
          const distance = Math.max(Math.abs(price - entry.price), Math.abs(entry.price) * 0.0001, 0.01);
          const isLong = drawing.type === "long-position";
          drawing.points[1] = { time, price: isLong ? entry.price + distance : entry.price - distance };
          drawing.points[2] = { time, price: isLong ? entry.price - distance / 2 : entry.price + distance / 2 };
        } else {
          drawing.points[1] = { time, price };
        }
        return;
      }

      const hitHandle = getHitHandle(x, y);
      const hitPosition = getHitPosition(x, y);
      stateRef.current.hoveredHandle = hitHandle;
      const isHovering = Boolean(hitHandle || hitPosition);
      canvas.style.cursor = hitHandle ? "grab" : hitPosition ? "move" : activeTool !== "cursor" ? "crosshair" : "default";
      setHovered(isHovering);
    };

    const onUp = (event) => {
      if (stateRef.current.drag) {
        stateRef.current.drag = null;
        setIsDragging(false);
      } else if (stateRef.current.activeDrawing) {
        const drawing = stateRef.current.activeDrawing;
        if (drawing.points.length >= 2) setDrawings((previous) => [...previous, drawing]);
        stateRef.current.activeDrawing = null;
      }
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
    // Hit tests also read the latest drawings through stateRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool, chart, series, chartContainer]);

  const pointerEvents = activeTool !== "cursor" || hovered || isDragging ? "auto" : "none";
  const updatePositionField = (drawingId, field, value) => {
    setDrawings((previous) => previous.map((drawing) =>
      drawing.id === drawingId ? { ...drawing, [field]: value } : drawing));
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-label="Chart drawings"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          pointerEvents,
          touchAction: "none",
          cursor: activeTool !== "cursor" ? "crosshair" : "default",
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        {drawings.filter((drawing) => POSITION_TYPES.has(drawing.type) && drawing.tradeState !== "closed").map((drawing) => (
          <div
            key={drawing.id}
            ref={(node) => {
              if (node) editorRefs.current.set(drawing.id, node);
              else editorRefs.current.delete(drawing.id);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            className="pointer-events-auto absolute flex w-[172px] gap-1.5 rounded-lg border border-white/10 bg-[#050816]/95 p-1.5 shadow-xl backdrop-blur"
          >
            <label className="min-w-0 flex-1 text-[10px] text-[#B8C0D4]">
              Quantity
              <input
                type="number"
                min="1"
                step="1"
                value={drawing.quantity}
                onChange={(event) => updatePositionField(drawing.id, "quantity", event.target.value)}
                onBlur={() => updatePositionField(drawing.id, "quantity", Math.max(1, Number(drawing.quantity) || 1))}
                className="mt-0.5 w-full rounded border border-white/10 bg-[#0B1220] px-1.5 py-1 text-xs text-white outline-none focus:border-[#32CD32]"
              />
            </label>
            <label className="min-w-0 flex-1 text-[10px] text-[#B8C0D4]">
              Lots <span className="text-white/40">(optional)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={drawing.lots}
                placeholder="—"
                onChange={(event) => updatePositionField(drawing.id, "lots", event.target.value)}
                className="mt-0.5 w-full rounded border border-white/10 bg-[#0B1220] px-1.5 py-1 text-xs text-white outline-none placeholder:text-white/30 focus:border-[#32CD32]"
              />
            </label>
          </div>
        ))}
      </div>
    </>
  );
}
