import React from "react";
import Container from "components/Container";

const mockedAccounts = [
  {
    id: 1,
    label: "Subaccount 1",
    networth: 100000,
    totalPositionValue: 150000,
    debt: 50000,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 2,
    label: "Subaccount 2",
    networth: 100000,
    totalPositionValue: 150000,
    debt: 50000,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 3,
    label: "Subaccount 3",
    networth: 100000,
    totalPositionValue: 150000,
    debt: 50000,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 4,
    label: "Subaccount 4",
    networth: 100000,
    totalPositionValue: 150000,
    debt: 50000,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
];

const Portfolio = () => {
  return (
    <div className="flex flex-col gap-4">
      <Container className="flex-1">Portfolio Module</Container>
      <div className="grid grid-cols-2 gap-4">
        {mockedAccounts.map((account) => (
          <Container key={account.id}>{account.label}</Container>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
