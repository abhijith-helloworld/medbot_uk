"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import URDFRobot from "./URDFRobot";
import { appConfig } from "@/config/appConfig";
import { urdfJoints } from "./urdfJoints";
import {
    Rotate3D,
    Minus,
    Plus,
    RefreshCw,
    Home,
} from "lucide-react";

/* ===================== Types ===================== */
interface JointUpdate {
    type: string;
    urdfJoints?: Record<string, number>;
    joints?: Record<string, number>;
    source?: string;
    role?: string;
}

/* ===================== Utils ===================== */
const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

/* ===================== Component ===================== */
export default function RobotArmView() {
    /* -------- State -------- */
    const [autoRotate, setAutoRotate] = useState(true);
    const [resetView, setResetView] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);
    const [isDark, setIsDark] = useState(false);

    const [joints, setJoints] = useState<Record<string, number>>(
        Object.fromEntries(Object.keys(urdfJoints).map((k) => [k, 0]))
    );

    /* -------- Refs -------- */
    const wsRef = useRef<WebSocket | null>(null);
    const pendingMessages = useRef<JointUpdate[]>([]);
    const sendTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
    const rafRef = useRef<Record<string, number>>({});
    const isUserDragging = useRef(false);
    const lastSentValue = useRef<Record<string, number>>({});
    const isMounted = useRef(true);

    /* ===================== Dark Mode Detection ===================== */
    useEffect(() => {
        const checkDark = () => {
            if (!isMounted.current) return;
            const isDarkMode = document.documentElement.classList.contains("dark");
            setIsDark(isDarkMode);
        };

        checkDark();

        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        window.addEventListener("theme-change", checkDark);

        return () => {
            observer.disconnect();
            window.removeEventListener("theme-change", checkDark);
        };
    }, []);

    /* ===================== WebSocket ===================== */
    useEffect(() => {
        isMounted.current = true;
        const ws = new WebSocket(appConfig.ws.arm);
        wsRef.current = ws;

        ws.onopen = () => {
            if (!isMounted.current) return;
            console.log("✅ WS connected");
            setWsConnected(true);

            // Send any pending messages
            pendingMessages.current.forEach((msg) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(msg));
                }
            });
            pendingMessages.current = [];
        };

        ws.onmessage = (e) => {
            if (!isMounted.current) return;
            try {
                const message: JointUpdate = JSON.parse(e.data);
                console.log("📥 WS received:", message);

                // Accept both 'urdfJoints' and 'joints' fields for compatibility
                const data = message.urdfJoints || message.joints;

                // Ignore messages that originated from this UI
                if (message.source === "ui") {
                    console.log("⏭️ Skipping own message");
                    return;
                }

                // Don't update if user is currently dragging
                if (isUserDragging.current) {
                    console.log("🚫 User is dragging, skipping update");
                    return;
                }

                // Process messages from broadcast (other clients) or other sources
                if (!data || typeof data !== "object") {
                    console.log("⚠️ No valid data found");
                    return;
                }

                console.log("✅ Processing server update...");

                setJoints((prev) => {
                    const next = { ...prev };
                    let updated = false;

                    Object.entries(data).forEach(([k, v]) => {
                        if (k in next && typeof v === "number") {
                            const cfg = urdfJoints[k as keyof typeof urdfJoints];
                            if (cfg) {
                                const clampedValue = Math.max(
                                    cfg.min,
                                    Math.min(cfg.max, v)
                                );
                                if (Math.abs(next[k] - clampedValue) > 0.01) {
                                    console.log(`  ${k}: ${prev[k]} → ${clampedValue}`);
                                    next[k] = clampedValue;
                                    updated = true;
                                }
                            }
                        }
                    });

                    if (updated) {
                        console.log("✅ Joints updated:", next);
                    }

                    return updated ? next : prev;
                });
            } catch (err) {
                console.error("❌ WS parse error", err);
            }
        };

        ws.onerror = (error) => {
            console.error("❌ WS error", error);
            if (isMounted.current) {
                setWsConnected(false);
            }
        };

        ws.onclose = () => {
            console.log("🔌 WS closed");
            if (isMounted.current) {
                setWsConnected(false);
            }
        };

        return () => {
            isMounted.current = false;
            
            // Clean up all timeouts
            Object.values(sendTimeoutRef.current).forEach(clearTimeout);
            sendTimeoutRef.current = {};
            
            // Clean up all RAFs
            Object.values(rafRef.current).forEach(cancelAnimationFrame);
            rafRef.current = {};
            
            // Close WebSocket
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, []);

    /* ===================== Update Joint (Immediate UI + Throttled WS) ===================== */
    const updateJointImmediate = (name: string, value: number) => {
        if (!isMounted.current) return;
        
        setAutoRotate(false);

        const cfg = urdfJoints[name as keyof typeof urdfJoints];
        if (!cfg) return;
        
        const deg = clamp(value, cfg.min, cfg.max);

        // Cancel any pending RAF for this joint
        if (rafRef.current[name]) {
            cancelAnimationFrame(rafRef.current[name]);
        }

        // Immediate UI update via RAF (60fps smooth)
        rafRef.current[name] = requestAnimationFrame(() => {
            if (!isMounted.current) return;
            setJoints((prev) => ({
                ...prev,
                [name]: deg,
            }));
        });

        // Throttled WebSocket send
        if (sendTimeoutRef.current[name]) {
            clearTimeout(sendTimeoutRef.current[name]);
        }

        sendTimeoutRef.current[name] = setTimeout(() => {
            if (!isMounted.current) return;
            
            // Only send if value actually changed
            if (Math.abs((lastSentValue.current[name] ?? 0) - deg) > 0.1) {
                lastSentValue.current[name] = deg;
                
                const payload: JointUpdate = {
                    type: "joint_update",
                    urdfJoints: { [name]: deg },
                    joints: { [name]: deg },
                    source: "ui",
                    role: "robot",
                };

                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify(payload));
                } else {
                    pendingMessages.current.push(payload);
                }
            }
            
            // Clean up this timeout reference
            delete sendTimeoutRef.current[name];
        }, 16); // 16ms = ~60fps
    };

    /* ===================== Send All Joints (for button clicks) ===================== */
    const sendAllJointsToWS = (allJoints: Record<string, number>) => {
        if (!isMounted.current) return;
        
        const payload: JointUpdate = {
            type: "joint_update",
            urdfJoints: allJoints,
            joints: allJoints,
            source: "ui",
            role: "robot",
        };

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log("📤 WS sending all joints:", payload);
            wsRef.current.send(JSON.stringify(payload));
        } else {
            console.log("⏳ WS not ready, queuing message");
            pendingMessages.current.push(payload);
        }
    };

    /* ===================== Reset ===================== */
    const resetAllJoints = () => {
        const reset = Object.fromEntries(
            Object.keys(urdfJoints).map((k) => [k, 0])
        );

        setJoints(reset);
        sendAllJointsToWS(reset);
    };

    /* ===================== UI ===================== */
    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 no-scrollbar">
            {/* LEFT PANEL */}
            <div className="w-[420px] border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col no-scrollbar">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Arm Controller
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                URDF Joint Control Panel
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div
                                    className={`absolute inset-0 ${
                                        wsConnected
                                            ? "bg-purple-500/20 dark:bg-purple-600/20"
                                            : "bg-red-500/20 dark:bg-red-600/20"
                                    } blur-lg rounded-full`}
                                />
                                <div
                                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full ${
                                        wsConnected
                                            ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800"
                                            : "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                                    }`}
                                >
                                    {wsConnected ? (
                                        <>
                                            <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-pulse" />
                                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                Connected
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full" />
                                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                                Disconnected
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Joints List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Joint Controls
                        </h2>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Object.keys(urdfJoints).length} joints
                        </span>
                    </div>

                    {Object.entries(urdfJoints).map(([name, cfg]) => (
                        <div
                            key={name}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                        >
                            {/* HEADER */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                        <Rotate3D
                                            size={18}
                                            className="text-purple-600 dark:text-purple-400"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {name}
                                        </h3>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Min {cfg.min}° • Max {cfg.max}°
                                        </div>
                                    </div>
                                </div>

                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {Math.round(joints[name] ?? 0)}°
                                </div>
                            </div>

                            {/* SLIDER */}
                            <input
                                type="range"
                                min={cfg.min}
                                max={cfg.max}
                                step="1"
                                value={joints[name] ?? 0}
                                onInput={(e) => {
                                    // Ultra-fast immediate update
                                    const value = Number(e.currentTarget.value);
                                    updateJointImmediate(name, value);
                                }}
                                onMouseDown={() => {
                                    isUserDragging.current = true;
                                }}
                                onMouseUp={() => {
                                    isUserDragging.current = false;
                                }}
                                onTouchStart={() => {
                                    isUserDragging.current = true;
                                }}
                                onTouchEnd={() => {
                                    isUserDragging.current = false;
                                }}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:h-5
                                    [&::-webkit-slider-thumb]:w-5
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-purple-600
                                    [&::-webkit-slider-thumb]:dark:bg-purple-500
                                    [&::-webkit-slider-thumb]:cursor-grab
                                    [&::-webkit-slider-thumb]:active:cursor-grabbing
                                    [&::-webkit-slider-thumb]:transition-transform
                                    [&::-webkit-slider-thumb]:hover:scale-110
                                    [&::-webkit-slider-thumb]:active:scale-105
                                    [&::-webkit-slider-thumb]:shadow-lg
                                    [&::-moz-range-thumb]:h-5
                                    [&::-moz-range-thumb]:w-5
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-purple-600
                                    [&::-moz-range-thumb]:dark:bg-purple-500
                                    [&::-moz-range-thumb]:border-0
                                    [&::-moz-range-thumb]:cursor-grab
                                    [&::-moz-range-thumb]:active:cursor-grabbing
                                    [&::-moz-range-thumb]:transition-transform
                                    [&::-moz-range-thumb]:hover:scale-110
                                    [&::-moz-range-thumb]:active:scale-105"
                            />

                            {/* BUTTONS */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => {
                                        const newValue = clamp(joints[name] - 5, cfg.min, cfg.max);
                                        updateJointImmediate(name, newValue);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors active:scale-95"
                                >
                                    <Minus size={16} className="text-gray-700 dark:text-gray-300" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">-5°</span>
                                </button>

                                <button
                                    onClick={() => {
                                        const newValue = clamp(joints[name] + 5, cfg.min, cfg.max);
                                        updateJointImmediate(name, newValue);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors active:scale-95"
                                >
                                    <Plus size={16} className="text-gray-700 dark:text-gray-300" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">+5°</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={resetAllJoints}
                            className="group flex items-center justify-center gap-3 py-3.5 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 rounded-xl transition-all duration-200"
                        >
                            <RefreshCw
                                size={18}
                                className="text-purple-600 dark:text-purple-400 group-hover:rotate-180 transition-transform duration-500"
                            />
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                                Reset All
                            </span>
                        </button>
                        <button
                            onClick={() => setResetView(!resetView)}
                            className="group flex items-center justify-center gap-3 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all duration-200"
                        >
                            <Home
                                size={18}
                                className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                Reset View
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 3D VIEW */}
            <div className="flex-1 relative bg-white dark:bg-gray-900 no-scrollbar">
                {/* Overlay Controls */}
                <div className="absolute top-6 right-6 z-10">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-md">
                        <div className="flex items-center gap-2 px-3 py-1.5">
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    autoRotate
                                        ? "bg-purple-600 dark:bg-purple-400"
                                        : "bg-gray-400 dark:bg-gray-600"
                                }`}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Auto Rotate
                            </span>
                        </div>
                        <button
                            onClick={() => setAutoRotate(!autoRotate)}
                            className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-md transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {autoRotate ? "Disable" : "Enable"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Canvas */}
                <Canvas
                    key={resetView ? "reset" : "normal"}
                    camera={{ position: [2, 2, 4], fov: 15 }}
                >
                    <color
                        attach="background"
                        args={[isDark ? "#111827" : "#ffffff"]}
                    />

                    <ambientLight intensity={isDark ? 0.6 : 0.7} />
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={isDark ? 0.9 : 1.2}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                        color={isDark ? "#cbd5e1" : "#ffffff"}
                    />
                    <hemisphereLight
                        intensity={0.3}
                        groundColor={isDark ? "#1e293b" : "#f1f5f9"}
                    />

                    <URDFRobot joints={joints} />

                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        autoRotate={autoRotate}
                        autoRotateSpeed={4}
                        minDistance={1}
                        maxDistance={20}
                    />

                    <gridHelper
                        args={[
                            10,
                            10,
                            isDark ? "#334155" : "#cbd5e1",
                            isDark ? "#1e293b" : "#e2e8f0",
                        ]}
                        position={[0, -0.5, 0]}
                    />

                    <axesHelper args={[2]} />
                </Canvas>
            </div>
        </div>
    );
}