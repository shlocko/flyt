import { ParseError } from "./error";
import type { Expr } from "./expression";
import type { Stmt } from "./statement";
import type { Type } from "./types";
import type { TokenType } from "./tokenType";

export const typeCheckAST = (stmts: Stmt[]) => {

	let scopes: Map<string, Type>[] = []
	scopes.push(new Map())

	const nameExists = (name: string): { scope: number, valueType: Type } | undefined => {
		for (let i = scopes.length - 1; i >= 0; i--) {
			if (scopes[i].has(name)) {
				return { scope: i, valueType: scopes[i].get(name)! }
			}
		}
		return undefined
	}

	let types: Map<string, Type> = new Map()
	types.set("string", { kind: "string" })
	types.set("int", { kind: "int" })
	types.set("float", { kind: "float" })
	types.set("bool", { kind: "bool" })
	types.set("function", { kind: "function" })

	const isNumericType = (valType: Type): boolean => {
		return (valType.kind === "int" || valType.kind === "float")
	}

	const equalityCompatibility = (left: Type, right: Type): Type => {
		if (isNumericType(left) && isNumericType(right)) {
			return { kind: "bool" }
		} else if (left.kind === right.kind) {
			return { kind: "bool" }
		} else {
			throw ""
		}
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

	const additionCompatibility = (left: Type, right: Type, op: TokenType): Type => {
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

	const comparisonCompatibility = (left: Type, right: Type): Type => {
		if (isNumericType(left) && isNumericType(right)) {
			return { kind: "bool" }
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
			case "LetStmt": {
				let valueType = null
				let initializerType = null
				if (stmt.typeToken) {
					if (!types.has(stmt.typeToken.lexeme)) {
						throw new ParseError(stmt.typeToken, "Not a valid type.")
					}
					valueType = types.get(stmt.typeToken.lexeme)!
					stmt.valueType = valueType
				}
				if (stmt.initializer) {
					initializerType = typeCheckExpr(stmt.initializer)
					console.log(initializerType)
				}
				if (initializerType && valueType && initializerType.kind !== valueType.kind) {
					throw new ParseError(stmt.name, "Invalid assignment type to variable.")
				}
				if (!valueType && !initializerType) {
					throw new ParseError(stmt.name, "Must annotate variable type when cannot be inferred.")
				}
				if (!valueType && initializerType) {
					stmt.valueType = initializerType
				}
				scopes[scopes.length - 1].set(stmt.name.lexeme, stmt.valueType!)

				//console.log(stmt.valueType, stmt.typeToken, stmt.initializer)
				console.log(scopes)
				break
			}
			case "BlockStmt": {
				scopes.push(new Map())
				for (let st of stmt.stmts) {
					typeCheckStmt(st)
				}
				scopes.pop()
				break
			}
			case "IfStmt": {
				for (let st of stmt.thenBlock.stmts) {
					typeCheckStmt(st)
				}
				if (stmt.elseBlock?.type === "BlockStmt") {
					for (let st of stmt.elseBlock.stmts) {
						typeCheckStmt(st)
					}
				} else if (stmt.elseBlock?.type === "IfStmt") {
					typeCheckStmt(stmt.elseBlock)
				}
				break
			}
			case "WhileStmt": {
				for (let st of stmt.doBlock.stmts) {
					typeCheckStmt(st)
				}
				return
			}
			case "FnStmt": {
				scopes[scopes.length - 1].set(stmt.name.lexeme, { kind: "function" })
				break
			}
			case "ReturnStmt": break
		}
	}

	const typeCheckExpr = (expr: Expr): Type => {
		switch (expr.type) {
			case "BinaryExpr": {
				console.log("binary")
				switch (expr.operator.type) {
					case "EQUALEQUAL":
					case "BANGEQUAL": {
						let leftType = typeCheckExpr(expr.left)
						let rightType = typeCheckExpr(expr.right)
						try {
							let opType = equalityCompatibility(leftType, rightType)
							expr.valueType = opType
						} catch {
							throw new ParseError(expr.operator, "Invalid comparison types.")
						}
						return expr.valueType
					}
					case "LESSTHAN":
					case "LESSEQUAL":
					case "GREATERTHAN":
					case "GREATEREQUAL": {
						let leftType = typeCheckExpr(expr.left)
						let rightType = typeCheckExpr(expr.right)
						let operator = expr.operator
						try {
							let opType = comparisonCompatibility(leftType, rightType)
							expr.valueType = opType
						} catch {
							throw new ParseError(expr.operator, "Invalid comparison types.")
						}
						return expr.valueType
					}
					case "PLUS": {
						let leftType = typeCheckExpr(expr.left)
						let rightType = typeCheckExpr(expr.right)
						try {
							let opType = additionCompatibility(leftType, rightType, expr.operator.type)
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
			case "VariableExpr": {
				let varType = nameExists(expr.name.lexeme)
				if (varType) {
					expr.valueType = varType.valueType
					return varType.valueType
				}
				throw new ParseError(expr.name, `Variable '${expr.name.lexeme}' does not exist.`)
			}
			case "AssignExpr": {
				let varType = nameExists(expr.name.lexeme)
				let assignType = typeCheckExpr(expr.value)
				if (varType) {
					if (assignType.kind !== varType.valueType.kind) {
						throw new ParseError(expr.name, `Cannot assign ${assignType.kind} to ${varType.valueType.kind}`)
					}
				}
				break
			}
			case "GroupingExpr": break
			case "UnaryExpr": break
			case "CallExpr": {
				/*for (let arg of expr.argumnets) {
					typeCheckExpr(arg)
				}
				if (expr.valueType) {
					return expr.valueType
				}
				else {
					throw new ParseError(expr.paren, "ValueType not assigned in typechecker.(CallExpr)")
				}*/
				break
			}
			case "StmtExpr": {
				if (expr.stmt.type === "FnStmt") {
					if (expr.valueType) return expr.valueType
					else throw new ParseError(expr.name, "ValueType not assigned in typechecker.")
				}
			}
		}
	}


	for (let stmt of stmts) {
		//console.log(stmt)
		typeCheckStmt(stmt)
	}
	return stmts

}
