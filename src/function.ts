import type { Environment } from "./environment";

export type funct = { type: "function" | "method", arity: number, call: Function, closure: Environment }
