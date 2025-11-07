import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login or dashboard", () => {
  render(<App />);
  const texts = screen.getAllByText(/Login|Dashboard/i);
  expect(texts.length).toBeGreaterThan(0);
});
