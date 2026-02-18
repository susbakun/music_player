import { FormatOptions } from "@/shared/constants";
import { FileFormat } from "@/shared/types";
import { ChangeEvent } from "react";
import { CustomSelect } from "@/components/Custom/CustomSelect";

type SearchFilterBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  format: FileFormat;
  onFormatChange: (value: FileFormat) => void;
};

export const SearchFilterBar = ({
  searchQuery,
  onSearchChange,
  format,
  onFormatChange,
}: SearchFilterBarProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by song name..."
        className="w-full sm:w-2/3 rounded-md bg-white/5 px-3 py-2 
        text-sm outline-none focus:ring-2 focus:ring-white/40 select-none"
      />
      <CustomSelect<FileFormat>
        className="w-full sm:w-1/3"
        value={format}
        options={FormatOptions as ReadonlyArray<{ value: FileFormat; text: string }>}
        onChange={onFormatChange}
      />
    </div>
  );
};

