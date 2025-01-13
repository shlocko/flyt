import type { Expr } from "./expression";
import type { Token } from "./token";

export type PrintStmt = { type: "PrintStmt", expr: Expr }
export type ExprStmt = { type: "ExprStmt", expr: Expr }
export type LetStmt = { type: "LetStmt", name: Token, initializer?: any }


export type Stmt =
	| PrintStmt
	| ExprStmt
	| LetStmt
