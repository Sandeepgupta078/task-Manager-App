import { useState } from 'react';
import TaskForm from './TaskForm';
import SummaryButton from './SummaryButton';

const statusBadge = {
  pending: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
};

function TaskItem({ task, onUpdate, onDelete, onSummary }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (values) => {
    await onUpdate(task._id, values);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await onDelete(task._id);
    } catch {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="card mb-3 p-4">
        <TaskForm
          initialValues={{
            title: task.title,
            description: task.description || '',
            status: task.status,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      </div>
    );
  }

  const isDone = task.status === 'completed';

  return (
    <div className="card mb-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`mb-1 text-lg font-semibold ${isDone ? 'text-gray-400 line-through' : ''}`}>
            {task.title}
          </h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[task.status]}`}>
            {task.status}
          </span>
          <span className="ml-2 text-xs text-gray-500">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            className="btn btn-sm border border-blue-300 text-blue-600 hover:bg-blue-50"
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          <button className="btn btn-sm btn-danger-outline" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{task.description}</p>
      )}

      {task.summary && (
        <div className="mt-3 rounded border-l-4 border-blue-500 bg-blue-50 px-3 py-2 text-sm">
          <strong>AI summary:</strong> {task.summary}
        </div>
      )}

      {task.description && (
        <SummaryButton task={task} onSummary={(summary) => onSummary(task._id, summary)} />
      )}
    </div>
  );
}

export default TaskItem;
