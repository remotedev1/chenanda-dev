"use client";

import { cn, removeUnderScore } from "@/lib/utils";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import React, { useEffect, useState } from "react";

const RadioCard = ({ options, onChange, defaultSelected }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (defaultSelected) {
      setSelectedOption(defaultSelected);
    }
  }, [defaultSelected]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    if (onChange) {
      onChange(option);
    }
  };


  return (
    <div className="flex justify-center items-center flex-wrap">
      {options.map((option, index) => (
        <label key={index} className="cursor-pointer m-1">
          <input
            type="radio"
            name="radio-card"
            className="hidden"
            value={option.value}
            checked={selectedOption === option.value}
            onChange={() => handleOptionChange(option.value)}
          />
          <div
            className={cn(
              "bg-white border rounded-sm shadow-md p-1 transition duration-300 ease-in-out transform hover:scale-105",
              {
                "bg-green-300": selectedOption === option.value,
              }
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-black">{removeUnderScore(option.label)}</span>
              </div>

              {selectedOption === option.value && (
                <CheckCircledIcon className="w-6 h-6 text-blue-500" />
              )}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default RadioCard;
