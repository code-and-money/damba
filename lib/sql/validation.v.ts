import * as v from "valibot";

const startsWithHash = v.custom<string>((val) => typeof val === "string" && val.startsWith("#/"), "$ref must start with '#/'");

const hasTableAndColumn = v.custom<string>((val) => typeof val === "string" && val.split("/").length >= 3, "$ref must include table/column");

const RefColumnSchema = v.looseObject({
  $ref: v.pipe(v.string(), startsWithHash, hasTableAndColumn),
});

const PrimitiveValueSchema = v.union([v.string(), v.number(), v.boolean()]);

const NonRefColumnShape = {
  default: v.optional(PrimitiveValueSchema),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
};

const LiteralColumnSchema = v.looseObject({
  ...NonRefColumnShape,
  type: v.union([v.literal("boolean"), v.literal("number"), v.literal("integer"), v.literal("json"), v.literal("jsonb")]),
});

const StringColumnSchema = v.looseObject({
  ...NonRefColumnShape,
  type: v.literal("string"),
  format: v.optional(v.union([v.literal("uuid"), v.literal("date"), v.literal("datetime"), v.literal("date-time"), v.literal("email")])),
});

// For recursive types: create placeholders with lazy
const ColumnSchema: any = v.lazy(() =>
  v.union([
    LiteralColumnSchema,
    StringColumnSchema,
    RefColumnSchema,
    EnumTypeSchema,
    TableSchema, // defined later
    ArrayColumnSchema, // define similarly
  ]),
);

const ArrayColumnSchema = v.looseObject({
  type: v.literal("array"),
  items: ColumnSchema,
});

const EnumTypeSchema = v.looseObject({
  enum: v.optional(v.array(PrimitiveValueSchema)),
});

// Table schema — want to allow extra keys (passthrough), so use `looseObject`
const TableSchema = v.pipe(
  v.looseObject({
    type: v.literal("object"),
    properties: v.record(v.string(), ColumnSchema),
    required: v.optional(v.array(v.string())),
    "x-primary-key": v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  }),

  v.custom((val) => {
    // This is your “superRefine” logic — inspect `val`, add your custom issues
    // Unfortunately, custom only returns boolean, not issue details
    // For more complex error info, you may need composition with objectWithRest or multiple schemas
    // You can also use `v.pipe` layering or `v.check` (if available) to tag fields
    return true;
  }, "Table validation failed"),
);

// Finally the root
export const DatabaseSchema = v.looseObject({
  type: v.literal("object"),
  properties: v.record(v.string(), TableSchema),
});
