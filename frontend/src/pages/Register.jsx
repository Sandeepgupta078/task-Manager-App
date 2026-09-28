import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const initialForm = { name: '', email: '', password: '', confirmPassword: '' };

function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name is too short';

    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!EMAIL_REGEX.test(form.email)) errs.email = 'Enter a valid email';

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Use at least 6 characters';

    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const { name, email, password } = form;
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type = 'text', autoComplete) => (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        className={`input ${errors[name] ? 'input-error' : ''}`}
        value={form[name]}
        onChange={handleChange}
        autoComplete={autoComplete}
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="card mx-auto mt-12 max-w-md p-6">
      <h1 className="mb-6 text-center text-2xl font-semibold">Create account</h1>

      {serverError && <div className="alert-error">{serverError}</div>}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {field('name', 'Name', 'text', 'name')}
        {field('email', 'Email', 'email', 'email')}
        {field('password', 'Password', 'password', 'new-password')}
        {field('confirmPassword', 'Confirm password', 'password', 'new-password')}

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default Register;
