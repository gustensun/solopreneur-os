import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Camera, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/stores/user";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, updateProfile, setAvatarUrl } = useUserStore();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function handleSave() {
    if (!name.trim()) return;
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      initials: getInitials(name.trim()),
    });
    setSaved(true);
    toast.success("Profile saved successfully");
    setTimeout(() => setSaved(false), 2500);
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setAvatarUrl(url);
    };
    reader.readAsDataURL(file);
  }

  const isDirty = name !== user.name || email !== user.email;

  return (
    <div className="page-container max-w-2xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Profile Settings</h1>
        </div>
        <p className="page-description">
          Manage your personal information and account details.
        </p>
      </div>

      <div className="space-y-6">
        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Profile Photo
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="w-20 h-20">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                )}
                <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Upload avatar"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={handleAvatarClick}>
                <Camera className="h-4 w-4" />
                Upload Photo
              </Button>
              <p className="text-xs text-muted-foreground mt-1.5">
                JPG, PNG, or GIF. Max 2MB.
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </motion.div>

        {/* Profile info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Full Name
                </span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="max-w-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email Address
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="max-w-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <Button
            onClick={handleSave}
            disabled={!isDirty && !saved}
            className={cn(
              "transition-all",
              saved && "bg-green-600 hover:bg-green-700"
            )}
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
          {isDirty && !saved && (
            <span className="text-xs text-muted-foreground">
              You have unsaved changes
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
