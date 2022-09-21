import React from "react";

import { formatCurrency } from "utils/formatters";

const CreditManager = () => {
  return (
    <div className="absolute inset-0 left-auto p-2 w-[400px] bg-background-2 border-l border-white/20">
      <div className="p-2 bg-[#D8DAEA] rounded-lg text-[#585A74] text-sm">
        <h3>Credit Manager Module</h3>
        <div>Actions Container</div>
        <div className="flex justify-between">
          <div>Total Position:</div>
          <div className="font-semibold">{formatCurrency(123)}</div>
        </div>
        <div className="flex justify-between">
          <div>Total Liabilities:</div>
          <div className="font-semibold">{formatCurrency(666.333)}</div>
        </div>
      </div>
    </div>
  );
};

export default CreditManager;
