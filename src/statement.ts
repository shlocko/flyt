import type { Expr } from "./expression";

export type PrintStmt = { type: "PrintStmt", expr: Expr }
export type ExprStmt = { type: "ExprStmt", expr: Expr }


export type Stmt =
	| PrintStmt
	| ExprStmt
