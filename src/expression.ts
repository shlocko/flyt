import type { Token } from "./token"

export type LiteralExpr = { type: "LiteralExpr", value: any }
export type BinaryExpr = { type: "BinaryExpr", left: Expr, right: Expr, operator: Token }
export type VariableExpr = { type: "VariableExpr", name: Token }
export type AssignExpr = { type: "AssignExpr", name: Token, value: Expr }


export type Expr =
	| LiteralExpr
	| BinaryExpr
	| VariableExpr
	| AssignExpr
