import { ParseError } from "./error";
import type { Expr, LiteralExpr } from "./expression";
import type { Stmt } from "./statement";
import type { Token } from "./token";
import type { Type, StringType, IntType, BooleanType, FloatType } from "./types";

export const typeCheckAST = (stmts: Stmt[]) => {

	let scopes: Map<string, Type>[] = []

	const conditionCompatibility = (left: Type, right: Type): Type => {
		switch (left.kind) {
			case "int": {
				if (right.kind === "int") return { kind: "int" }
				else if (right.kind === "float") return { kind: "float" }
			}
		}
		throw ""
	}

	const typeCheckStmt = (stmt: Stmt) => {
		switch (stmt.type) {
			case "ExprStmt": {
				typeCheckExpr(stmt.expr)
			}
		}
	}

	const typeCheckExpr = (expr: Expr): Type => {
		switch (expr.type) {
			case "BinaryExpr": {
				switch (expr.operator.type) {
					case "EQUALEQUAL":
					case "BANGEQUAL":
					case "LESSTHAN":
					case "LESSEQUAL":
					case "GREATERTHAN":
					case "GREATEREQUAL": {
						let leftType = typeCheckExpr(expr.left)
						let rightType = typeCheckExpr(expr.right)
						try {
							let opType = conditionCompatibility(leftType, rightType)
							expr.valueType = opType
						} catch {
							throw new ParseError(expr.operator, "Types of operands do not match.")
						}
					}
				}
				break
			}
			case "LiteralExpr": {
				let value = expr.value
				switch (typeof value) {
					case "boolean": {
						expr.valueType = { kind: "bool" }
						return expr.valueType
					}
					case "string": {
						expr.valueType = { kind: "string" }
						return expr.valueType
					}
					case "number": {
						if (Math.floor(value) === value) {
							expr.valueType = { kind: "int" }
							return expr.valueType
						}
						else {
							expr.valueType = { kind: "float" }
							return expr.valueType
						}
					}
				}
				break
			}
			case "VariableExpr":
			case "AssignExpr":
			case "GroupingExpr":
			case "UnaryExpr":
			case "CallExpr":
			case "StmtExpr":
		}
	}


	console.log(stmts)
	for (let stmt of stmts) {
		typeCheckStmt(stmt)
		console.log(stmt)
	}
	return stmts

}
