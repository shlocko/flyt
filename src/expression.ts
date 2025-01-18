import type { Stmt } from "./statement"
import type { Token } from "./token"

export type LiteralExpr = { type: "LiteralExpr", value: any }
export type BinaryExpr = { type: "BinaryExpr", left: Expr, right: Expr, operator: Token }
export type VariableExpr = { type: "VariableExpr", name: Token }
export type AssignExpr = { type: "AssignExpr", name: Token, value: Expr }
export type GroupingExpr = { type: "GroupingExpr", expr: Expr }
export type UnaryExpr = { type: "UnaryExpr", right: Expr, operator: Token }
export type CallExpr = { type: "CallExpr", callee: Expr, paren: Token, argumnets: Expr[] }
export type StmtExpr = { type: "StmtExpr", name: Token, stmt: Stmt }


export type Expr =
	| LiteralExpr
	| BinaryExpr
	| VariableExpr
	| AssignExpr
	| GroupingExpr
	| UnaryExpr
	| CallExpr
	| StmtExpr
