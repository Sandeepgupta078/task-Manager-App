import { useState } from "react";

const emptyTask = { title: "", description: "", status: "pending" };

// Used both for adding a new task and editing an existing one
function TaskForm({
  initialValues = emptyTask,
  onSubmit,
  onCancel,
  submitLabel = "Add Task",
}) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return; // ignore double clicks while the request is in flight

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (form.title.length > 120) {
      setError("Title should be under 120 characters");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({ ...form, title: form.title.trim() });
      if (!onCancel) setForm(emptyTask);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="alert-error">{error}</div>}

      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="title"
          className="input md:col-span-2"
          placeholder="Task title"
          value={form.title}
          onChange={handleChange}
        />
        <select
          name="status"
          className="input"
          value={form.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <textarea
          name="description"
          className="input md:col-span-3"
          rows={3}
          placeholder="Description (optional)"
          value={form.description}
          onChange={handleChange}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
