import React from 'react';
import { UseFormRegister, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface PhoneInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  required?: boolean;
  placeholder?: string;
  validation?: RegisterOptions<T>;
  countryCode?: string;
}

export const PhoneInput = <T extends FieldValues>({
  label,
  name,
  register,
  required = false,
  placeholder,
  validation,
  countryCode = '+91',
}: PhoneInputProps<T>) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="w-20 px-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium">
          {countryCode}
        </div>
        <input
          type="tel"
          {...register(name, validation)}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F4A6A] focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
