import { useEffect, useRef, useState } from "react";

export type CustomSelectOption<T extends string> = {
    value: T;
    text: string;
};

type CustomSelectProps<T extends string> = {
    value: T;
    options: ReadonlyArray<CustomSelectOption<T>>;
    onChange: (value: T) => void;
    className?: string;
};

export function CustomSelect<T extends string>({
    value,
    options,
    onChange,
    className,
}: CustomSelectProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selected = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className ?? ""}`} ref={dropdownRef}>
        <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="w-full rounded-md bg-white/5 px-3 py-2 text-sm outline-none
            focus:ring-2 focus:ring-white/40 flex items-center justify-between
            hover:bg-white/10 transition-colors"
        >
            <span>{selected?.text ?? ""}</span>
            <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
            </svg>
        </button>

        {isOpen && (
            <div
            className="absolute z-50 w-full mt-1 rounded-md bg-white/5 backdrop-blur-sm
            border border-white/10 shadow-lg overflow-hidden"
            >
            {options.map((option) => (
                <button
                key={option.value}
                type="button"
                onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                    value === option.value ? "bg-white/10 font-medium" : ""
                }`}
                >
                {option.text}
                </button>
            ))}
            </div>
        )}
        </div>
    );
}
