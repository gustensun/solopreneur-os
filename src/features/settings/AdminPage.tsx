import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ToggleLeft,
  Database,
  Download,
  Upload,
  Trash2,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const APP_VERSION = "2.0.0";
const BUILD_DATE = "2025";

interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const defaultToggles: FeatureToggle[] = [
  {
    id: "ai-chat",
    label: "AI Chat",
    description: "Enable the AI assistant chat interface",
    enabled: true,
  },
  {
    id: "voice-call",
    label: "Voice Call",
    description: "Enable AI voice conversation feature",
    enabled: true,
  },
  {
    id: "vibe-coding",
    label: "Vibe Coding",
    description: "Show the software project pipeline",
    enabled: true,
  },
  {
    id: "academy",
    label: "Academy",
    description: "Enable the learning management system",
    enabled: true,
  },
  {
    id: "program-builder",
    label: "Program Builder",
    description: "Enable course/program creation tools",
    enabled: true,
  },
  {
    id: "brain",
    label: "Brain / Knowledge Base",
    description: "Enable the AI brain and knowledge management",
    enabled: true,
  },
];

function getAllStorageData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("solopreneur-")) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return data;
}

export default function AdminPage() {
  const [toggles, setToggles] = useState<FeatureToggle[]>(defaultToggles);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");

  function handleToggle(id: string) {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
    toast.success("Feature toggle updated");
  }

  function handleExport() {
    const data = getAllStorageData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solopreneur-os-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importJson);
      Object.entries(parsed).forEach(([key, value]) => {
        if (key.startsWith("solopreneur-")) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      toast.success("Data imported. Refresh the page to see changes.");
      setImportOpen(false);
      setImportJson("");
    } catch {
      toast.error("Invalid JSON. Please check your file and try again.");
    }
  }

  function handleClearAll() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("solopreneur-")) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    setClearConfirmOpen(false);
    toast.success("All app data cleared. Refresh to reset to defaults.");
  }

  const enabledCount = toggles.filter((t) => t.enabled).length;

  return (
    <div className="page-container max-w-2xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Admin Panel</h1>
        </div>
        <p className="page-description">
          Manage feature flags, data, and application settings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Feature toggles */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold">Feature Toggles</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {enabledCount}/{toggles.length} enabled
            </span>
          </div>
          <div className="space-y-3">
            {toggles.map((toggle) => (
              <div
                key={toggle.id}
                className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
              >
                <div>
                  <Label
                    htmlFor={`toggle-${toggle.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {toggle.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {toggle.description}
                  </p>
                </div>
                <Switch
                  id={`toggle-${toggle.id}`}
                  checked={toggle.enabled}
                  onCheckedChange={() => handleToggle(toggle.id)}
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Data management */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-semibold">Data Management</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start justify-between py-2 border-b border-border/40">
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download all your app data as a JSON backup file
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </div>
            <div className="flex items-start justify-between py-2 border-b border-border/40">
              <div>
                <p className="text-sm font-medium">Import Data</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Restore from a previously exported JSON backup
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="h-3.5 w-3.5" />
                Import
              </Button>
            </div>
            <div className="flex items-start justify-between py-2">
              <div>
                <p className="text-sm font-medium text-destructive">
                  Clear All Data
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete all stored app data and reset to defaults
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setClearConfirmOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </motion.div>

        {/* App info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-semibold">App Information</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">Solopreneur OS</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium font-mono">v{APP_VERSION}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Build Year</span>
              <span className="font-medium">{BUILD_DATE}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/40">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">Local (IndexedDB / localStorage)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Creator</span>
              <span className="font-medium">Gusten Sun</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Clear confirm dialog */}
      <Dialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Clear All Data?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete all your stored data including modules,
            projects, brain resources, and settings. This action cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end mt-2">
            <Button
              variant="outline"
              onClick={() => setClearConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              <Trash2 className="h-4 w-4" />
              Yes, Clear Everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import dialog */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Data</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Paste the contents of your exported JSON backup file below.
          </p>
          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder='{"solopreneur-academy": {...}, ...}'
            className="w-full h-40 p-3 text-xs font-mono rounded-lg border border-border bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importJson.trim()}>
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
