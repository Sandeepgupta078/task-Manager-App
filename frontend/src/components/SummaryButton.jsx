import { useState } from 'react';
import { generateSummary } from '../api/ai';
import { getErrorMessage } from '../api/axios';

const MIN_LENGTH = 30;

function SummaryButton({ task, onSummary }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tooShort = (task.description || '').trim().length < MIN_LENGTH;

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await generateSummary({ taskId: task._id });
      onSummary(res.data.summary);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        className="btn btn-sm border border-sky-300 text-sky-700 hover:bg-sky-50"
        onClick={handleClick}
        disabled={loading || tooShort}
        title={tooShort ? 'Add a longer description to generate a summary' : ''}
      >
        {loading ? (
          <>
            <span className="spinner mr-2 h-3 w-3" role="status" />
            Generating...
          </>
        ) : task.summary ? (
          'Regenerate Summary'
        ) : (
          'Generate Task Summary'
        )}
      </button>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default SummaryButton;
