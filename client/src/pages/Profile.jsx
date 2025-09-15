import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' }
  });

  useEffect(() => {
    reset({ name: user?.name || '', email: user?.email || '' });
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      const updated = await apiClient.updateMe({ name: values.name, email: values.email });
      toast.success('Profile updated');
      // No direct user setter here; AuthProvider will re-fetch on next load if needed
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h1>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input {...register('name', { required: true, minLength: 2 })} className="input mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" {...register('email', { required: true })} className="input mt-1" />
            </div>
            <div>
              <button disabled={isSubmitting} type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Security</h2>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}

function PasswordForm() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values) => {
    if (!values.password || values.password.length < 6) return;
    try {
      await apiClient.updateMe({ password: values.password });
      toast.success('Password updated');
      reset({ password: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <input type="password" {...register('password', { minLength: 6 })} className="input mt-1" placeholder="At least 6 characters" />
      </div>
      <button disabled={isSubmitting} type="submit" className="btn btn-secondary">Update Password</button>
    </form>
  );
}


