import { useState, useEffect, useCallback, createContext, useContext } from "react";

const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

const DB = {
  users: [
    { id: 1, name: "Alex Morgan", email: "admin@demo.com", password: "admin123", role: "admin", avatar: "AM", color: "#185FA5" },
    { id: 2, name: "Sam Rivera", email: "member@demo.com", password: "member123", role: "member", avatar: "SR", color: "#0F6E56" },
    { id: 3, name: "Jordan Lee", email: "jordan@demo.com", password: "jordan123", role: "member", avatar: "JL", color: "#993C1D" },
  ],
  projects: [
    { id: 1, name: "Website Redesign", description: "Complete overhaul of company website with modern UI/UX", color: "#185FA5", members: [1, 2, 3], createdBy: 1, createdAt: "2024-12-01" },
    { id: 2, name: "Mobile App v2", description: "New features and performance improvements for mobile", color: "#0F6E56", members: [1, 2], createdBy: 1, createdAt: "2025-01-10" },
    { id: 3, name: "API Integration", description: "Third-party API integrations and backend services", color: "#993C1D", members: [1, 3], createdBy: 1, createdAt: "2025-02-05" },
  ],
  tasks: [
    { id: 1, title: "Design new homepage mockups", description: "Create Figma mockups for the new homepage layout", projectId: 1, assigneeId: 2, status: "in-progress", priority: "high", dueDate: "2025-05-10", createdBy: 1, createdAt: "2025-04-01" },
    { id: 2, title: "SEO audit and optimization", description: "Conduct full SEO audit and implement recommendations", projectId: 1, assigneeId: 3, status: "todo", priority: "medium", dueDate: "2025-05-20", createdBy: 1, createdAt: "2025-04-05" },
    { id: 3, title: "Content migration", description: "Migrate all existing content to new CMS structure", projectId: 1, assigneeId: 2, status: "done", priority: "high", dueDate: "2025-04-30", createdBy: 1, createdAt: "2025-04-02" },
    { id: 4, title: "Push notification system", description: "Implement push notifications for iOS and Android", projectId: 2, assigneeId: 2, status: "todo", priority: "high", dueDate: "2025-05-08", createdBy: 1, createdAt: "2025-04-10" },
    { id: 5, title: "Performance profiling", description: "Profile app startup time and optimize bottlenecks", projectId: 2, assigneeId: 1, status: "in-progress", priority: "medium", dueDate: "2025-05-15", createdBy: 1, createdAt: "2025-04-12" },
    { id: 6, title: "Stripe payment integration", description: "Integrate Stripe for subscription billing", projectId: 3, assigneeId: 3, status: "in-progress", priority: "high", dueDate: "2025-05-05", createdBy: 1, createdAt: "2025-04-08" },
    { id: 7, title: "OAuth2 social login", description: "Add Google and GitHub OAuth login options", projectId: 3, assigneeId: 1, status: "done", priority: "medium", dueDate: "2025-04-25", createdBy: 1, createdAt: "2025-04-01" },
    { id: 8, title: "Rate limiting middleware", description: "Implement API rate limiting per user/IP", projectId: 3, assigneeId: 3, status: "todo", priority: "low", dueDate: "2025-06-01", createdBy: 1, createdAt: "2025-04-15" },
  ],
};

let nextUserId = 4, nextProjectId = 4, nextTaskId = 9;

const today = new Date();
const isOverdue = (dueDate, status) => status !== "done" && new Date(dueDate) < today;

function Avatar({ user, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.color + "22", border: `1.5px solid ${user.color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 500, color: user.color, flexShrink: 0,
    }}>{user.avatar}</div>
  );
}

function Badge({ status }) {
  const styles = {
    "todo": { bg: "#F1EFE8", color: "#5F5E5A", label: "To Do" },
    "in-progress": { bg: "#E6F1FB", color: "#185FA5", label: "In Progress" },
    "done": { bg: "#EAF3DE", color: "#3B6D11", label: "Done" },
  };
  const s = styles[status] || styles["todo"];
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 20 }}>
      {s.label}
    </span>
  );
}

function PriorityDot({ priority }) {
  const colors = { high: "#D85A30", medium: "#BA7517", low: "#888780" };
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors[priority] || colors.low, display: "inline-block", marginRight: 5 }} />;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--color-background-primary)", borderRadius: 16, width: "100%", maxWidth: 480, padding: "1.5rem", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 500 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--color-text-secondary)", fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>}
      <input {...props} style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8, border: `1px solid ${error ? "#E24B4A" : "var(--color-border-tertiary)"}`, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, outline: "none" }} />
      {error && <p style={{ color: "#E24B4A", fontSize: 12, margin: "4px 0 0" }}>{error}</p>}
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>}
      <select {...props} style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14 }}>{children}</select>
    </div>
  );
}

function Btn({ variant = "primary", children, style: s, ...props }) {
  const base = { padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", border: "none", transition: "opacity 0.15s" };
  const variants = {
    primary: { background: "#185FA5", color: "#fff" },
    secondary: { background: "var(--color-background-secondary)", color: "var(--color-text-primary)", border: "1px solid var(--color-border-tertiary)" },
    danger: { background: "#E24B4A", color: "#fff" },
    ghost: { background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border-tertiary)" },
  };
  return <button {...props} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

// ── Auth Screen ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => {
      if (mode === "login") {
        const user = DB.users.find(u => u.email === form.email && u.password === form.password);
        if (!user) { setErrors({ email: "Invalid credentials" }); setLoading(false); return; }
        onLogin(user);
      } else {
        if (DB.users.find(u => u.email === form.email)) {
          setErrors({ email: "Email already registered" }); setLoading(false); return;
        }
        const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        const colors = ["#185FA5", "#0F6E56", "#993C1D", "#534AB7", "#993556"];
        const newUser = { id: nextUserId++, name: form.name, email: form.email, password: form.password, role: form.role, avatar: initials, color: colors[DB.users.length % colors.length] };
        DB.users.push(newUser);
        onLogin(newUser);
      }
    }, 600);
  };

  const f = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-tertiary)", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 52, height: 52, background: "#185FA5", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 26 }}>⬡</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Nexus</h1>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: 14 }}>Project & Team Management</p>
        </div>
        <div style={{ background: "var(--color-background-primary)", borderRadius: 16, padding: "1.75rem", border: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }} style={{ flex: 1, padding: "7px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 500, fontSize: 14, background: mode === m ? "#185FA5" : "var(--color-background-secondary)", color: mode === m ? "#fff" : "var(--color-text-secondary)", transition: "all 0.15s" }}>
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>
          {mode === "signup" && <Input label="Full Name" value={form.name} onChange={e => f("name", e.target.value)} placeholder="Alex Morgan" error={errors.name} />}
          <Input label="Email" type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="you@company.com" error={errors.email} />
          <Input label="Password" type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder="••••••••" error={errors.password} />
          {mode === "signup" && (
            <Select label="Role" value={form.role} onChange={e => f("role", e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          )}
          <Btn onClick={submit} style={{ width: "100%", marginTop: 6, padding: "10px" }} disabled={loading}>
            {loading ? "Loading…" : mode === "login" ? "Sign in" : "Create account"}
          </Btn>
          {mode === "login" && (
            <div style={{ marginTop: "1.25rem", padding: "12px", background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
              <strong style={{ display: "block", marginBottom: 4 }}>Demo accounts:</strong>
              Admin: admin@demo.com / admin123<br />
              Member: member@demo.com / member123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ current, onNav, user, onLogout }) {
  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "projects", icon: "◫", label: "Projects" },
    { id: "tasks", icon: "✓", label: "My Tasks" },
    ...(user.role === "admin" ? [{ id: "team", icon: "◎", label: "Team" }] : []),
  ];
  return (
    <div style={{ width: 220, background: "var(--color-background-primary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", height: "100vh", position: "fixed", left: 0, top: 0 }}>
      <div style={{ padding: "1.25rem 1rem 1rem", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#185FA5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>⬡</div>
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}>Nexus</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "0.75rem 0.5rem" }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: current === item.id ? 500 : 400, background: current === item.id ? "#185FA5" + "18" : "transparent", color: current === item.id ? "#185FA5" : "var(--color-text-secondary)", marginBottom: 2, textAlign: "left", transition: "all 0.15s" }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "1rem", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <Avatar user={user} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)", textTransform: "capitalize" }}>{user.role}</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", padding: "6px", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 7, background: "transparent", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13 }}>Sign out</button>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user }) {
  const userTasks = DB.tasks.filter(t => t.assigneeId === user.id || user.role === "admin");
  const myTasks = user.role === "admin" ? DB.tasks : DB.tasks.filter(t => t.assigneeId === user.id);
  const todo = myTasks.filter(t => t.status === "todo").length;
  const inProg = myTasks.filter(t => t.status === "in-progress").length;
  const done = myTasks.filter(t => t.status === "done").length;
  const overdue = myTasks.filter(t => isOverdue(t.dueDate, t.status)).length;

  const recentTasks = [...myTasks].sort((a, b) => b.id - a.id).slice(0, 5);

  const statCards = [
    { label: "To Do", value: todo, color: "#888780", bg: "#F1EFE8" },
    { label: "In Progress", value: inProg, color: "#185FA5", bg: "#E6F1FB" },
    { label: "Completed", value: done, color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Overdue", value: overdue, color: "#D85A30", bg: "#FAECE7" },
  ];

  return (
    <div>
      <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
        Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user.name.split(" ")[0]} 👋
      </h1>
      <p style={{ margin: "0 0 1.5rem", color: "var(--color-text-secondary)", fontSize: 14 }}>Here's what's happening today.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.75rem" }}>
        {statCards.map(c => (
          <div key={c.label} style={{ background: c.bg, borderRadius: 12, padding: "1rem 1.25rem" }}>
            <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 500, color: c.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 600, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 500 }}>Recent Tasks</h3>
          {recentTasks.length === 0 ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>No tasks yet.</p> : recentTasks.map(task => {
            const proj = DB.projects.find(p => p.id === task.projectId);
            return (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <PriorityDot priority={task.priority} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>{proj?.name}</p>
                </div>
                <Badge status={task.status} />
              </div>
            );
          })}
        </div>

        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "1.25rem" }}>
          <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 500 }}>Projects Overview</h3>
          {DB.projects.map(proj => {
            const projTasks = DB.tasks.filter(t => t.projectId === proj.id);
            const projDone = projTasks.filter(t => t.status === "done").length;
            const pct = projTasks.length ? Math.round((projDone / projTasks.length) * 100) : 0;
            return (
              <div key={proj.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{proj.name}</span>
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: proj.color, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-secondary)" }}>{projDone}/{projTasks.length} tasks</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────
function Projects({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#185FA5" });
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const userProjects = user.role === "admin" ? DB.projects : DB.projects.filter(p => p.members.includes(user.id));

  const openCreate = () => { setForm({ name: "", description: "", color: "#185FA5" }); setEditProject(null); setShowModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, description: p.description, color: p.color }); setEditProject(p); setShowModal(true); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editProject) {
      Object.assign(editProject, { name: form.name, description: form.description, color: form.color });
    } else {
      DB.projects.push({ id: nextProjectId++, name: form.name, description: form.description, color: form.color, members: [user.id], createdBy: user.id, createdAt: new Date().toISOString().split("T")[0] });
    }
    setShowModal(false); refresh();
  };

  const deleteProject = (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    const idx = DB.projects.indexOf(p); if (idx >= 0) DB.projects.splice(idx, 1);
    DB.tasks = DB.tasks.filter(t => t.projectId !== p.id);
    refresh();
  };

  const colorOptions = ["#185FA5", "#0F6E56", "#993C1D", "#534AB7", "#993556", "#BA7517", "#639922"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Projects</h1>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: 14 }}>{userProjects.length} project{userProjects.length !== 1 ? "s" : ""}</p>
        </div>
        {user.role === "admin" && <Btn onClick={openCreate}>+ New Project</Btn>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {userProjects.map(proj => {
          const projTasks = DB.tasks.filter(t => t.projectId === proj.id);
          const done = projTasks.filter(t => t.status === "done").length;
          const pct = projTasks.length ? Math.round((done / projTasks.length) * 100) : 0;
          const members = proj.members.map(id => DB.users.find(u => u.id === id)).filter(Boolean);
          return (
            <div key={proj.id} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ height: 5, background: proj.color }} />
              <div style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{proj.name}</h3>
                  {user.role === "admin" && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => openEdit(proj)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", fontSize: 13, padding: "2px 6px" }}>✎</button>
                      <button onClick={() => deleteProject(proj)} style={{ background: "none", border: "none", cursor: "pointer", color: "#E24B4A", fontSize: 13, padding: "2px 6px" }}>✕</button>
                    </div>
                  )}
                </div>
                <p style={{ margin: "0 0 1rem", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{proj.description}</p>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 5 }}>
                    <span>Progress</span><span>{pct}% · {done}/{projTasks.length} tasks</span>
                  </div>
                  <div style={{ height: 5, background: "var(--color-background-secondary)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: proj.color, borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex" }}>
                    {members.slice(0, 4).map((m, i) => (
                      <div key={m.id} style={{ marginLeft: i ? -8 : 0 }} title={m.name}><Avatar user={m} size={24} /></div>
                    ))}
                    {members.length > 4 && <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--color-text-secondary)", marginLeft: -8 }}>+{members.length - 4}</div>}
                  </div>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Since {proj.createdAt}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editProject ? "Edit Project" : "New Project"} onClose={() => setShowModal(false)}>
          <Input label="Project Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Website Redesign" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this project about?" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, resize: "vertical", minHeight: 80 }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>Color</label>
            <div style={{ display: "flex", gap: 8 }}>
              {colorOptions.map(c => (
                <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "2px solid var(--color-text-primary)" : "2px solid transparent", cursor: "pointer", outline: "none" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>{editProject ? "Save Changes" : "Create Project"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Tasks ────────────────────────────────────────────────────────────────────
function Tasks({ user }) {
  const [filter, setFilter] = useState({ status: "all", priority: "all", project: "all" });
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", projectId: "", assigneeId: user.id, status: "todo", priority: "medium", dueDate: "" });
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const allTasks = user.role === "admin" ? DB.tasks : DB.tasks.filter(t => t.assigneeId === user.id || DB.projects.find(p => p.id === t.projectId)?.members.includes(user.id));

  const filtered = allTasks.filter(t => {
    if (filter.status !== "all" && t.status !== filter.status) return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    if (filter.project !== "all" && t.projectId !== parseInt(filter.project)) return false;
    return true;
  });

  const openCreate = () => {
    setForm({ title: "", description: "", projectId: DB.projects[0]?.id || "", assigneeId: user.id, status: "todo", priority: "medium", dueDate: "" });
    setEditTask(null); setShowModal(true);
  };
  const openEdit = (t) => {
    setForm({ ...t }); setEditTask(t); setShowModal(true);
  };

  const canEdit = (task) => user.role === "admin" || task.assigneeId === user.id || task.createdBy === user.id;

  const save = () => {
    if (!form.title.trim() || !form.projectId) return;
    if (editTask) {
      Object.assign(editTask, { ...form, projectId: parseInt(form.projectId), assigneeId: parseInt(form.assigneeId) });
    } else {
      DB.tasks.push({ id: nextTaskId++, ...form, projectId: parseInt(form.projectId), assigneeId: parseInt(form.assigneeId), createdBy: user.id, createdAt: new Date().toISOString().split("T")[0] });
    }
    setShowModal(false); refresh();
  };

  const deleteTask = (t) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    const idx = DB.tasks.indexOf(t); if (idx >= 0) DB.tasks.splice(idx, 1);
    refresh();
  };

  const cycleStatus = (t) => {
    if (!canEdit(t)) return;
    const cycle = { "todo": "in-progress", "in-progress": "done", "done": "todo" };
    t.status = cycle[t.status]; refresh();
  };

  const filterSelect = { borderRadius: 8, padding: "6px 10px", border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 13 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>{user.role === "admin" ? "All Tasks" : "My Tasks"}</h1>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: 14 }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Btn onClick={openCreate}>+ New Task</Btn>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <select style={filterSelect} value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select style={filterSelect} value={filter.priority} onChange={e => setFilter(p => ({ ...p, priority: e.target.value }))}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select style={filterSelect} value={filter.project} onChange={e => setFilter(p => ({ ...p, project: e.target.value }))}>
          <option value="all">All projects</option>
          {DB.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-text-secondary)", fontSize: 14 }}>No tasks match your filters.</div>
        ) : filtered.map((task, i) => {
          const assignee = DB.users.find(u => u.id === task.assigneeId);
          const proj = DB.projects.find(p => p.id === task.projectId);
          const over = isOverdue(task.dueDate, task.status);
          return (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", transition: "background 0.1s" }}>
              <button onClick={() => cycleStatus(task)} title="Click to cycle status" style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${task.status === "done" ? "#3B6D11" : task.status === "in-progress" ? "#185FA5" : "var(--color-border-secondary)"}`, background: task.status === "done" ? "#3B6D11" : "transparent", cursor: canEdit(task) ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>
                {task.status === "done" ? "✓" : task.status === "in-progress" ? "▷" : ""}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <PriorityDot priority={task.priority} />
                  <span style={{ fontSize: 14, fontWeight: 500, textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? "var(--color-text-secondary)" : "var(--color-text-primary)" }}>{task.title}</span>
                  <Badge status={task.status} />
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                  {proj && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>◫ {proj.name}</span>}
                  {task.dueDate && <span style={{ fontSize: 11, color: over ? "#D85A30" : "var(--color-text-secondary)", fontWeight: over ? 500 : 400 }}>
                    {over ? "⚠ Overdue · " : "Due "}{task.dueDate}
                  </span>}
                </div>
              </div>
              {assignee && <Avatar user={assignee} size={26} />}
              {canEdit(task) && (
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => openEdit(task)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "3px 6px", fontSize: 13 }}>✎</button>
                  {(user.role === "admin" || task.createdBy === user.id) && <button onClick={() => deleteTask(task)} style={{ background: "none", border: "none", cursor: "pointer", color: "#E24B4A", padding: "3px 6px", fontSize: 13 }}>✕</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editTask ? "Edit Task" : "New Task"} onClose={() => setShowModal(false)}>
          <Input label="Task Title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What needs to be done?" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Add more details…" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, resize: "vertical", minHeight: 70 }} />
          </div>
          <Select label="Project" value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}>
            <option value="">Select project…</option>
            {DB.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          {user.role === "admin" && (
            <Select label="Assignee" value={form.assigneeId} onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}>
              {DB.users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </Select>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
            <Select label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>{editTask ? "Save Changes" : "Create Task"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────
function Team({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [, forceUpdate] = useState(0);
  const refresh = () => forceUpdate(n => n + 1);

  const save = () => {
    if (!form.name.trim() || !form.email.includes("@")) return;
    if (editUser) {
      Object.assign(editUser, { name: form.name, role: form.role });
    } else {
      const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
      const colors = ["#185FA5", "#0F6E56", "#993C1D", "#534AB7", "#993556"];
      DB.users.push({ id: nextUserId++, name: form.name, email: form.email, password: form.password || "password", role: form.role, avatar: initials, color: colors[DB.users.length % colors.length] });
    }
    setShowModal(false); refresh();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Team</h1>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)", fontSize: 14 }}>{DB.users.length} members</p>
        </div>
        <Btn onClick={() => { setForm({ name: "", email: "", password: "", role: "member" }); setEditUser(null); setShowModal(true); }}>+ Add Member</Btn>
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, overflow: "hidden" }}>
        {DB.users.map((u, i) => {
          const taskCount = DB.tasks.filter(t => t.assigneeId === u.id).length;
          const doneCount = DB.tasks.filter(t => t.assigneeId === u.id && t.status === "done").length;
          return (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < DB.users.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
              <Avatar user={u} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</span>
                  <span style={{ background: u.role === "admin" ? "#185FA511" : "#0F6E5611", color: u.role === "admin" ? "#185FA5" : "#0F6E56", fontSize: 11, fontWeight: 500, padding: "2px 7px", borderRadius: 20, textTransform: "capitalize" }}>{u.role}</span>
                  {u.id === user.id && <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>you</span>}
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>{u.email}</p>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "var(--color-text-secondary)" }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{taskCount} tasks</p>
                <p style={{ margin: "2px 0 0" }}>{doneCount} done</p>
              </div>
              {u.id !== user.id && (
                <button onClick={() => { setForm({ name: u.name, email: u.email, password: "", role: u.role }); setEditUser(u); setShowModal(true); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: "4px 8px", fontSize: 13 }}>✎</button>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editUser ? "Edit Member" : "Add Member"} onClose={() => setShowModal(false)}>
          <Input label="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Alex Morgan" />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="alex@company.com" disabled={!!editUser} />
          {!editUser && <Input label="Password" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />}
          <Select label="Role" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>{editUser ? "Save Changes" : "Add Member"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  if (!currentUser) return <AuthScreen onLogin={setCurrentUser} />;

  const pageMap = {
    dashboard: <Dashboard user={currentUser} />,
    projects: <Projects user={currentUser} />,
    tasks: <Tasks user={currentUser} />,
    team: currentUser.role === "admin" ? <Team user={currentUser} /> : <Dashboard user={currentUser} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background-tertiary)" }}>
      <Sidebar current={page} onNav={setPage} user={currentUser} onLogout={() => { setCurrentUser(null); setPage("dashboard"); }} />
      <main style={{ flex: 1, marginLeft: 220, padding: "2rem", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden" }}>
        {pageMap[page] || pageMap.dashboard}
      </main>
    </div>
  );
}
