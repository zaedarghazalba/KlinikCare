# Panduan Testing KlinikCare

Dokumen ini menjelaskan cara menjalankan dan menulis unit tests untuk proyek KlinikCare.

## 🧪 Testing Framework

KlinikCare menggunakan:

- **Vitest** - Testing framework (lebih cepat dari Jest, native TypeScript support)
- **@testing-library/react** - Untuk testing komponen React
- **@testing-library/jest-dom** - Matchers tambahan untuk DOM assertions
- **jsdom** - Simulasi browser environment

## 📁 Struktur Test Files

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts          # Tests untuk helper functions
│   │   ├── validations.test.ts    # Tests untuk Zod schemas
│   │   └── rate-limit.test.ts    # Tests untuk rate limiting
│   ├── utils.ts
│   ├── validations.ts
│   └── rate-limit.ts
└── components/
    ├── __tests__/
    │   ├── Header.test.tsx         # Tests untuk Header component
    │   └── Sidebar.test.tsx       # Tests untuk Sidebar component
    └── layout/
        ├── Header.tsx
        └── Sidebar.tsx
```

## 🚀 Menjalankan Tests

### Menjalankan semua tests

```bash
npm run test:run
```

### Menjalankan tests dengan watch mode

```bash
npm run test
```

### Menjalankan tests tertentu saja

```bash
npx vitest run src/lib/__tests__/utils.test.ts
```

### Menjalankan tests dengan coverage

```bash
npm run test:coverage
```

Hasil coverage akan tersedia di folder `coverage/`.

## 📊 Test Coverage

Target coverage untuk KlinikCare:

- **lib/utils.ts** - 100% (pure functions)
- **lib/validations.ts** - 100% (schema validations)
- **lib/rate-limit.ts** - 80%+ (rate limiting logic)
- **Components** - 70%+ (critical components)

## ✍️ Menulis Tests

### Contoh Test untuk Function (utils.ts)

```typescript
import { describe, it, expect } from "vitest"
import { cn } from "../utils"

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("should handle conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })
})
```

### Contoh Test untuk Zod Schema (validations.ts)

```typescript
import { describe, it, expect } from "vitest"
import { createPatientSchema } from "../validations"

describe("createPatientSchema", () => {
  it("should validate valid patient data", () => {
    const validData = {
      name: "John Doe",
      nik: "1234567890123456",
      birthDate: "2000-01-01T00:00:00.000Z",
      gender: "MALE",
      address: "Jl. Test No. 123",
      phone: "081234567890",
    }

    const result = createPatientSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("should reject invalid data", () => {
    const invalidData = { name: "J" } // Too short
    const result = createPatientSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
```

### Contoh Test untuk Component (React)

```typescript
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import Header from "../layout/Header"

// Mock modules
vi.mock("@/lib/utils", () => ({
  getGreeting: vi.fn(() => "Selamat Pagi"),
}))

describe("Header", () => {
  it("should render with user name", () => {
    render(<Header userName="John" />)
    expect(screen.getByText(/John/)).toBeInTheDocument()
  })
})
```

## 🎭 Mocking

### Mock Next.js Modules

```typescript
// Mock usePathname
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/patient"),
}))

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}))
```

### Mock External Libraries

```typescript
vi.mock("lucide-react", () => ({
  Search: () => <div data-testid="icon-search" />,
  Bell: () => <div data-testid="icon-bell" />,
}))
```

## 🔍 Querying Elements

Gunakan methods dari `@testing-library/react`:

```typescript
// By text
screen.getByText("Dashboard")
screen.getByText(/klinik/i)

// By role
screen.getByRole("button")
screen.getByRole("textbox")

// By test id
screen.getByTestId("btn-notifications")

// By placeholder
screen.getByPlaceholderText("Cari...")
```

## ⏰ Testing Time-dependent Functions

Gunakan `vi.useFakeTimers()` untuk menguji fungsi yang bergantung pada waktu:

```typescript
import { beforeEach, afterEach } from "vitest"

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it("should return correct greeting based on time", () => {
  vi.setSystemTime(new Date(2024, 5, 15, 8, 0)) // 8 AM
  expect(getGreeting()).toBe("Selamat Pagi")
})
```

## 📈 Best Practices

1. **Test behavior, not implementation** - Uji apa yang dilakukan komponen, bukan bagaimana cara kerjanya
2. **Use descriptive test names** - Nama test harus menjelaskan apa yang diuji
3. **Arrange-Act-Assert pattern** - Susun test dengan pola: Setup -> Execute -> Verify
4. **Mock external dependencies** - Mock API calls, database operations, dll
5. **Keep tests simple** - Satu test hanya menguji satu konsep
6. **Use factories for test data** - Buat helper functions untuk generate test data

## 🐛 Debugging Tests

### Melihat output debug

```typescript
it("should do something", () => {
  render(<Component />)
  screen.debug() // Print DOM structure
})
```

### Running tests with verbose output

```bash
npx vitest run --reporter=verbose
```

### Running a single test

```typescript
it.only("should test this only", () => {
  // test code
})
```

## 🚢 CI Integration

Tambahkan workflow GitHub Actions untuk otomatisasi test:

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:run
```

## 📚 Referensi

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

Happy testing! 🧪✨
