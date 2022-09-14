import React, { useEffect, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

type Props = {
  value: number;
};

const ProgressBar = ({ value }: Props) => {
  const percentageValue = `${(value * 100).toFixed(0)}%`;
  const [newValue, setNewValue] = useState(0.77);

  useEffect(() => {
    setInterval(() => {
      // randomizing value between value and 1
      setNewValue(Math.random() * (1 - value) + value);
    }, 3000);
  }, [value]);

  console.log(newValue);

  const percentageNewValue = `${(newValue * 100).toFixed(0)}%`;

  return (
    <div className="relative w-[130px] h-4 bg-black rounded-full z-0">
      <div
        className="absolute bg-green-500 h-4 rounded-full z-10"
        style={{ width: percentageValue }}
      />
      <div
        className="absolute bg-red-500 h-4 rounded-full transition-[width] duration-500"
        style={{ width: percentageNewValue }}
      />
      <div className="absolute w-full text-xs font-medium text-white flex justify-center items-center gap-x-2 z-20">
        {percentageValue}
        <ArrowRightIcon className="h-3 w-3" />
        {percentageNewValue}
      </div>
    </div>
  );
};

export default ProgressBar;
