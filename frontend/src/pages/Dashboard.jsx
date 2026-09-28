import { useCallback, useEffect, useRef, useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { createTask, deleteTask, getTasks, updateTask } from '../api/tasks';
import { getErrorMessage } from '../api/axios';

const newRequestId = () =>
  window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // one id per "new task" attempt, so a double submit creates only one record
  const requestIdRef = useRef(newRequestId());

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTasks({ page, limit: 10, status: statusFilter || undefined });
      setTasks(res.data.tasks);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (values) => {
    try {
      const res = await createTask({ ...values, requestId: requestIdRef.current });
      requestIdRef.current = newRequestId();

      const created = res.data.task;
      setTasks((prev) =>
        prev.some((t) => t._id === created._id) ? prev : [created, ...prev]
      );
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const handleUpdate = async (id, values) => {
    try {
      const res = await updateTask(id, values);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  };

  const handleSummary = (id, summary) => {
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, summary } : t)));
  };

  const changeFilter = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card mb-6 p-5">
        <h2 className="mb-3 text-lg font-semibold">New task</h2>
        <TaskForm onSubmit={handleCreate} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">My tasks</h2>
        <select className="input w-auto" value={statusFilter} onChange={changeFilter}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12 text-blue-600">
          <span className="spinner h-8 w-8" role="status" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="py-8 text-center text-gray-500">No tasks yet. Add your first one above.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onSummary={handleSummary}
          />
        ))
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            className="btn btn-sm btn-outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-sm btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
