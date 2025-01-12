import type { Token } from "./token"

export type LiteralExpr = { type: "LiteralExpr", value: any }
export type BinaryExpr = { type: "BinaryExpr", left: Expr, right: Expr, operator: Token }


export type Expr =
	| LiteralExpr
	| BinaryExpr
