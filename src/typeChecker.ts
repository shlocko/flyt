import { deflateSync } from "bun";
import { ParseError, RuntimeError } from "./error";
import type { Expr } from "./expression";
import type { Stmt } from "./statement";
import type { Type } from "./types";
import { hasRestParameter } from "typescript";

export const typeCheckAST = (stmts: Stmt[]) => {

	let scopes: Map<string, Type>[] = []

	const isNumericType = (valType: Type): boolean => {
		return (valType.kind === "int" || valType.kind === "float")
	}

	const conditionCompatibility = (left: Type, right: Type): Type => {
		switch (left.kind) {
			case "int": {
				if (right.kind === "int") return { kind: "int" }
				else if (right.kind === "float") return { kind: "float" }
				break
			}
			case "float": {
				if (isNumericType(right)) {
					return { kind: "float" }
				}
				break
			}
			default: if (left.kind === right.kind) return left
		}
		throw ""
	}

	const arithmeticCompatibility = (left: Type, right: Type): Type => {
		switch (left.kind) {
			case "int": {
				if (right.kind === "int") return { kind: "int" }
				else if (right.kind === "float") return { kind: "float" }
				break
			}
			case "float": {
				if (isNumericType(right)) {
					return { kind: "float" }
				}
				break
			}
			default: if (left.kind === right.kind) return left
		}
		throw ""
	}

	const slashslashCompatibility = (left: Type, right: Type): Type => {
		if (isNumericType(left) && isNumericType(right)) return { kind: "int" }
		else throw ""
	}

	const additionCompatibility = (left: Type, right: Type): Type => {
		if (isNumericType(left) && isNumericType(right)) {
			if (left.kind === "float" || right.kind === "float") {
				return { kind: "float" }
			} else {
				return { kind: "int" }
			}
		} else if (left.kind === "string" && right.kind === "string") {
			return { kind: "string" }
		} else {
			throw ""
		}
	}

	const typeCheckStmt = (stmt: Stmt) => {
		switch (stmt.type) {
			case "ExprStmt": {
				typeCheckExpr(stmt.expr)
				break
			}
			case "LetStmt": break
			case "BlockStmt": {
				for (let stmt of stmts) {
					typeCheckStmt(stmt)
				}
				break
			}
			case "IfStmt": break
			case "WhileStmt": break
			case "FnStmt": break
			case "ReturnStmt": break
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
						return expr.valueType
					}
					case "PLUS": {
						let leftType = typeCheckExpr(expr.left)
						let rightType = typeCheckExpr(expr.right)
						try {
							let opType = additionCompatibility(leftType, rightType)
							expr.valueType = opType
						} catch {

							throw new ParseError(expr.operator, "Types of operands do not match.")
						}
						return expr.valueType
					}
					case "MINUS":
					case "STAR":
					case "SLASH": {
						let leftType = typeCheckExpr(expr.left)
						let rightType = typeCheckExpr(expr.right)
						try {
							let opType = arithmeticCompatibility(leftType, rightType)
							expr.valueType = opType
						} catch {
							throw new ParseError(expr.operator, "Types of operands do not match.")
						}
						return expr.valueType
					}
					case "SLASHSLASH": {
						try {
							expr.valueType = slashslashCompatibility(typeCheckExpr(expr.left), typeCheckExpr(expr.right))

						} catch {
							throw new ParseError(expr.operator, "Can only accept numeric operands")
						}
						return expr.valueType
					}
				}
				if (expr.valueType) {
					return expr.valueType
				} else {
					throw new ParseError(expr.operator, "ValueType not assigned in typechecker.")
				}
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
				throw new ParseError(expr.value, "ValueType not assigned in typechecker.")
			}
			case "VariableExpr": break
			case "AssignExpr": break
			case "GroupingExpr": break
			case "UnaryExpr": break
			case "CallExpr": {
				for (let arg of expr.argumnets) {
					typeCheckExpr(arg)
				}
				if (expr.valueType) return expr.valueType
				else throw new ParseError(expr.paren, "ValueType not assigned in typechecker.")
			}
			case "StmtExpr": {
				if (expr.stmt.type === "FnStmt") {
					if (expr.valueType) return expr.valueType
					else throw new ParseError(expr.name, "ValueType not assigned in typechecker.")
				}
			}
		}
	}


	//console.log(stmts)
	for (let stmt of stmts) {
		typeCheckStmt(stmt)
		//console.log(stmt)
	}
	return stmts

}
