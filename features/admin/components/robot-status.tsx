// components/RobotStatus.tsx
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Battery,
  MapPin,
  AlertTriangle,
  Activity,
  Zap,
  Target,
  ChevronDown,
  Gauge,
  ShieldCheck,
  Thermometer,
  Power,
  Network,
  AlertCircle,
} from "lucide-react";
import { useRobotTelemetry } from "@/components/nurseOverview/hooks/useAlerts";
import {
  useArmEndpose,
  useArmVelocity,
  useJointEffort,
  useJointPosition,
  useArmStatus,
  useJointStatus,
  useJointHeat,
} from "../hooks/useRobot";

/**
 * Types
 */
type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

interface MetricCardProps {
  icon: IconComponent;
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  color?: "red" | "orange" | "green" | "purple" | "blue";
  progress?: number | null;
  alert?: boolean | null;
  isLoading?: boolean;
}

interface JointDataCardProps {
  title: string;
  data: Record<string, any> | null | undefined;
  icon: IconComponent;
  color?: "green" | "purple" | "orange" | "blue";
  description?: string;
  isLoading?: boolean;
}

interface StatusItemProps {
  label: string;
  value: any;
  isLoading?: boolean;
}

interface ArmStatusCardProps {
  status: Record<string, any> | null | undefined;
  isLoading?: boolean;
}

interface EndposeCardProps {
  endpose: Record<string, any> | null | undefined;
  isLoading?: boolean;
}

/**
 * Animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  hover: {
    y: -4,
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

/**
 * MetricCard - typed, with optional subtitle/progress/alert
 */
const MetricCard: React.FC<MetricCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle = undefined,
  color = "blue",
  progress = undefined,
  alert = false,
  isLoading = false,
}) => {
  const colorMap = {
    red: {
      bg: "bg-red-50 dark:bg-red-950/40",
      border: "border-red-200 dark:border-red-800",
      iconBg: "bg-red-100 dark:bg-red-900",
      iconColor: "text-red-600 dark:text-red-300",
      progress: "[&>div]:bg-red-500",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/40",
      border: "border-orange-200 dark:border-orange-800",
      iconBg: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-300",
      progress: "[&>div]:bg-orange-500",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/40",
      border: "border-green-200 dark:border-green-800",
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-300",
      progress: "[&>div]:bg-green-500",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/40",
      border: "border-purple-200 dark:border-purple-800",
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-300",
      progress: "[&>div]:bg-purple-500",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-800",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-300",
      progress: "[&>div]:bg-blue-500",
    },
  } as const;

  const selectedColor =
    alert && colorMap["red"] ? colorMap["red"] : colorMap[color] || colorMap.blue;

  return (
    <motion.div variants={containerVariants} whileHover="hover" className="h-full">
      <Card
        className={`relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 h-full ${selectedColor.bg} ${selectedColor.border}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${selectedColor.iconBg}`}>
              <Icon className={`w-5 h-5 ${selectedColor.iconColor}`} />
            </div>
            {alert && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Alert
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>

            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{value}</span>

                {subtitle && typeof subtitle === "string" && (
                  <span className="text-sm text-muted-foreground">{subtitle}</span>
                )}
                {subtitle && typeof subtitle !== "string" && subtitle}
              </div>
            )}

            {progress !== undefined && progress !== null && (
              <div className="space-y-2">
                <Progress value={Math.max(0, Math.min(100, progress))} className={`h-2 ${selectedColor.progress}`} />
                <div className="text-xs text-muted-foreground">{progress}% capacity</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * JointDataCard - typed and memoized filtering
 */
const JointDataCard: React.FC<JointDataCardProps> = ({
  title,
  data,
  icon: Icon,
  color = "blue",
  description,
  isLoading = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const colorMap = {
    green: { bg: "bg-green-100", color: "text-green-600" },
    purple: { bg: "bg-purple-100", color: "text-purple-600" },
    orange: { bg: "bg-orange-100", color: "text-orange-600" },
    blue: { bg: "bg-blue-100", color: "text-blue-600" },
  } as const;

  const filteredData = useMemo(() => {
    if (!data) return null;
    return Object.fromEntries(
      Object.entries(data).filter(
        ([key]) => !key.includes("_timestamp") && !["id", "created_at"].includes(key)
      )
    );
  }, [data]);

  const colorDef = colorMap[color] || colorMap.blue;

  return (
    <motion.div variants={containerVariants} whileHover="hover">
      <Card className="shadow-sm border hover:shadow-md transition-all duration-300 overflow-hidden">
        <CardHeader
          className="cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors p-4"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${colorDef.bg}`}>
                <Icon className={`w-4 h-4 ${colorDef.color}`} />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
                <CardDescription className="text-sm mt-1">{description}</CardDescription>
              </div>
            </div>

            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              <CardContent className="p-4 pt-0">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filteredData &&
                      Object.entries(filteredData).map(([key, val], index) => (
                        <motion.div
                          key={key}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex justify-between items-center py-2.5 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <span className="font-medium text-sm text-foreground capitalize">{key.replace(/_/g, " ")}</span>
                          <span className="text-sm font-mono bg-background px-2.5 py-1 rounded border text-foreground">
                            {typeof val === "number" ? val.toFixed(3) : String(val)}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

/**
 * StatusItem - typed; iconMap keyed by string but typed as Record
 */
const StatusItem: React.FC<StatusItemProps> = ({ label, value, isLoading = false }) => {
  const isAlert = String(value).toUpperCase() === "TRUE";

  const iconMap: Record<string, IconComponent> = {
    "Voltage Too Low": Power,
    "Motor Overheating": Thermometer,
    "Driver Overcurrent": Zap,
    "Driver Overheating": Thermometer,
    "Sensor Status": Network,
    "Driver Error Status": AlertTriangle,
  };

  const Icon = (iconMap[label] as IconComponent) || ShieldCheck;

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-3">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${isAlert ? "text-red-500" : "text-muted-foreground"}`} />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <Badge variant={isAlert ? "destructive" : "secondary"} className="capitalize">
        {String(value).toLowerCase()}
      </Badge>
    </div>
  );
};

/**
 * ArmStatusCard - typed
 */
const ArmStatusCard: React.FC<ArmStatusCardProps> = ({ status, isLoading = false }) => {
  if (!status && !isLoading) return null;

  const primaryStatuses: Record<string, any> = {
    "Arm Status": status?.arm_status,
    "Control Mode": status?.ctrl_mode,
    "Motion Status": status?.motion_status,
    "Homing Status": status?.homing_status,
  };

  const warningStatuses: Record<string, any> = {
    "Voltage Too Low": status?.voltage_too_low,
    "Motor Overheating": status?.motor_overheating,
    "Driver Overcurrent": status?.driver_overcurrent,
    "Driver Overheating": status?.driver_overheating,
    "Sensor Status": status?.sensor_status,
    "Driver Error Status": status?.driver_error_status,
  };

  return (
    <motion.div variants={containerVariants} >
      <Card className="shadow-sm border hover:shadow-md transition-all duration-300">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Arm System Status</CardTitle>
              <CardDescription className="mt-1">Overall health and operational state</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">Operational State</h4>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatusItem key={i} isLoading={true} label={`loading-${i}`} value={""} />)
              : Object.entries(primaryStatuses).map(([label, value]) => <StatusItem key={label} label={label} value={value} />)}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground mb-3">System Health & Alerts</h4>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <StatusItem key={i} isLoading={true} label={`loading-${i}`} value={""} />)
              : Object.entries(warningStatuses).map(([label, value]) => <StatusItem key={label} label={label} value={value} />)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * EndposeCard - typed
 */
const EndposeCard: React.FC<EndposeCardProps> = ({ endpose, isLoading = false }) => {
  return (
    <motion.div variants={containerVariants}>
      <Card className="shadow-sm border hover:shadow-md transition-all duration-300">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Arm Endpose</CardTitle>
              <CardDescription className="mt-1">Live coordinate positioning</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {endpose &&
                Object.entries(endpose)
                  .filter(([key]) => key !== "id" && key !== "updated_at")
                  .map(([key, val]) => (
                    <div key={key} className="bg-muted/50 p-3 rounded-lg border text-center">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{key}</div>
                      <div className="text-lg font-bold text-foreground mt-1">{Number(val).toFixed(3)}</div>
                    </div>
                  ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/**
 * Main RobotStatus
 */
export function RobotStatus(): JSX.Element {
  const { data: telemetry, isLoading: telemetryLoading } = useRobotTelemetry();
  const { data: endpose, isLoading: endposeLoading } = useArmEndpose();
  const { data: velocity, isLoading: velocityLoading } = useArmVelocity();
  const { data: effort, isLoading: effortLoading } = useJointEffort();
  const { data: position, isLoading: positionLoading } = useJointPosition();
  const { data: armStatus, isLoading: armStatusLoading } = useArmStatus();
  const { data: jointStatus, isLoading: jointStatusLoading } = useJointStatus();
  const { data: heat, isLoading: heatLoading } = useJointHeat();

  const getBatteryColor = (battery: number | undefined) => {
    if (battery === undefined) return "blue";
    if (battery < 30) return "red";
    if (battery < 60) return "orange";
    return "green";
  };

  return (
    <div className="bg-muted/20 px-4 md:px-0 lg:px-8 py-6">
      <div className="mx-auto space-y-6 ">
        <h1 className="text-3xl font-bold text-foreground">Robot Dashboard</h1>
        <p className="text-base text-muted-foreground mt-2">Real-time monitoring & intelligent control</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            icon={Bot}
            title="Robot Name"
            value={telemetry?.robot_name || "—"}
            color="blue"
            isLoading={telemetryLoading}
            subtitle=""
            progress={null}
            alert={null}
          />

          <MetricCard
            icon={Battery}
            title="Battery Level"
            value={`${telemetry?.robot_battery ?? 0}%`}
            progress={telemetry?.robot_battery ?? 0}
            color={getBatteryColor(telemetry?.robot_battery)}
            isLoading={telemetryLoading}
            subtitle=""
            alert={null}
          />

          <MetricCard
            icon={MapPin}
            title="Location"
            value={telemetry?.latest_room_reached || "Unknown"}
            color="purple"
            isLoading={telemetryLoading}
            subtitle=""
            progress={null}
            alert={null}
          />
        </div>

        <ArmStatusCard status={armStatus} isLoading={armStatusLoading} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JointDataCard title="Joint Position" data={position} icon={Activity} color="green" description="Current joint angles" isLoading={positionLoading} />
          <JointDataCard title="Joint Effort" data={effort} icon={Zap} color="orange" description="Applied torque/force" isLoading={effortLoading} />
          <JointDataCard title="Joint Temperature" data={heat} icon={Thermometer} color="orange" description="Live joint temperatures" isLoading={heatLoading} />
        </div>
      </div>
    </div>
  );
}
