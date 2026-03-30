import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Zap,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIncomeStore } from "@/stores/income";
import type { IncomeType, IncomeFormat } from "@/types";
import { cn } from "@/lib/utils";

const INCOME_TYPES: IncomeType[] = [
  "Consulting",
  "Membership",
  "Affiliate",
  "Courses",
  "Coaching",
  "Digital Product",
  "SaaS",
  "Freelance",
];

const TYPE_COLORS: Record<IncomeType, string> = {
  Consulting: "bg-blue-100 text-blue-700",
  Membership: "bg-purple-100 text-purple-700",
  Affiliate: "bg-orange-100 text-orange-700",
  Courses: "bg-green-100 text-green-700",
  Coaching: "bg-pink-100 text-pink-700",
  "Digital Product": "bg-indigo-100 text-indigo-700",
  SaaS: "bg-cyan-100 text-cyan-700",
  Freelance: "bg-yellow-100 text-yellow-700",
};

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

function formatCurrencyFull(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function IncomeStreamsPage() {
  const { streams, addStream, updateStream, deleteStream, reorderStreams, getMonthlyTotal, getAnnualProjection } =
    useIncomeStore();

  const [editingId, setEditingId] = useState<string | null>(null);

  const monthlyTotal = getMonthlyTotal();
  const annualProjection = getAnnualProjection();
  const activeStreams = streams.filter((s) => s.active).length;

  function handleAddStream() {
    const position = streams.length;
    addStream({
      name: "New Income Stream",
      fee: 0,
      type: "Coaching",
      format: "One Time",
      monthlySales: 1,
      active: true,
      position,
    });
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const sorted = [...streams].sort((a, b) => a.position - b.position);
    const newStreams = [...sorted];
    [newStreams[index - 1], newStreams[index]] = [newStreams[index], newStreams[index - 1]];
    reorderStreams(newStreams.map((s, i) => ({ ...s, position: i })));
  }

  function moveDown(index: number) {
    const sorted = [...streams].sort((a, b) => a.position - b.position);
    if (index >= sorted.length - 1) return;
    const newStreams = [...sorted];
    [newStreams[index], newStreams[index + 1]] = [newStreams[index + 1], newStreams[index]];
    reorderStreams(newStreams.map((s, i) => ({ ...s, position: i })));
  }

  const sortedStreams = [...streams].sort((a, b) => a.position - b.position);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Income Streams</h1>
        </div>
        <p className="page-description">
          Plan, track, and optimise your revenue streams to hit your income goals.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="stat-label">Monthly Potential</span>
          </div>
          <span className="stat-value text-green-700">{formatCurrencyFull(monthlyTotal)}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="stat-label">Annual Projection</span>
          </div>
          <span className="stat-value text-blue-700">{formatCurrencyFull(annualProjection)}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-primary" />
            <span className="stat-label">Active Streams</span>
          </div>
          <span className="stat-value">{activeStreams}</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-8">
                  #
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground min-w-[180px]">
                  Offer Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">
                  Fee
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-44">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-36">
                  Format
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">
                  Monthly Sales
                </th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">
                  Revenue
                </th>
                <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20">
                  Active
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-28">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sortedStreams.map((stream, index) => {
                  const revenue = stream.fee * stream.monthlySales;
                  const isEditing = editingId === stream.id;
                  return (
                    <motion.tr
                      key={stream.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "border-b border-border/40 transition-colors",
                        stream.active ? "hover:bg-muted/30" : "opacity-50 hover:bg-muted/20",
                        isEditing && "bg-primary/5"
                      )}
                      onClick={() => setEditingId(isEditing ? null : stream.id)}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">{index + 1}</td>

                      {/* Name */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={stream.name}
                          onChange={(e) => updateStream(stream.id, { name: e.target.value })}
                          className="h-8 text-sm font-medium border-transparent bg-transparent hover:border-border focus:border-input focus:bg-background transition-all"
                        />
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                          <Input
                            type="number"
                            min="0"
                            value={stream.fee}
                            onChange={(e) => updateStream(stream.id, { fee: Number(e.target.value) })}
                            className="h-8 pl-6 text-sm border-transparent bg-transparent hover:border-border focus:border-input focus:bg-background transition-all"
                          />
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={stream.type}
                          onValueChange={(v) => updateStream(stream.id, { type: v as IncomeType })}
                        >
                          <SelectTrigger className="h-8 text-xs border-transparent bg-transparent hover:border-border focus:border-input focus:bg-background transition-all">
                            <SelectValue>
                              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TYPE_COLORS[stream.type])}>
                                {stream.type}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {INCOME_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TYPE_COLORS[t])}>
                                  {t}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Format */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={stream.format}
                          onValueChange={(v) => updateStream(stream.id, { format: v as IncomeFormat })}
                        >
                          <SelectTrigger className="h-8 text-xs border-transparent bg-transparent hover:border-border focus:border-input focus:bg-background transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Recurring">Recurring</SelectItem>
                            <SelectItem value="One Time">One Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Monthly Sales */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Input
                          type="number"
                          min="0"
                          value={stream.monthlySales}
                          onChange={(e) => updateStream(stream.id, { monthlySales: Number(e.target.value) })}
                          className="h-8 text-sm border-transparent bg-transparent hover:border-border focus:border-input focus:bg-background transition-all"
                        />
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold text-sm", stream.active ? "text-green-700" : "text-muted-foreground")}>
                          {formatCurrency(revenue)}
                        </span>
                      </td>

                      {/* Active */}
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={stream.active}
                          onCheckedChange={(checked) => updateStream(stream.id, { active: Boolean(checked) })}
                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === sortedStreams.length - 1}
                            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteStream(stream.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                            title="Delete stream"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>

            {/* Footer totals */}
            <tfoot>
              <tr className="bg-muted/40 border-t-2 border-border">
                <td colSpan={6} className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={handleAddStream}>
                    <Plus className="h-3.5 w-3.5" /> Add Income Stream
                  </Button>
                </td>
                <td className="px-4 py-3" colSpan={3}>
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Monthly:</span>
                      <span className="font-bold text-green-700">{formatCurrencyFull(monthlyTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Annual:</span>
                      <span className="font-bold text-blue-700">{formatCurrencyFull(annualProjection)}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {streams.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 flex flex-col items-center justify-center text-center mt-4"
        >
          <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-lg text-muted-foreground">No income streams yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
            Add your revenue streams to start tracking your income potential.
          </p>
          <Button onClick={handleAddStream}>
            <Plus className="h-4 w-4" /> Add Income Stream
          </Button>
        </motion.div>
      )}
    </div>
  );
}
