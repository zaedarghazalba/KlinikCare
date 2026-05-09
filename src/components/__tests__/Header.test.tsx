import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import Header from "../layout/Header"

// Mock the getGreeting function
vi.mock("@/lib/utils", () => ({
  getGreeting: vi.fn(() => "Selamat Pagi"),
}))

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render with user name", () => {
    render(<Header userName="John Doe" />)

    expect(screen.getByText(/John/)).toBeInTheDocument()
    expect(screen.getByText(/Selamat Pagi/)).toBeInTheDocument()
  })

  it("should display only first name with greeting", () => {
    render(<Header userName="Jane Smith" />)

    // Should show "Jane" not "Jane Smith"
    expect(screen.getByText(/Jane/)).toBeInTheDocument()
    expect(screen.queryByText(/Smith/)).not.toBeInTheDocument()
  })

  it("should render search input", () => {
    render(<Header userName="Test User" />)

    const searchInput = screen.getByPlaceholderText("Cari...")
    expect(searchInput).toBeInTheDocument()
  })

  it("should render notification button", () => {
    render(<Header userName="Test User" />)

    // Button has no accessible name, so use getByRole with id
    const notificationBtn = screen.getByRole("button")
    expect(notificationBtn).toBeInTheDocument()
    expect(notificationBtn).toHaveAttribute("id", "btn-notifications")
  })

  it("should have sticky header styling", () => {
    const { container } = render(<Header userName="Test" />)

    const header = container.querySelector("header")
    expect(header).toHaveClass("sticky")
    expect(header).toHaveClass("top-0")
  })
})
