import React, { useEffect, useRef, useState } from "react";

// Fixed knob size — never changes regardless of zoom
const KNOB_RADIUS = 6;
const KNOB_COLOR = "#ffffff";
const KNOB_BORDER = "#32CD32";
const LINE_COLOR = "#32CD32";
const FILL_COLOR = "rgba(50, 205, 50, 0.12)";

export default function DrawingOverlay({ chart, series, activeTool, chartContainer }) {
  const canvasRef = useRef(null);

  const [drawings, setDrawings] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const stateRef = useRef({
    drawings: [],
    activeDrawing: null,
    draggingHandle: null,
    hoveredHandle: null,
    chart,
    series,
  });

  // Keep chart/series refs fresh
  useEffect(() => {
    stateRef.current.chart = chart;
    stateRef.current.series = series;
  }, [chart, series]);

  useEffect(() => {
    stateRef.current.drawings = drawings;
  }, [drawings]);

  // ─── Canvas Setup + Render Loop ───────────────────────────────────────────
  useEffect(() => {
    if (!chart || !series || !canvasRef.current || !chartContainer) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const syncCanvasSize = () => {
      // Match the canvas exactly to the chartContainer size
      const rect = chartContainer.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    syncCanvasSize();

    let animFrameId;
    const render = () => {
      const { chart: c, series: s } = stateRef.current;
      if (!c || !s) { animFrameId = requestAnimationFrame(render); return; }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const allDrawings = [...stateRef.current.drawings];
      if (stateRef.current.activeDrawing) allDrawings.push(stateRef.current.activeDrawing);

      for (const d of allDrawings) drawShape(ctx, d, c, s, width, height);
      for (const d of allDrawings) drawKnobs(ctx, d, c, s);

      animFrameId = requestAnimationFrame(render);
    };
    render();

    const ro = new ResizeObserver(syncCanvasSize);
    ro.observe(chartContainer);

    return () => {
      cancelAnimationFrame(animFrameId);
      ro.disconnect();
    };
  }, [chart, series, chartContainer]);

  // ─── Drawing Helpers ───────────────────────────────────────────────────────
  const getCoords = (point, c, s) => {
    if (!point?.time || point.price === undefined) return null;
    try {
      const x = c.timeScale().timeToCoordinate(point.time);
      const y = s.priceToCoordinate(point.price);
      if (x == null || y == null) return null;
      return { x, y };
    } catch { return null; }
  };

  const drawShape = (ctx, d, c, s, width, height) => {
    if (d.points.length === 0) return;
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.fillStyle = FILL_COLOR;

    const p1 = getCoords(d.points[0], c, s);
    if (!p1) return;

    if (d.type === "horizontal") {
      ctx.beginPath();
      ctx.moveTo(0, p1.y);
      ctx.lineTo(width, p1.y);
      ctx.stroke();
    } else if (d.type === "vertical") {
      ctx.beginPath();
      ctx.moveTo(p1.x, 0);
      ctx.lineTo(p1.x, height);
      ctx.stroke();
    } else if (d.points.length >= 2) {
      const p2 = getCoords(d.points[1], c, s);
      if (!p2) return;
      if (d.type === "trendline") {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      } else if (d.type === "rectangle") {
        ctx.beginPath();
        ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  const drawKnobs = (ctx, d, c, s) => {
    for (let i = 0; i < d.points.length; i++) {
      const p = getCoords(d.points[i], c, s);
      if (!p) continue;
      const isHot =
        stateRef.current.hoveredHandle?.drawingId === d.id &&
        stateRef.current.hoveredHandle?.pointIndex === i;

      ctx.beginPath();
      ctx.arc(p.x, p.y, KNOB_RADIUS, 0, 2 * Math.PI);
      ctx.fillStyle = isHot ? KNOB_BORDER : KNOB_COLOR;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = KNOB_BORDER;
      ctx.stroke();
    }
  };

  // ─── Hit Testing ───────────────────────────────────────────────────────────
  const getHitHandle = (x, y) => {
    const { chart: c, series: s } = stateRef.current;
    const pad = KNOB_RADIUS + 5;
    for (const d of stateRef.current.drawings) {
      for (let i = 0; i < d.points.length; i++) {
        const p = getCoords(d.points[i], c, s);
        if (!p) continue;
        if (Math.hypot(p.x - x, p.y - y) <= pad) {
          return { drawingId: d.id, pointIndex: i };
        }
      }
    }
    return null;
  };

  // ─── Coordinate helper: canvas-relative from pointer event ────────────────
  const canvasXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // ─── Pointer Events ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainer || !canvasRef.current) return;
    const canvas = canvasRef.current;

    const onDown = (e) => {
      if (!canvasRef.current) return;
      const { x, y } = canvasXY(e);
      const { chart: c, series: s } = stateRef.current;

      // Try to grab an existing handle first
      const hit = getHitHandle(x, y);
      if (hit) {
        e.preventDefault();
        e.stopPropagation();
        stateRef.current.draggingHandle = hit;
        setIsDragging(true);
        return;
      }

      // Start a new drawing
      if (activeTool && activeTool !== "cursor") {
        e.preventDefault();
        e.stopPropagation();
        const time = c.timeScale().coordinateToTime(x);
        const price = s.coordinateToPrice(y);
        if (!time || price === null) return;

        const newDrawing = {
          id: Date.now().toString(),
          type: activeTool,
          points: [{ time, price }],
        };

        if (activeTool === "horizontal" || activeTool === "vertical") {
          setDrawings((prev) => [...prev, newDrawing]);
        } else {
          stateRef.current.activeDrawing = newDrawing;
        }
      }
    };

    const onMove = (e) => {
      if (!canvasRef.current) return;
      const { x, y } = canvasXY(e);
      const { chart: c, series: s } = stateRef.current;
      const time = c.timeScale().coordinateToTime(x);
      const price = s.coordinateToPrice(y);

      // Dragging a handle
      if (stateRef.current.draggingHandle) {
        e.preventDefault();
        const { drawingId, pointIndex } = stateRef.current.draggingHandle;
        if (time && price !== null) {
          setDrawings((prev) =>
            prev.map((d) => {
              if (d.id !== drawingId) return d;
              const pts = [...d.points];
              pts[pointIndex] = { time, price };
              return { ...d, points: pts };
            })
          );
        }
        return;
      }

      // Previewing active drawing second point
      if (stateRef.current.activeDrawing) {
        if (time && price !== null) {
          stateRef.current.activeDrawing.points[1] = { time, price };
        }
        return;
      }

      // Hover detection
      const hit = getHitHandle(x, y);
      if (hit) {
        stateRef.current.hoveredHandle = hit;
        canvas.style.cursor = "grab";
        setHovered(true);
      } else {
        stateRef.current.hoveredHandle = null;
        canvas.style.cursor = activeTool !== "cursor" ? "crosshair" : "default";
        setHovered(false);
      }
    };

    const onUp = (e) => {
      if (stateRef.current.draggingHandle) {
        stateRef.current.draggingHandle = null;
        setIsDragging(false);
      } else if (stateRef.current.activeDrawing) {
        const ad = stateRef.current.activeDrawing;
        if (ad.points.length >= 2) {
          setDrawings((prev) => [...prev, ad]);
        }
        stateRef.current.activeDrawing = null;
      }
    };

    // Listen on the canvas itself — it always covers the chart area
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [activeTool, chart, series, chartContainer]);

  // In cursor mode and nothing is hovered/dragged → pass through to chart
  const pointerEvents =
    activeTool !== "cursor" || hovered || isDragging ? "auto" : "none";

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents,
        touchAction: "none",
        cursor: activeTool !== "cursor" ? "crosshair" : "default",
      }}
    />
  );
}
