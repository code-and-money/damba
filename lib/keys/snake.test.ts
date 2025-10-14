"use strict";

import { test } from "bun:test";
import assert from "node:assert/strict";
import { snakeKeys } from "./snake";

test("basic functionality", () => {
  assert.deepEqual(snakeKeys({ fooBar: "baz", nested: { fooBar: "baz" } }), { foo_bar: "baz", nested: { foo_bar: "baz" } });
});

test("repeated capital letters", () => {
  assert.deepEqual(snakeKeys({ fooID: 1 }), { foo_id: 1 });
});

test("shallow conversion with {deep: false}", () => {
  assert.deepEqual(snakeKeys({ fooBar: { barBaz: "qux" } }, { deep: false }), { foo_bar: { barBaz: "qux" } });
});

test("array of objects", () => {
  const result = snakeKeys([{ fooBar: "baz" }]);
  assert.deepEqual(result, [{ foo_bar: "baz" }]);
  assert.ok(Array.isArray(result));
});

test("nested arrays", () => {
  const result = snakeKeys({ foo: [0, 1, 2] });
  assert.deepEqual(result, { foo: [0, 1, 2] });
  assert.ok(Array.isArray(result.foo));
});

test("snakecase objects in arrays", () => {
  const result = snakeKeys({ foo: [0, { fooBar: "baz", nested: { fooBar: "baz" } }, 2] });
  assert.deepEqual(result, { foo: [0, { foo_bar: "baz", nested: { foo_bar: "baz" } }, 2] });
  assert.ok(Array.isArray(result.foo));
});

test("exclude", () => {
  assert.deepEqual(snakeKeys({ fooBar: "baz", barBaz: "qux" }, { exclude: ["fooBar"] }), { fooBar: "baz", bar_baz: "qux" });
  assert.deepEqual(snakeKeys({ fooBar: "baz", barBaz: "qux" }, { exclude: [/^foo/, /^bar/] }), { fooBar: "baz", barBaz: "qux" });
});

test.skip("parsing options", () => {
  const splitOnCamelCase = (input) => input.split(/(?=[A-Z])/);
  assert.deepEqual(snakeKeys({ "fooBar.baz": "qux", "bar.bazQux": "foo" }, { parsingOptions: { splitRegexp: /(?=[A-Z])/ } }), {
    "foo_bar.baz": "qux",
    "bar.baz_qux": "foo",
  });
});

test("shouldRecurse option", () => {
  assert.deepEqual(snakeKeys({ fooBar: { barBaz: "qux" }, nested: { barBaz: "qux" } }, { deep: true, shouldRecurse: (key, val) => key !== "nested" }), {
    foo_bar: { bar_baz: "qux" },
    nested: { barBaz: "qux" },
  });
  const date = new Date();
  assert.deepEqual(snakeKeys({ fooBar: { barBaz: "qux" }, fooDate: date }, { deep: true, shouldRecurse: (key, val) => !(val instanceof Date) }), {
    foo_bar: { bar_baz: "qux" },
    foo_date: date,
  });
});

test("not a plain object(primitive value)", () => {
  // @ts-expect-error: must produce type error
  assert.throws(() => snakeKeys(1), { message: "thing must be an plain object" });
});

test("not a plain object(function value)", () => {
  // @ts-expect-error: must produce type error
  assert.throws(() => snakeKeys(() => 1), { message: "thing must be an plain object" });
});

test("not a plain object(instance value)", () => {
  // @ts-expect-error: must produce type error
  assert.throws(() => snakeKeys(new Date()), { message: "thing must be an plain object" });
});

test("not array of plain objects(primitive value)", () => {
  // @ts-expect-error: must produce type error
  assert.throws(() => snakeKeys([1, { fooBar: "baz" }]), { message: "thing must be array of plain objects" });
});

test("not array of plain objects(function value)", () => {
  // @ts-expect-error: must produce type error
  assert.throws(() => snakeKeys([() => 1, { fooBar: "baz" }]), { message: "thing must be array of plain objects" });
});

test("not array of plain objects(instance value)", () => {
  // @ts-expect-error: must produce type error
  assert.throws(() => snakeKeys([new Date(), { fooBar: "baz" }]), { message: "thing must be array of plain objects" });
});

test("custom snakeCase function", () => {
  const customSnakeCase = (key) => key.replace(/([A-Z])/g, "_$1").toLowerCase();
  assert.deepEqual(snakeKeys({ fooBar: "baz", barBaz: "qux" }, { snakeCase: customSnakeCase }), { foo_bar: "baz", bar_baz: "qux" });
});

test("custom snakeCase function with nested objects", () => {
  const customSnakeCase = (key) => key.toUpperCase();
  assert.deepEqual(snakeKeys({ fooBar: { barBaz: "qux" } }, { snakeCase: customSnakeCase }), { FOOBAR: { BARBAZ: "qux" } });
});

test("undefined values in arrays with deep: true", () => {
  assert.deepEqual(snakeKeys({ fooBar: [undefined, "value"] }, { deep: true }), { foo_bar: [undefined, "value"] });

  assert.deepEqual(snakeKeys({ nested: { fooBar: [undefined, { bazQux: "value" }] } }, { deep: true }), {
    nested: { foo_bar: [undefined, { baz_qux: "value" }] },
  });
});
