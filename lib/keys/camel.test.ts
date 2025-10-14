import process from "node:process";
import { camelKeys } from "./camel";
import { test, expect } from "bun:test";
import path from "node:path";
import { $ } from "bun";

test("main", (done) => {
  expect(camelKeys({ "foo-bar": true }).fooBar).toBeTrue();

  done();
});

test("exclude option", (done) => {
  expect(camelKeys({ "--": true }, { exclude: ["--"] })["--"]).toBeTrue();
  expect(camelKeys({ "foo-bar": true }, { exclude: [/^f/] })).toStrictEqual({ "foo-bar": true });

  done();
});

test("deep option", (done) => {
  expect(camelKeys({ foo_bar: true, obj: { one_two: false, arr: [{ three_four: true }] } }, { deep: true })).toStrictEqual({
    fooBar: true,
    obj: { oneTwo: false, arr: [{ threeFour: true }] },
  });

  done();
});

test("stopPaths option", (done) => {
  expect(camelKeys({ foo_bar: true, obj: { one_two: false, arr: [{ three_four: true }] } }, { deep: true, stopPaths: ["obj"] })).toStrictEqual({
    fooBar: true,
    obj: { one_two: false, arr: [{ three_four: true }] },
  });

  expect(camelKeys({ foo_bar: true, obj: { one_two: false, arr: [{ three_four: true }] } }, { deep: true, stopPaths: ["obj.arr"] })).toStrictEqual({
    fooBar: true,
    obj: { oneTwo: false, arr: [{ three_four: true }] },
  });

  expect(camelKeys({ q_w_e: [[{ foo_bar: 1 }, { one_two: 2 }, { foo_bar: 3, one_two: 4 }]] }, { deep: true, stopPaths: ["q_w_e.foo_bar"] })).toStrictEqual({
    qWE: [[{ fooBar: 1 }, { oneTwo: 2 }, { fooBar: 3, oneTwo: 4 }]],
  });

  expect(camelKeys({ a_b: 1, a_c: { c_d: 1, c_e: { e_f: 1 } } }, { deep: true, stopPaths: ["a_c.c_e"] })).toStrictEqual({
    aB: 1,
    aC: { cD: 1, cE: { e_f: 1 } },
  });

  done();
});

test("preserveConsecutiveUppercase option only", (done) => {
  expect(camelKeys({ new_foo_BAR: true }, { preserveConsecutiveUppercase: true }).newFooBAR).toBeTrue();

  done();
});

test("preserveConsecutiveUppercase and deep options", (done) => {
  expect(
    camelKeys({ p_FOO_bar: true, p_obj: { p_two: false, p_arr: [{ p_THREE_four: true }] } }, { deep: true, preserveConsecutiveUppercase: true }),
  ).toStrictEqual({ pFOOBar: true, pObj: { pTwo: false, pArr: [{ pTHREEFour: true }] } });

  done();
});

test("pascalCase option only", (done) => {
  expect(camelKeys({ "new-foo-bar": true }, { pascalCase: true }).NewFooBar).toBeTrue();

  done();
});

test("pascalCase and deep options", (done) => {
  expect(camelKeys({ p_foo_bar: true, p_obj: { p_two: false, p_arr: [{ p_three_four: true }] } }, { deep: true, pascalCase: true })).toStrictEqual({
    PFooBar: true,
    PObj: { PTwo: false, PArr: [{ PThreeFour: true }] },
  });

  done();
});

test("handles nested arrays", (done) => {
  expect(camelKeys({ q_w_e: [["a", "b"]] }, { deep: true })).toStrictEqual({ qWE: [["a", "b"]] });

  done();
});

test("accepts an array of objects", (done) => {
  expect(camelKeys([{ foo_bar: true }, { bar_foo: false }, { "bar-foo": "false" }])).toStrictEqual([{ fooBar: true }, { barFoo: false }, { barFoo: "false" }]);

  done();
});

test("different pascalCase option values", (done) => {
  expect(camelKeys({ foo_bar_UPPERCASE: true }).fooBarUppercase).toBeTrue();
  expect(camelKeys({ foo_bar_UPPERCASE: true }, { pascalCase: true }).FooBarUppercase).toBeTrue();

  expect(camelKeys({ "p-foo-bar": true, "p-obj": { "p-two": false, "p-arr": [{ "p-three-four": true }] } }, { deep: true, pascalCase: true })).toStrictEqual({
    PFooBar: true,
    PObj: { PTwo: false, PArr: [{ PThreeFour: true }] },
  });

  expect(camelKeys({ "p-foo-bar": true, "p-obj": { "p-two": false, "p-arr": [{ "p-three-four": true }] } }, { deep: true })).toStrictEqual({
    pFooBar: true,
    pObj: { pTwo: false, pArr: [{ pThreeFour: true }] },
  });

  done();
});

test("handle array of non-objects", (done) => {
  const input = ["name 1", "name 2"];
  expect(camelKeys(input)).toStrictEqual(input);

  done();
});

test("handle array of non-objects with `deep` option", (done) => {
  const input = ["name 1", "name 2"];
  expect(camelKeys(input, { deep: true })).toStrictEqual(input);

  done();
});

test("handle null and undefined inputs gracefully", (done) => {
  // These should not throw errors and should return the input as-is
  expect(camelKeys(null)).toBe(null);
  expect(camelKeys(undefined)).toBe(undefined);
  expect(camelKeys(123)).toBe(123);
  expect(camelKeys("hello")).toBe("hello");
  expect(camelKeys(true)).toBe(true);
  expect(camelKeys(false)).toBe(false);

  // With options
  expect(camelKeys(null, { deep: true })).toBe(null);
  expect(camelKeys(undefined, { deep: true })).toBe(undefined);
  expect(camelKeys(123, { pascalCase: true })).toBe(123);
  expect(camelKeys("hello", { deep: true })).toBe("hello");

  // Arrays with mixed null/undefined values
  const mixedArray = [null, undefined, "string", 123, true, { snake_case: "value" }];
  const expected = [null, undefined, "string", 123, true, { snakeCase: "value" }];

  expect(camelKeys(mixedArray)).toStrictEqual(expected);
  expect(camelKeys(mixedArray, { deep: true })).toStrictEqual(expected);

  done();
});

test("handle circular references", (done) => {
  // Simple self-reference
  const simple = {} as Record<string, any>;
  simple.self = simple;

  const simpleResult = camelKeys(simple, { deep: true });
  expect(simpleResult.self).toBe(simpleResult);

  // With key transformation
  const withSnakeCase = { some_key: "value" } as Record<string, any>;
  withSnakeCase.self_ref = withSnakeCase;

  const snakeResult = camelKeys(withSnakeCase, { deep: true });
  expect(snakeResult.someKey).toBe("value");
  expect(snakeResult.selfRef).toBe(snakeResult);

  // // Nested circular reference
  const nested = { outer_key: { inner_key: "value" } } as Record<string, any>;
  nested.outer_key.back_ref = nested;

  const nestedResult = camelKeys(nested, { deep: true });
  expect(nestedResult.outerKey.innerKey).toBe("value");
  expect(nestedResult.outerKey.backRef).toBe(nestedResult);

  // // Multiple circular references
  const object1 = { name: "object1" } as Record<string, any>;
  const object2 = { name: "object2" } as Record<string, any>;
  object1.other_obj = object2;
  object2.other_obj = object1;
  object1.self_ref = object1;

  const multiResult1 = camelKeys(object1, { deep: true });
  const multiResult2 = multiResult1.otherObj;

  expect(multiResult1.name).toBe("object1");
  expect(multiResult2.name).toBe("object2");
  expect(multiResult1.selfRef).toBe(multiResult1);
  expect(multiResult2.otherObj).toBe(multiResult1);

  // Circular reference in array
  const arrayCircular = { some_items: [] };
  arrayCircular.some_items.push(arrayCircular);

  const arrayResult = camelKeys(arrayCircular, { deep: true });
  expect(arrayResult.someItems[0]).toBe(arrayResult);

  // Without deep option should not cause issues
  const shallowCircular = {} as Record<string, any>;
  shallowCircular.self = shallowCircular;

  const result = camelKeys(shallowCircular, { deep: false });
  expect(result.self).toBe(shallowCircular); // Points to original, not transformed

  done();
});

test("use locale independent camel-case transformation", async (done) => {
  const input = { "user-id": 123 };

  const res = await runInTestProcess(input, { env: { ...process.env, LC_ALL: "tr" } });

  expect(res).toStrictEqual({ userId: 123 });

  done();
});

// Executes the library with the given arguments and resolves with the parsed result.
// Input and output is serialized via `JSON.stringify()` and `JSON.parse()`.
async function runInTestProcess(camelcaseKeysArgs: any, childProcessOptions = {}) {
  const filePath = path.resolve(import.meta.dirname, "./fixtures/child-process-for-test.ts");

  const { stdout, stderr } = await $`bun run ${filePath} '${JSON.stringify(camelcaseKeysArgs)}'`;

  if (stderr.toString()) {
    throw new Error(stderr.toString());
  }

  return JSON.parse(stdout.toString());
}
