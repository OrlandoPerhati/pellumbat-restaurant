// Unit tests for the validation + helper logic in functions/_shared.js.
// Run with:  node --test tests/
//
// We use Node's built-in test runner (no jest/vitest/mocha dependency) and the
// built-in node:assert module. This is the simplest possible test setup that
// still gives you proper test/assertion output and exit codes for CI.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  partyCount,
  cleanString,
  slugify,
  activeReservation,
  validateReservation,
  validateMenuItem,
} from "../functions/_shared.js";

describe("cleanString", () => {
  test("trims whitespace", () => {
    assert.equal(cleanString("  hello  "), "hello");
  });
  test("converts null and undefined to empty string", () => {
    assert.equal(cleanString(null), "");
    assert.equal(cleanString(undefined), "");
  });
  test("coerces numbers and booleans to strings", () => {
    assert.equal(cleanString(42), "42");
    assert.equal(cleanString(true), "true");
  });
});

describe("partyCount", () => {
  test("extracts the leading number from a guest label", () => {
    assert.equal(partyCount("2 guests"), 2);
    assert.equal(partyCount("7+ guests"), 7);
    assert.equal(partyCount("12 persona"), 12);
  });
  test("returns 0 for inputs without a digit", () => {
    assert.equal(partyCount("guests"), 0);
    assert.equal(partyCount(""), 0);
    assert.equal(partyCount(null), 0);
  });
});

describe("slugify", () => {
  test("lowercases and replaces non-alphanumerics with hyphens", () => {
    assert.equal(slugify("Hello World"), "hello-world");
    assert.equal(slugify("Café  Latte!"), "caf-latte");
  });
  test("strips leading and trailing hyphens", () => {
    assert.equal(slugify("--hello--"), "hello");
    assert.equal(slugify("  ! a b ! "), "a-b");
  });
});

describe("activeReservation", () => {
  test("treats New / Confirmed / Waiting as active", () => {
    assert.equal(activeReservation({ status: "New" }), true);
    assert.equal(activeReservation({ status: "Confirmed" }), true);
    assert.equal(activeReservation({ status: "Waiting" }), true);
  });
  test("treats Completed and Canceled as inactive", () => {
    assert.equal(activeReservation({ status: "Completed" }), false);
    assert.equal(activeReservation({ status: "Canceled" }), false);
  });
});

describe("validateReservation", () => {
  const valid = {
    name: "Ana Doe",
    email: "ana@example.com",
    phone: "+355 600000",
    date: "2026-06-15",
    time: "19:00",
    party: "4 guests",
    notes: "anniversary",
  };

  test("accepts a fully populated request", () => {
    const { reservation, error } = validateReservation(valid);
    assert.equal(error, undefined);
    assert.equal(reservation.name, "Ana Doe");
    assert.equal(reservation.status, "New");
    assert.ok(reservation.id, "id should be generated");
    assert.match(reservation.cancellationCode, /^[A-F0-9]{6}$/);
    assert.ok(reservation.createdAt);
  });

  test("rejects missing required fields", () => {
    const { error } = validateReservation({ ...valid, name: "" });
    assert.match(error, /required/i);
  });

  test("rejects malformed emails", () => {
    const { error } = validateReservation({ ...valid, email: "not-an-email" });
    assert.match(error, /email/i);
  });

  test("rejects a zero-party request", () => {
    const { error } = validateReservation({ ...valid, party: "no guests" });
    assert.match(error, /party/i);
  });

  test("normalises whitespace in inputs", () => {
    const { reservation } = validateReservation({ ...valid, name: "  Ana  " });
    assert.equal(reservation.name, "Ana");
  });
});

describe("validateMenuItem", () => {
  const valid = {
    category: "drinks",
    name: "Espresso",
    description: "Single shot, ristretto pull.",
    price: "120 L",
    tags: "Coffee",
    available: true,
  };

  test("accepts a valid item", () => {
    const { item, error } = validateMenuItem(valid);
    assert.equal(error, undefined);
    assert.equal(item.name, "Espresso");
    assert.equal(item.available, true);
    assert.equal(item.id, "espresso");
  });

  test("derives the id from the name when no existingId is provided", () => {
    const { item } = validateMenuItem({ ...valid, name: "Kafe Latte" });
    assert.equal(item.id, "kafe-latte");
  });

  test("keeps the existing id when provided (for updates)", () => {
    const { item } = validateMenuItem({ ...valid, name: "Different Name" }, "fixed-id");
    assert.equal(item.id, "fixed-id");
  });

  test("rejects an invalid category", () => {
    const { error } = validateMenuItem({ ...valid, category: "appetizers" });
    assert.match(error, /category/i);
  });

  test("rejects a missing name or price", () => {
    assert.match(validateMenuItem({ ...valid, name: "" }).error, /required/i);
    assert.match(validateMenuItem({ ...valid, price: "" }).error, /required/i);
  });

  test("description is optional (bar items don't need one)", () => {
    const { item, error } = validateMenuItem({ ...valid, description: "" });
    assert.equal(error, undefined);
    assert.equal(item.description, "");
  });

  test("coerces available to a boolean", () => {
    assert.equal(validateMenuItem({ ...valid, available: "on" }).item.available, true);
    assert.equal(validateMenuItem({ ...valid, available: undefined }).item.available, false);
    assert.equal(validateMenuItem({ ...valid, available: 0 }).item.available, false);
  });
});
