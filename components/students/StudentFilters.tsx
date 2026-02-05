"use client";

import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { districtList } from "@/lib/validators/student";

type StudentFiltersProps = {
  search: string;
  district: string;
  onSearchChange: (value: string) => void;
  onDistrictChange: (value: string) => void;
};

export default function StudentFilters({
  search,
  district,
  onSearchChange,
  onDistrictChange
}: StudentFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchChange(localSearch.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        <Input
          label="Search"
          placeholder="Search by student code, name, or city"
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
        />
      </div>
      <div className="w-full md:w-64">
        <Select label="District" value={district} onChange={(event) => onDistrictChange(event.target.value)}>
          <option value="">All districts</option>
          {districtList.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
