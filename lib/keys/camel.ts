import mapObject, { type Mapper } from "map-obj";
import camelcase from "camelcase";
import Cache from "quick-lru";

function has(array: readonly any[] | undefined, key: string) {
  return !!array?.some((element) => {
    if (typeof element === "string") {
      return element === key;
    }

    element.lastIndex = 0;

    return element.test(key);
  });
}

const cache = new Cache<string, string>({ maxSize: 100_000 });

function isObject(value: any): value is Record<PropertyKey, any> {
  return typeof value === "object" && value !== null && !(value instanceof RegExp) && !(value instanceof Error) && !(value instanceof Date);
}

function transform(input: unknown, options: Options = {}, isSeen: WeakMap<WeakKey, any> = new WeakMap(), parentPath?: string) {
  if (!isObject(input)) {
    return input;
  }

  // Check for circular references
  if (isSeen.has(input)) {
    return isSeen.get(input);
  }

  const { exclude, pascalCase = false, stopPaths, deep = false, preserveConsecutiveUppercase = false } = options;

  const stopPathsSet = new Set(stopPaths);

  // Handle arrays directly
  if (Array.isArray(input)) {
    const result: any[] = [];
    isSeen.set(input, result);

    for (const item of input) {
      result.push(isObject(item) ? transform(item, options, isSeen, parentPath) : item);
    }

    return result;
  }

  // Pre-allocate the result object for circular reference handling
  const result = {} as Record<PropertyKey, any>;
  isSeen.set(input, result);

  function makeMapper(currentParentPath?: string | undefined): Mapper<Record<string, any>, string, any> {
    return (key: string, value: any) => {
      // Handle deep transformation
      if (deep && isObject(value)) {
        const path = currentParentPath === undefined ? key : `${currentParentPath}.${key}`;

        if (!stopPathsSet.has(path)) {
          // Handle arrays and objects recursively
          value = Array.isArray(value)
            ? value.map((item) => (isObject(item) ? transform(item, options, isSeen, path) : item))
            : transform(value, options, isSeen, path);
        }
      }

      // Skip transformation for excluded keys
      // Only transform string keys (preserve symbols and numbers)
      if (typeof key === "string" && !(exclude && has(exclude, key))) {
        const cacheKey = pascalCase ? `${key}_` : key;

        const key_ = cache.get(cacheKey);
        if (key_) {
          key = key_;
        } else {
          const returnValue = camelcase(key, { pascalCase, locale: false, preserveConsecutiveUppercase });

          // Only cache reasonable length keys to prevent memory abuse
          if (key.length < 100) {
            cache.set(cacheKey, returnValue);
          }

          key = returnValue;
        }
      }

      return [key, value];
    };
  }

  const mappedResult = mapObject(input, makeMapper(parentPath), { deep: false });

  // Copy properties to the pre-allocated result for circular reference handling
  Object.assign(result, mappedResult);

  // Preserve symbol keys (mapObject doesn't handle them)
  const symbols = Object.getOwnPropertySymbols(input);
  for (const symbol of symbols) {
    result[symbol] = deep && isObject(input[symbol]) ? transform(input[symbol], options, isSeen, parentPath) : input[symbol];
  }

  return result;
}

export function camelKeys(input: unknown, options?: Options) {
  const isSeen = new WeakMap();

  if (Array.isArray(input)) {
    const returnArray: any[] = [];
    // More efficient array handling - directly map the array
    for (let i = 0; i < input.length; i++) {
      if (isObject(input[i])) {
        returnArray.push(transform(input[i], options, isSeen, String(i)));
      } else {
        returnArray.push(input[i]);
      }
    }

    return returnArray;

    // return input.map((item, index) => (isObject(item) ? transform(item, options, isSeen, String(index)) : item));
  }

  return transform(input, options, isSeen);
}

export type Options = {
  /**
	Exclude keys from being camel-cased.

	If this option can be statically determined, it's recommended to add `as const` to it.

	@default []
	*/
  readonly exclude?: ReadonlyArray<string | RegExp>;

  /**
	Recurse nested objects and objects in arrays.

	@default false

	@example
	```
	import camelcaseKeys from 'camelcase-keys';

	const object = {
		'foo-bar': true,
		nested: {
			unicorn_rainbow: true
		}
	};

	camelcaseKeys(object, {deep: true});
	//=> {fooBar: true, nested: {unicornRainbow: true}}

	camelcaseKeys(object, {deep: false});
	//=> {fooBar: true, nested: {unicorn_rainbow: true}}
	```
	*/
  readonly deep?: boolean;

  /**
	Uppercase the first character: `bye-bye` → `ByeBye`

	@default false

	@example
	```
	import camelcaseKeys from 'camelcase-keys';

	camelcaseKeys({'foo-bar': true}, {pascalCase: true});
	//=> {FooBar: true}

	camelcaseKeys({'foo-bar': true}, {pascalCase: false});
	//=> {fooBar: true}
	````
	*/
  readonly pascalCase?: boolean;

  /**
	Preserve consecutive uppercase characters: `foo-BAR` → `FooBAR`

	@default false

	@example
	```
	import camelcaseKeys from 'camelcase-keys';

	camelcaseKeys({'foo-BAR': true}, {preserveConsecutiveUppercase: true});
	//=> {fooBAR: true}

	camelcaseKeys({'foo-BAR': true}, {preserveConsecutiveUppercase: false});
	//=> {fooBar: true}
	````
	*/
  readonly preserveConsecutiveUppercase?: boolean;

  /**
	Exclude children at the given object paths in dot-notation from being camel-cased. For example, with an object like `{a: {b: '🦄'}}`, the object path to reach the unicorn is `'a.b'`.

	If this option can be statically determined, it's recommended to add `as const` to it.

	@default []

	@example
	```
	import camelcaseKeys from 'camelcase-keys';

	const object = {
		a_b: 1,
		a_c: {
			c_d: 1,
			c_e: {
				e_f: 1
			}
		}
	};

	camelcaseKeys(object, {
		deep: true,
		stopPaths: [
			'a_c.c_e'
		]
	}),
	// {
	// 	aB: 1,
	// 	aC: {
	// 		cD: 1,
	// 		cE: {
	// 			e_f: 1
	// 		}
	// 	}
	// }
	```
	*/
  readonly stopPaths?: readonly string[];
};
