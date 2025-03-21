import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UserProfile from "./UserProfile";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        name: "Kasidit Suwanritdej",
        email: "kasidit.suwa@gmail.com",
      }),
  })
);

describe("UserProfile", () => {
  it("displays user data after successful fetch", async () => {
    render(<UserProfile userId="1" />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      const heading = screen.getByText("Kasidit Suwanritdej");
      expect(heading.tagName).toBe("H1");
    });

    await waitFor(() => {
      const element = screen.getByText("kasidit@gmail.com");
      expect(element.tagName).toBe("P");
    });
  });

  it("displays an error message if the fetch fails", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Failed to fetch user data"))
    );

    render(<UserProfile userId="2" />);

    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to fetch user data")
      ).toBeInTheDocument();
    });
  });
});

