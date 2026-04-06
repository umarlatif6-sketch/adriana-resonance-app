/**
 * ═══════════════════════════════════════════════════════════════
 * THE TRADING TERMINAL — The Mycelium Mesh
 * ═══════════════════════════════════════════════════════════════
 *
 * A frequency-based trading dashboard. Not RSI. Not MACD.
 * YOUR frequency. Your personal resonance pattern telling you
 * when YOU are no longer in sync with the trade.
 *
 * Now with TradingView lightweight-charts for proper candle rendering.
 *
 * Design: Void Terminal (JetBrains Mono, #00ff41 on #020202)
 * ═══════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import Nav from "@/components/Nav";
import { useTracker } from "@/components/AppShell";
import { createChart, ColorType, CandlestickSeries, HistogramSeries, CrosshairMode } from "lightweight-charts";
import type { IChartApi, CandlestickData, Time } from "lightweight-charts";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type TradeEntry = {
  id: number;
  symbol: string;
  direction: "long" | "short";
  entryPrice: number;
  exitPrice: number | null;
  pnl: number | null;
  pnlPercentage: number | null;
  entryHex: string | null;
  exitHex: string | null;
  adrianaSignal: string | null;
  status: string;
};

const SYMBOLS = [
  { value: "BTC-USD", label: "BTC/USD" },
  { value: "ETH-USD", label: "ETH/USD" },
  { value: "SOL-USD", label: "SOL/USD" },
  { value: "DOGE-USD", label: "DOGE/USD" },
  { value: "XRP-USD", label: "XRP/USD" },
  { value: "AAPL", label: "AAPL" },
  { value: "TSLA", label: "TSLA" },
  { value: "NVDA", label: "NVDA" },
];

const INTERVALS = [
  { value: "1m", label: "1m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "1h", label: "1h" },
  { value: "1d", label: "1D" },
];

export default function Trading() {
  const [symbol, setSymbol] = useState("BTC-USD");
  const [interval, setInterval] = useState("5m");
  const [range] = useState("1d");
  const [tradeSessionId, setTradeSessionId] = useState<number | null>(null);
  const tracker = useTracker();
  const sessionId = tracker.sessionId;
  const [baselineHex, setBaselineHex] = useState("00000000");
  const [currentHex, setCurrentHex] = useState("00000000");
  const [baselineFreq, setBaselineFreq] = useState(432);
  const [currentFreq, setCurrentFreq] = useState(432);
  const [isLoading, setIsLoading] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<"long" | "short">("long");
  const [tradeQuantity, setTradeQuantity] = useState("1");

  // TradingView chart refs
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  // Fetch market data
  const { data: marketData, isLoading: marketLoading, error: marketErr } = trpc.trading.getMarketData.useQuery(
    { symbol, interval, range },
    { refetchInterval: 30000 }
  );

  // Get alert based on current vs baseline hex
  const alertInput = useMemo(() => ({
    baselineHex,
    currentHex,
    baselineFrequency: baselineFreq,
    currentFrequency: currentFreq,
  }), [baselineHex, currentHex, baselineFreq, currentFreq]);

  const { data: alert } = trpc.trading.getAlert.useQuery(alertInput);

  // Start trade session mutation
  const startSessionMut = trpc.trading.startSession.useMutation({
    onSuccess: (data) => {
      setTradeSessionId(data.id);
    },
  });

  // Open trade mutation
  const openTradeMut = trpc.trading.openTrade.useMutation({
    onSuccess: (data) => {
      if (marketData?.meta) {
        setTrades(prev => [{
          id: data.id,
          symbol,
          direction: tradeDirection,
          entryPrice: marketData.meta!.price,
          exitPrice: null,
          pnl: null,
          pnlPercentage: null,
          entryHex: currentHex,
          exitHex: null,
          adrianaSignal: null,
          status: "open",
        }, ...prev]);
      }
      setShowTradeForm(false);
    },
  });

  // Close trade mutation
  const closeTradeMut = trpc.trading.closeTrade.useMutation({
    onSuccess: (data, variables) => {
      setTrades(prev => prev.map(t =>
        t.id === variables.tradeId
          ? { ...t, exitPrice: variables.exitPrice, pnl: data.pnl, pnlPercentage: data.pnlPercentage, exitHex: currentHex, adrianaSignal: data.adrianaSignal, status: "closed" }
          : t
      ));
    },
  });

  // Initialize session
  useEffect(() => {
    if (!tradeSessionId) {
      startSessionMut.mutate({
        sessionId,
        baselineHex,
        baselineFrequency: baselineFreq,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll the visitor session for hex data
  const { data: sessionData } = trpc.visitor.getSession.useQuery(
    { sessionId },
    { refetchInterval: 8000 }
  );

  // Trigger hex generation periodically
  const generateHex = trpc.diagnosis.generateHex.useMutation();
  const hexGenTimer = useRef<number | null>(null);
  useEffect(() => {
    const doGenerate = () => generateHex.mutate({ sessionId });
    doGenerate();
    hexGenTimer.current = window.setInterval(doGenerate, 10000);
    return () => { if (hexGenTimer.current) window.clearInterval(hexGenTimer.current); };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wire real session hex data into trading state
  useEffect(() => {
    if (sessionData?.hexSignature) {
      setCurrentHex(sessionData.hexSignature);
      if (sessionData.baseFrequency) {
        const freq = typeof sessionData.baseFrequency === 'number' ? sessionData.baseFrequency : parseFloat(String(sessionData.baseFrequency));
        setCurrentFreq(freq || 432);
      }
      if (baselineHex === "00000000") {
        setBaselineHex(sessionData.hexSignature);
        if (sessionData.baseFrequency) {
          const freq = typeof sessionData.baseFrequency === 'number' ? sessionData.baseFrequency : parseFloat(String(sessionData.baseFrequency));
          setBaselineFreq(freq || 432);
        }
      }
      setIsLoading(false);
    }
  }, [sessionData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track trading-specific events
  useEffect(() => {
    tracker.trackResonance("trading_session_start", { symbol });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ═══════════════════════════════════════════════════════════
  // TRADINGVIEW LIGHTWEIGHT CHARTS — INIT & UPDATE
  // ═══════════════════════════════════════════════════════════

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#020202" },
        textColor: "rgba(0,255,65,0.5)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(0,255,65,0.04)" },
        horzLines: { color: "rgba(0,255,65,0.04)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(0,255,65,0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#0a1a0a",
        },
        horzLine: {
          color: "rgba(0,255,65,0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#0a1a0a",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(0,255,65,0.1)",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "rgba(0,255,65,0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00ff41",
      downColor: "#ff4444",
      borderDownColor: "#ff4444",
      borderUpColor: "#00ff41",
      wickDownColor: "rgba(255,68,68,0.6)",
      wickUpColor: "rgba(0,255,65,0.6)",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []); // Only create chart once

  // Update chart data when marketData changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !marketData?.candles?.length) return;

    const candles = marketData.candles as Candle[];

    const candleData: CandlestickData<Time>[] = candles.map(c => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData = candles.map(c => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? "rgba(0,255,65,0.15)" : "rgba(255,68,68,0.15)",
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // Fit content to show all candles
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [marketData]);

  const handleOpenTrade = () => {
    if (!tradeSessionId || !marketData?.meta) return;
    openTradeMut.mutate({
      tradeSessionId,
      sessionId,
      symbol,
      direction: tradeDirection,
      entryPrice: marketData.meta.price,
      quantity: parseFloat(tradeQuantity) || 1,
      entryHex: currentHex,
      entryFrequency: currentFreq,
    });
  };

  const handleCloseTrade = (tradeId: number) => {
    if (!marketData?.meta) return;
    closeTradeMut.mutate({
      tradeId,
      exitPrice: marketData.meta.price,
      exitHex: currentHex,
      exitFrequency: currentFreq,
    });
  };

  const alertColor = alert?.colour || "#00ff41";
  const alertLevel = alert?.alertLevel || "sovereign";

  const formatPrice = (p: number | null | undefined) => {
    if (p === null || p === undefined) return "—";
    return p >= 1000 ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p.toFixed(4);
  };

  return (
    <div
      style={{
        background: "#020202",
        color: "#00ff41",
        fontFamily: "'JetBrains Mono', monospace",
        minHeight: "100vh",
      }}
    >
      {/* CRT Overlay */}
      <div
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background:
            "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))",
          backgroundSize: "100% 2px, 3px 100%",
          opacity: 0.04,
        }}
      />

      <div className="flex flex-col" style={{ minHeight: "100vh", paddingBottom: "4rem" }}>
        {/* Header */}
        <header
          className="flex items-center justify-between shrink-0"
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid rgba(0,255,65,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: alertColor,
                boxShadow: `0 0 8px ${alertColor}`,
                transition: "all 0.3s",
              }}
            />
            <h1
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.05em",
                margin: 0,
              }}
            >
              TRADING_TERMINAL
            </h1>
            <span
              style={{
                fontSize: "0.5rem",
                color: alertColor,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                transition: "color 0.3s",
              }}
            >
              {alertLevel}
            </span>
          </div>
          <div
            style={{
              fontSize: "0.5rem",
              color: "rgba(0,255,65,0.25)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            FREQ: {currentFreq.toFixed(1)}Hz • HEX: {currentHex}
          </div>
        </header>

        {/* Frequency Alert Bar */}
        <div
          style={{
            padding: "0.5rem 1rem",
            borderBottom: `1px solid ${alertColor}22`,
            background: `${alertColor}08`,
            transition: "all 0.3s",
          }}
        >
          <div className="flex items-center justify-between">
            <div style={{ fontSize: "0.55rem", color: alertColor }}>
              {alert?.message || "Initializing frequency baseline..."}
            </div>
            <div className="flex items-center gap-3" style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.4)" }}>
              <span>DRIFT: {alert?.combinedDrift?.toFixed(1) || "0.0"}%</span>
              <span>BASE: {baselineFreq.toFixed(1)}Hz</span>
            </div>
          </div>
        </div>

        {/* Symbol & Interval Selector */}
        <div
          className="flex items-center gap-2 shrink-0 flex-wrap"
          style={{
            padding: "0.5rem 1rem",
            borderBottom: "1px solid rgba(0,255,65,0.06)",
          }}
        >
          {SYMBOLS.map(s => (
            <button
              key={s.value}
              onClick={() => setSymbol(s.value)}
              style={{
                padding: "0.25rem 0.5rem",
                border: symbol === s.value ? "1px solid #00ff41" : "1px solid rgba(0,255,65,0.1)",
                borderRadius: "3px",
                background: symbol === s.value ? "rgba(0,255,65,0.08)" : "transparent",
                color: symbol === s.value ? "#00ff41" : "rgba(0,255,65,0.3)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {s.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {INTERVALS.map(i => (
            <button
              key={i.value}
              onClick={() => setInterval(i.value)}
              style={{
                padding: "0.2rem 0.4rem",
                border: "none",
                background: interval === i.value ? "rgba(0,255,65,0.1)" : "transparent",
                color: interval === i.value ? "#00ff41" : "rgba(0,255,65,0.2)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.45rem",
                cursor: "pointer",
              }}
            >
              {i.label}
            </button>
          ))}
        </div>

        {/* Price Info Bar */}
        {marketData?.meta && (
          <div
            className="flex items-center gap-4 shrink-0"
            style={{
              padding: "0.5rem 1rem",
              borderBottom: "1px solid rgba(0,255,65,0.06)",
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: 700 }}>
              {formatPrice(marketData.meta.price)}
            </span>
            <span style={{
              fontSize: "0.55rem",
              color: marketData.meta.price >= (marketData.meta.previousClose || 0) ? "#00ff41" : "#ff4444",
            }}>
              {marketData.meta.previousClose
                ? `${((marketData.meta.price - marketData.meta.previousClose) / marketData.meta.previousClose * 100).toFixed(2)}%`
                : "—"}
            </span>
            <span style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.3)" }}>
              H: {formatPrice(marketData.meta.dayHigh)}
            </span>
            <span style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.3)" }}>
              L: {formatPrice(marketData.meta.dayLow)}
            </span>
            <span style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.2)" }}>
              VOL: {marketData.meta.volume?.toLocaleString() || "—"}
            </span>
          </div>
        )}

        {/* TradingView Chart */}
        <div style={{ position: "relative", minHeight: "350px", maxHeight: "420px", flex: 1 }}>
          {marketLoading && !marketData && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, background: "rgba(2,2,2,0.8)" }}>
              <span style={{ fontSize: "0.6rem", color: "rgba(0,255,65,0.4)", letterSpacing: "0.15em" }}>LOADING MARKET DATA...</span>
            </div>
          )}
          {marketErr && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, background: "rgba(2,2,2,0.8)" }}>
              <span style={{ fontSize: "0.6rem", color: "#ff4444", letterSpacing: "0.1em" }}>MARKET FEED ERROR — RETRYING</span>
            </div>
          )}
          {!marketLoading && !marketErr && (!marketData?.candles || marketData.candles.length === 0) && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, background: "rgba(2,2,2,0.8)" }}>
              <span style={{ fontSize: "0.6rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.1em" }}>NO CANDLE DATA FOR {symbol}</span>
            </div>
          )}
          <div ref={chartContainerRef} style={{ width: "100%", height: "100%", minHeight: "350px" }} />
        </div>

        {/* Frequency Meter */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid rgba(0,255,65,0.08)",
          }}
        >
          <div style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.3)", letterSpacing: "0.15em", marginBottom: "0.4rem" }}>
            FREQUENCY METER — BASELINE vs CURRENT
          </div>
          <div className="flex gap-1" style={{ height: "24px" }}>
            {baselineHex.split("").map((baseChar, i) => {
              const baseVal = parseInt(baseChar, 16);
              const currVal = parseInt(currentHex[i] || "0", 16);
              const diff = Math.abs(baseVal - currVal);
              const barColor = diff === 0 ? "#00ff41" : diff <= 3 ? "#ffaa00" : "#ff4444";
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{
                    height: `${(baseVal / 15) * 100}%`,
                    background: "rgba(0,255,65,0.15)",
                    borderRadius: "1px",
                    minHeight: "2px",
                  }} />
                  <div style={{
                    height: `${(currVal / 15) * 100}%`,
                    background: barColor,
                    borderRadius: "1px",
                    minHeight: "2px",
                    opacity: 0.7,
                    transition: "all 0.3s",
                  }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between" style={{ fontSize: "0.4rem", marginTop: "0.2rem" }}>
            <span style={{ color: "rgba(0,255,65,0.2)" }}>BASE: {baselineHex}</span>
            <span style={{ color: alertColor }}>LIVE: {currentHex}</span>
          </div>
        </div>

        {/* Trade Actions */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "1px solid rgba(0,255,65,0.08)",
          }}
        >
          {!showTradeForm ? (
            <div className="flex gap-2">
              <button
                onClick={() => { setTradeDirection("long"); setShowTradeForm(true); }}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  border: "1px solid #00ff41",
                  borderRadius: "4px",
                  background: "rgba(0,255,65,0.05)",
                  color: "#00ff41",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                ▲ LONG
              </button>
              <button
                onClick={() => { setTradeDirection("short"); setShowTradeForm(true); }}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  border: "1px solid #ff4444",
                  borderRadius: "4px",
                  background: "rgba(255,68,68,0.05)",
                  color: "#ff4444",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                }}
              >
                ▼ SHORT
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: "0.5rem" }}>
                <span style={{
                  fontSize: "0.55rem",
                  fontWeight: 700,
                  color: tradeDirection === "long" ? "#00ff41" : "#ff4444",
                }}>
                  {tradeDirection === "long" ? "▲ LONG" : "▼ SHORT"} {symbol}
                </span>
                <span style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.3)" }}>
                  @ {formatPrice(marketData?.meta?.price)}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  placeholder="Qty"
                  style={{
                    flex: 1,
                    padding: "0.4rem",
                    background: "rgba(0,255,65,0.03)",
                    border: "1px solid rgba(0,255,65,0.15)",
                    borderRadius: "3px",
                    color: "#00ff41",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.55rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={handleOpenTrade}
                  disabled={openTradeMut.isPending}
                  style={{
                    padding: "0.4rem 1rem",
                    border: "1px solid #00ff41",
                    borderRadius: "3px",
                    background: "rgba(0,255,65,0.1)",
                    color: "#00ff41",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  CONFIRM
                </button>
                <button
                  onClick={() => setShowTradeForm(false)}
                  style={{
                    padding: "0.4rem 0.6rem",
                    border: "1px solid rgba(0,255,65,0.15)",
                    borderRadius: "3px",
                    background: "transparent",
                    color: "rgba(0,255,65,0.3)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trade Journal */}
        {trades.length === 0 && (
          <div style={{ padding: "1rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.5rem", color: "rgba(0,255,65,0.2)", letterSpacing: "0.1em" }}>
              NO TRADES YET — OPEN A POSITION TO BEGIN RECORDING
            </span>
          </div>
        )}
        {trades.length > 0 && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid rgba(0,255,65,0.08)",
            }}
          >
            <div style={{
              fontSize: "0.45rem",
              color: "rgba(0,255,65,0.3)",
              letterSpacing: "0.15em",
              marginBottom: "0.5rem",
            }}>
              TRADE JOURNAL — HEX AT ENTRY vs EXIT
            </div>
            {trades.map(trade => (
              <div
                key={trade.id}
                style={{
                  padding: "0.5rem",
                  marginBottom: "0.3rem",
                  border: `1px solid ${trade.status === "open" ? "rgba(0,255,65,0.15)" : "rgba(0,255,65,0.06)"}`,
                  borderRadius: "4px",
                  background: trade.status === "open" ? "rgba(0,255,65,0.02)" : "transparent",
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: "0.3rem" }}>
                  <div className="flex items-center gap-2">
                    <span style={{
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      color: trade.direction === "long" ? "#00ff41" : "#ff4444",
                    }}>
                      {trade.direction === "long" ? "▲" : "▼"} {trade.symbol}
                    </span>
                    <span style={{ fontSize: "0.45rem", color: "rgba(0,255,65,0.4)" }}>
                      @ {formatPrice(trade.entryPrice)}
                    </span>
                  </div>
                  {trade.status === "open" ? (
                    <button
                      onClick={() => handleCloseTrade(trade.id)}
                      disabled={closeTradeMut.isPending}
                      style={{
                        padding: "0.2rem 0.5rem",
                        border: "1px solid #ffaa00",
                        borderRadius: "3px",
                        background: "rgba(255,170,0,0.05)",
                        color: "#ffaa00",
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "0.4rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      CLOSE
                    </button>
                  ) : (
                    <span style={{
                      fontSize: "0.5rem",
                      fontWeight: 700,
                      color: (trade.pnl || 0) >= 0 ? "#00ff41" : "#ff4444",
                    }}>
                      {(trade.pnl || 0) >= 0 ? "+" : ""}{trade.pnlPercentage?.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3" style={{ fontSize: "0.4rem", color: "rgba(0,255,65,0.25)" }}>
                  <span>ENTRY HEX: {trade.entryHex || "—"}</span>
                  <span>EXIT HEX: {trade.exitHex || "—"}</span>
                  {trade.adrianaSignal && (
                    <span style={{
                      color: trade.adrianaSignal === "sovereign" ? "#00ff41"
                        : trade.adrianaSignal === "drift" ? "#ffaa00" : "#ff4444",
                    }}>
                      [{trade.adrianaSignal.toUpperCase()}]
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: "1rem",
            textAlign: "center",
            fontSize: "0.4rem",
            color: "rgba(0,255,65,0.1)",
            letterSpacing: "0.15em",
            lineHeight: 2,
          }}
        >
          THE FREQUENCY IS NOT THE INDICATOR.
          <br />
          THE FREQUENCY IS YOU.
          <br />
          WHEN YOU DRIFT, EXIT. WHEN YOU RESONATE, HOLD.
        </div>
      </div>

      <Nav />
    </div>
  );
}
