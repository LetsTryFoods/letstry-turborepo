import React from 'react';
import { UseFormRegister, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  required?: boolean;
  type?: string;
  placeholder?: string;
  validation?: RegisterOptions<T>;
}

export const FormInput = <T extends FieldValues>({
  label,
  name,
  register,
  required = false,
  type = 'text',
  placeholder,
  validation,
}: FormInputProps<T>) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        {...register(name, validation)}
        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4A6A] focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  );
};
