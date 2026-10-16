import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./App.css";

const initialTasks = [
  { id: 1, title: "Complete React practice", category: "Development", priority: "High", due: "2026-10-17", completed: false },
  { id: 2, title: "Solve two DSA problems", category: "Learning", priority: "Medium", due: "2026-10-18", completed: true },
  { id: 3, title: "Update GitHub README", category: "Career", priority: "Low", due: "2026-10-19", completed: false },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default function App() {
  const [tasks, setTasks] = useState(() => readStorage("devtask-tasks", initialTasks));
  const [dark, setDark] = useState(() => readStorage("devtask-dark", false));
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    category: "Development",
    priority: "Medium",
    due: "",
  });

  useEffect(() => {
    localStorage.setItem("devtask-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("devtask-dark", JSON.stringify(dark));
  }, [dark]);

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const overdue = tasks.filter(
    (task) => !task.completed && task.due && task.due < new Date().toLocaleDateString("en-CA")
  ).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const priorityData = ["High", "Medium", "Low"].map((priority) => ({
    name: priority,
    value: tasks.filter((task) => task.priority === priority).length,
  })).filter((item) => item.value > 0);

  const statusData = [
    { name: "Completed", tasks: completed },
    { name: "Pending", tasks: pending },
  ];

  const visibleTasks = useMemo(() => {
    const result = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filter === "All" ||
        (filter === "Pending" && !task.completed) ||
        (filter === "Completed" && task.completed);

      const matchesCategory =
        categoryFilter === "All" || task.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sort === "Due date") {
        return (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31");
      }
      if (sort === "Priority") {
        return ["High", "Medium", "Low"].indexOf(a.priority) -
          ["High", "Medium", "Low"].indexOf(b.priority);
      }
      if (sort === "Alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return b.id - a.id;
    });
  }, [tasks, search, filter, categoryFilter, sort]);

  function resetForm() {
    setForm({ title: "", category: "Development", priority: "Medium", due: "" });
    setEditingId(null);
  }

  function saveTask(event) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    if (editingId !== null) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId ? { ...task, ...form, title } : task
        )
      );
    } else {
      setTasks((current) => [
        { ...form, title, id: Date.now(), completed: false },
        ...current,
      ]);
    }
    resetForm();
  }

  function editTask(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      category: task.category,
      priority: task.priority,
      due: task.due || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteTask(id) {
    if (window.confirm("Delete this task?")) {
      setTasks((current) => current.filter((task) => task.id !== id));
      if (editingId === id) resetForm();
    }
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  const categories = ["All", ...new Set(tasks.map((task) => task.category))];
  const chartColors = ["#ef6b76", "#f0ae4e", "#35b88a"];

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">D</span> DevTask</div>
        <p className="nav-label">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <button className="nav-item nav-button" onClick={() => { setFilter("Pending"); document.getElementById("tasks")?.scrollIntoView({ behavior: "smooth" }); }}>✓ &nbsp; My Tasks</button>
        <button className="nav-item nav-button" onClick={() => document.getElementById("insights")?.scrollIntoView({ behavior: "smooth" })}>◷ &nbsp; Insights</button>
        <div className="sidebar-bottom">
          <div className="avatar">D</div>
          <div><strong>Developer</strong><small>Personal workspace</small></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">WORKSPACE / OVERVIEW</span>
            <h1>My Dashboard</h1>
          </div>
          <button className="theme-toggle" onClick={() => setDark(!dark)}>
            {dark ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="welcome-label">YOUR DAILY WORKSPACE</p>
            <h2>Make today count. ✨</h2>
            <p>Small steps every day lead to big results.</p>
          </div>
          <div className="welcome-art">✦</div>
        </section>

        <section className="stats">
          <article className="stat-card">
            <div className="stat-top"><span>Total tasks</span><span className="stat-icon purple">▤</span></div>
            <h2>{tasks.length}</h2><p>All your tasks</p>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Completed</span><span className="stat-icon green">✓</span></div>
            <h2>{completed}</h2><p>Tasks finished</p>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Pending</span><span className="stat-icon orange">◷</span></div>
            <h2>{pending}</h2><p>Still in progress</p>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Overdue</span><span className="stat-icon red">!</span></div>
            <h2>{overdue}</h2><p>Past-due pending tasks</p>
          </article>
        </section>

        <section className="insights-grid" id="insights">
          <article className="panel chart-panel">
            <div className="panel-heading">
              <div><h2>Task progress</h2><p>{progress}% of tasks completed</p></div>
              <span className="chart-mark">↗</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="tasks" name="Tasks" fill="#7565ed" radius={[6, 6, 0, 0]} maxBarSize={65} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="panel chart-panel">
            <div className="panel-heading">
              <div><h2>Priority breakdown</h2><p>Tasks by priority level</p></div>
              <span className="chart-mark">◉</span>
            </div>
            <div className="pie-area">
              {priorityData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={48} outerRadius={76} paddingAngle={4}>
                      {priorityData.map((entry) => (
                        <Cell key={entry.name} fill={chartColors[["High", "Medium", "Low"].indexOf(entry.name)]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: "var(--muted)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="empty">Add tasks to see your chart.</div>}
            </div>
          </article>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-heading">
              <div><h2>{editingId !== null ? "Edit task" : "Create a task"}</h2><p>Plan your next step</p></div>
              {editingId !== null && <button className="text-button" onClick={resetForm}>Cancel</button>}
            </div>
            <form onSubmit={saveTask}>
              <label>Task name</label>
              <input placeholder="What do you need to do?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <div className="form-row">
                <div><label>Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Development</option><option>Learning</option><option>Career</option><option>Personal</option></select></div>
                <div><label>Priority</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></div>
              </div>
              <label>Due date</label>
              <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} />
              <button className="primary-button" type="submit">{editingId !== null ? "Save changes" : "+ Add new task"}</button>
            </form>
          </div>

          <div className="panel list-panel" id="tasks">
            <div className="panel-heading">
              <div><h2>My Tasks</h2><p>Keep track of what matters</p></div>
              <span className="count-badge">{visibleTasks.length}</span>
            </div>
            <input className="search" placeholder="⌕  Search tasks or categories..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="filter-row">
              <div className="filters">
                {["All", "Pending", "Completed"].map((item) => <button key={item} className={filter === item ? "filter active-filter" : "filter"} onClick={() => setFilter(item)}>{item}</button>)}
              </div>
              <select className="sort-select" aria-label="Sort tasks" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option>Newest</option><option>Due date</option><option>Priority</option><option>Alphabetical</option>
              </select>
            </div>
            <div className="category-filters">
              {categories.map((category) => <button key={category} className={categoryFilter === category ? "category-chip selected" : "category-chip"} onClick={() => setCategoryFilter(category)}>{category}</button>)}
            </div>
            <div className="task-list">
              {visibleTasks.map((task) => (
                <article className="task-item" key={task.id}>
                  <button className={task.completed ? "check checked" : "check"} onClick={() => toggleTask(task.id)} aria-label={task.completed ? "Mark pending" : "Mark completed"}>{task.completed ? "✓" : ""}</button>
                  <div className="task-info">
                    <h3 className={task.completed ? "task-done" : ""}>{task.title}</h3>
                    <div className="task-meta"><span>{task.category}</span>{task.due && <span>· Due {task.due}</span>}</div>
                    <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority} priority</span>
                  </div>
                  <div className="task-actions"><button title="Edit task" onClick={() => editTask(task)}>✎</button><button title="Delete task" onClick={() => deleteTask(task.id)}>×</button></div>
                </article>
              ))}
              {visibleTasks.length === 0 && <div className="empty"><span>☁</span><h3>No tasks found</h3><p>Add a task or change your filters.</p></div>}
            </div>
          </div>
        </section>

        <footer>DevTask <span>·</span> Stay focused. Keep building. 🚀</footer>
      </main>
    </div>
  );
}