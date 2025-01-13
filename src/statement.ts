import type { Expr } from "./expression";
import type { Token } from "./token";

export type PrintStmt = { type: "PrintStmt", expr: Expr }
export type ExprStmt = { type: "ExprStmt", expr: Expr }
export type LetStmt = { type: "LetStmt", name: Token, initializer?: any }
export type BlockStmt = { type: "BlockStmt", stmts: Stmt[] }
export type IfStatement = { type: "IfStatement", condition: Expr, thenBlock: Stmt, elseBlock: Stmt }


export type Stmt =
	| PrintStmt
	| ExprStmt
	| LetStmt
	| BlockStmt
