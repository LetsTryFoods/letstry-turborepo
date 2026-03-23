'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { submitContactMessage, SubmitContactInput } from '@/lib/queries/contact';

export default function ContactUsPage() {
  const [successMsg, setSuccessMsg] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<SubmitContactInput>({
    mode: 'onChange'
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: submitContactMessage,
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMsg(data.message);
        reset();
      } else {
        throw new Error(data.message);
      }
    },
  });

  const onSubmit = (data: SubmitContactInput) => {
    setSuccessMsg('');
    mutate(data);
  };

  const displayError = (error as Error)?.message;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-6 text-sm text-yellow-600 hover:underline">
          ← Back to home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-yellow-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h1>
            <p className="text-gray-500 text-sm">
              Have a question, complaint, or feedback? Tell us about it and we'll get back to you.
            </p>
          </div>

          {successMsg ? (
            <div className="flex flex-col items-center justify-center text-center py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-lg font-medium text-gray-900">{successMsg}</p>
              <button
                onClick={() => setSuccessMsg('')}
                className="mt-6 text-sm text-yellow-600 hover:underline"
              >
                Submit another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', { 
                    required: 'Phone Number is required',
                    pattern: {
                      value: /^\d{10}$/,
                      message: 'Phone number must be exactly 10 digits'
                    }
                  })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors"
                  placeholder="e.g. 9876543210"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register('message', { required: 'Message is required' })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm transition-colors resize-none"
                  placeholder="Tell us what happened..."
                />
                {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
              </div>

              {displayError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{displayError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || !isValid}
                style={{ backgroundColor: '#0c5273' }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c5273] disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:brightness-90"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
