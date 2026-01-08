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
    Wifi,
    WifiOff,
    RefreshCw,
    Home,
} from "lucide-react";

/* ===================== Utils ===================== */
const degToRad = (deg: number) => +((deg * Math.PI) / 180).toFixed(3);

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

/* ===================== Component ===================== */
export default function RobotArmView() {
    /* -------- State -------- */
    const [autoRotate, setAutoRotate] = useState(true);
    const [resetView, setResetView] = useState(false);
    const [wsConnected, setWsConnected] = useState(false);

    const [joints, setJoints] = useState<Record<string, number>>(
        Object.fromEntries(Object.keys(urdfJoints).map((k) => [k, 0]))
    );

    /* -------- Refs -------- */
    const wsRef = useRef<WebSocket | null>(null);
    const pendingMessages = useRef<any[]>([]);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const isUpdatingFromServer = useRef(false);

    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDark = () => {
            const isDarkMode = document.documentElement.classList.contains("dark");
            setIsDark(isDarkMode);
        };

        // Initial check
        checkDark();
        
        // Listen for theme changes
        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        // Also listen for custom event if you have one
        window.addEventListener("theme-change", checkDark);
        
        return () => {
            observer.disconnect();
            window.removeEventListener("theme-change", checkDark);
        };
    }, []);

    /* ===================== WebSocket ===================== */

    useEffect(() => {
        const ws = new WebSocket(appConfig.ws.arm);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("✅ WS connected");
            setWsConnected(true);

            pendingMessages.current.forEach((msg) =>
                ws.send(JSON.stringify(msg))
            );
            pendingMessages.current = [];
        };

        ws.onmessage = (e) => {
            try {
                const message = JSON.parse(e.data);
                console.log("📥 WS received (raw):", message);

                // Accept both 'urdfJoints' and 'joints' fields for compatibility
                const data = message.urdfJoints || message.joints;

                console.log("📥 Extracted data:", data);
                console.log("📥 Message source:", message.source);

                // Ignore messages that originated from this UI
                if (message.source === "ui") {
                    console.log("⏭️ Skipping own message");
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
                            // Clamp to valid range
                            const cfg = urdfJoints[k];
                            if (cfg) {
                                const clampedValue = Math.max(
                                    cfg.min,
                                    Math.min(cfg.max, v)
                                );
                                console.log(
                                    `  ${k}: ${prev[k]} → ${clampedValue}`
                                );
                                next[k] = clampedValue;
                                updated = true;
                            }
                        }
                    });

                    if (updated) {
                        console.log("✅ Joints updated:", next);
                    }

                    return next;
                });
            } catch (err) {
                console.error("❌ WS parse error", err);
            }
        };

        ws.onerror = () => {
            console.error("❌ WS error");
            setWsConnected(false);
        };

        ws.onclose = () => {
            console.log("🔌 WS closed");
            setWsConnected(false);
        };

        return () => {
            ws.close();
        };
    }, []);

    /* ===================== Send Joint Update ===================== */
    const updateJoint = (name: string, value: number) => {
        // Don't block UI updates when user is interacting
        setAutoRotate(false);

        const cfg = urdfJoints[name];
        const deg = clamp(value, cfg.min, cfg.max);

        setJoints((prev) => ({
            ...prev,
            [name]: deg,
        }));

        const payload = {
            type: "joint_update",
            urdfJoints: {
                [name]: deg,
            },
            joints: {
                [name]: deg,
            },
            source: "ui",
            role: "robot", // Added for Python backend compatibility
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                console.log("📤 WS sending:", payload);
                wsRef.current.send(JSON.stringify(payload));
            } else {
                console.log("⏳ WS not ready, queuing message");
                pendingMessages.current.push(payload);
            }
        }, 40);
    };

    /* ===================== Reset ===================== */
    const resetAllJoints = () => {
        const reset = Object.fromEntries(
            Object.keys(urdfJoints).map((k) => [k, 0])
        );

        setJoints(reset);

        const payload = {
            type: "joint_update",
            urdfJoints: reset,
            joints: reset,
            source: "ui",
            role: "robot",
        };

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log("📤 WS sending reset:", payload);
            wsRef.current.send(JSON.stringify(payload));
        }
    };

    /* ===================== UI ===================== */
    return (
        <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* LEFT PANEL */}
            <div className="w-[420px] border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Robot Controller
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
                            className="group bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-200 shadow-sm dark:shadow-none"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <Rotate3D
                                            size={18}
                                            className="text-purple-600 dark:text-purple-400"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>Min: {cfg.min}°</span>
                                            <span className="text-gray-300 dark:text-gray-600">
                                                •
                                            </span>
                                            <span>Max: {cfg.max}°</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {joints[name].toFixed(1)}°
                                    </div>
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>{cfg.min}°</span>
                                    <span className="text-purple-600 dark:text-purple-400">
                                        Current Position
                                    </span>
                                    <span>{cfg.max}°</span>
                                </div>
                                <input
                                    type="range"
                                    min={cfg.min}
                                    max={cfg.max}
                                    step="0.1"
                                    value={joints[name]}
                                    onChange={(e) =>
                                        updateJoint(name, +e.target.value)
                                    }
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 dark:[&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white dark:[&::-webkit-slider-thumb]:border-gray-800 [&::-webkit-slider-thumb]:shadow-md"
                                />
                            </div>

                            {/* Control Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() =>
                                        updateJoint(name, joints[name] - 5)
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors group/btn"
                                >
                                    <Minus
                                        size={16}
                                        className="text-gray-700 dark:text-gray-300 group-hover/btn:text-purple-600 dark:group-hover/btn:text-purple-400"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        -5°
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        updateJoint(name, joints[name] + 5)
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors group/btn"
                                >
                                    <Plus
                                        size={16}
                                        className="text-gray-700 dark:text-gray-300 group-hover/btn:text-purple-600 dark:group-hover/btn:text-purple-400"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        +5°
                                    </span>
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
                                Reset All Joints
                            </span>
                        </button>
                        <button
                            onClick={() => setResetView(!resetView)}
                            className="group flex items-center justify-center gap-3 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-xl transition-all duration-200"
                        >
                            <Home
                                size={18}
                                className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400"
                            />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                Reset View
                            </span>
                            <div
                                className={`w-2 h-2 rounded-full ${
                                    resetView
                                        ? "bg-purple-600 dark:bg-purple-400"
                                        : "bg-gray-400 dark:bg-gray-600"
                                } group-hover:bg-purple-600 dark:group-hover:bg-purple-400`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* 3D VIEW */}
            <div className="flex-1 relative bg-white dark:bg-gray-900">
                {/* Overlay Controls */}
                <div className="absolute top-6 right-6 z-10">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-md dark:shadow-lg dark:shadow-black/20">
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

                {/* Canvas - Remove the gradient className */}
                <Canvas
                    key={resetView ? "reset" : "normal"}
                    camera={{ position: [2, 2, 4], fov: 15 }}
                >
                    {/* Set background color based on theme */}
                    <color
                        attach="background"
                        args={[isDark ? "#0f172a" : "#ffffff"]} // gray-900 for dark, white for light
                    />

                    {/* Adjust lighting based on theme */}
                    <ambientLight intensity={isDark ? 0.6 : 0.7} />
                    <directionalLight
                        position={[5, 5, 5]}
                        intensity={isDark ? 0.9 : 1.2}
                        castShadow
                        shadow-mapSize={[2048, 2048]}
                        color={isDark ? "#cbd5e1" : "#ffffff"} // Adjust light color for dark mode
                    />
                    <hemisphereLight
                        intensity={isDark ? 0.3 : 0.3}
                        groundColor={isDark ? "#1e293b" : "#f1f5f9"} // sky-900 for dark, sky-50 for light
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

                    {/* Adjust grid helper colors for dark mode */}
                    <gridHelper
                        args={[
                            10,
                            10,
                            isDark ? "#334155" : "#cbd5e1", // grid color
                            isDark ? "#1e293b" : "#e2e8f0", // center line color
                        ]}
                        position={[0, -0.5, 0]}
                    />

                    {/* Optional: Make axes more visible in dark mode */}
                    <axesHelper
                        args={[2]}
                        material-color={isDark ? "#cbd5e1" : "#64748b"} // gray-300 for dark, gray-500 for light
                    />
                </Canvas>
            </div>
        </div>
    );
}
