import type { Stmt } from "./statement"
import type { Token } from "./token"

export type LiteralExpr = { type: "LiteralExpr", value: any, valueType: string | undefined }
export type BinaryExpr = { type: "BinaryExpr", left: Expr, right: Expr, operator: Token, valueType: string | undefined }
export type VariableExpr = { type: "VariableExpr", name: Token, valueType: string | undefined }
export type AssignExpr = { type: "AssignExpr", name: Token, value: Expr, valueType: string | undefined }
export type GroupingExpr = { type: "GroupingExpr", expr: Expr, valueType: string | undefined }
export type UnaryExpr = { type: "UnaryExpr", right: Expr, operator: Token, valueType: string | undefined }
export type CallExpr = { type: "CallExpr", callee: Expr, paren: Token, argumnets: Expr[], valueType: string | undefined }
export type StmtExpr = { type: "StmtExpr", name: Token, stmt: Stmt, valueType: string | undefined }


export type Expr =
	| LiteralExpr
	| BinaryExpr
	| VariableExpr
	| AssignExpr
	| GroupingExpr
	| UnaryExpr
	| CallExpr
	| StmtExpr
