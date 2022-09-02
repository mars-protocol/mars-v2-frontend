import React from "react";
import Container from "components/Container";

const Portfolio = () => {
  return (
    <div className="flex flex-col gap-4">
      <Container className="flex-1">Portfolio Module</Container>
      <div className="grid grid-cols-2 gap-4">
        <Container>Subaccount 1</Container>
        <Container>Subaccount 2</Container>
        <Container>Subaccount 3</Container>
        <Container>Subaccount 4</Container>
      </div>
    </div>
  );
};

export default Portfolio;
