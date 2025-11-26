"use client";
import { useState } from "react";

import Select from "react-select";

export const CustomSelect = ({ options, setValue, name }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const onMenuOpen = () => setIsMenuOpen(true);
  const onMenuClose = () => setIsMenuOpen(false);

  const handleSelectChange = (selectedOption) => {
    // Pass both the name and the selected value to the setValue function
    setValue({
      id: name,
      value: selectedOption.value,
      label: selectedOption.label,
    });
  };

  return (
    <Select
      onMenuOpen={onMenuOpen}
      onMenuClose={onMenuClose}
      options={options}
      onChange={(newValue) => handleSelectChange(newValue)}
    />
  );
};
