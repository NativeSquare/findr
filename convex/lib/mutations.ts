// convex/lib/generateFunctions.ts
import {
  customCtx,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { Triggers } from "convex-helpers/server/triggers";
import { GenericValidator, v } from "convex/values";
import type { DataModel } from "../_generated/dataModel";
import { mutation as rawMutation } from "../_generated/server";

export function generateMutations<
  TableName extends keyof DataModel,
  DocumentSchema extends Record<string, GenericValidator>,
>(table: TableName, schema: DocumentSchema, triggers: Triggers<DataModel>) {
  const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB));
  const doc = v.object(schema);

  const insert = mutation({
    args: doc,
    handler: async (ctx, args) => {
      return await ctx.db.insert(table, args);
    },
  });

  const patch = mutation({
    args: {
      id: v.id(table),
      data: doc,
    },
    handler: async (ctx, args) => {
      return await ctx.db.patch(table, args.id, args.data);
    },
  });

  const replace = mutation({
    args: {
      id: v.id(table),
      data: doc,
    },
    handler: async (ctx, args) => {
      return await ctx.db.replace(table, args.id, args.data);
    },
  });

  const del = mutation({
    args: { id: v.id(table) },
    handler: async (ctx, args) => {
      await ctx.db.delete(table, args.id);
      return null;
    },
  });

  return {
    delete: del,
    insert,
    patch,
    replace,
  };
}
