import type { Stmt } from "./statement"
import type { Token } from "./token"
import type { Type } from "./types"

export type LiteralExpr = { type: "LiteralExpr", value: any, valueType: Type | undefined }
export type BinaryExpr = { type: "BinaryExpr", left: Expr, right: Expr, operator: Token, valueType: Type | undefined }
export type VariableExpr = { type: "VariableExpr", name: Token, valueType: Type | undefined }
export type AssignExpr = { type: "AssignExpr", name: Token, value: Expr, valueType: Type | undefined }
export type GroupingExpr = { type: "GroupingExpr", expr: Expr, valueType: Type | undefined }
export type UnaryExpr = { type: "UnaryExpr", right: Expr, operator: Token, valueType: Type | undefined }
export type CallExpr = { type: "CallExpr", callee: Expr, paren: Token, argumnets: Expr[], valueType: Type | undefined }
export type StmtExpr = { type: "StmtExpr", name: Token, stmt: Stmt, valueType: Type | undefined }


export type Expr =
	| LiteralExpr
	| BinaryExpr
	| VariableExpr
	| AssignExpr
	| GroupingExpr
	| UnaryExpr
	| CallExpr
	| StmtExpr
