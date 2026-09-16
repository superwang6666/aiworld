"use client";

interface AuthTextInputProps {
  label: string;
  type: "email" | "password" | "text";
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function AuthTextInput({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  disabled,
}: AuthTextInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#c1c5cc] mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        disabled={disabled}
        className="w-full bg-[rgba(25,25,35,0.6)] rounded-xl px-4 py-3 border border-[rgba(80,80,95,0.3)] text-[#c1c5cc] placeholder-[#7a7a88] outline-none focus:border-[rgba(100,100,115,0.5)] transition-colors disabled:opacity-50"
      />
    </div>
  );
}
