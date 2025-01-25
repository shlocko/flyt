import { ParseError } from "./error";
import type { Expr } from "./expression";
import type { Stmt } from "./statement";
import type { FunctionType, Type, TypeToken } from "./types";
import type { TokenType } from "./tokenType";
import { Environment } from "./environment";
import type { funct } from "./function";

export const typeCheckAST = (stmts: Stmt[]) => {

	let scopes: Map<string, Type>[] = []
	scopes.push(new Map())
	scopes[0].set("clock", {
		kind: "function",
		paramTypes: [],
		returnType: { kind: "int" }
	})
	scopes[0].set("println", {
		kind: "function",
		paramTypes: [{ kind: "none" }],
		returnType: { kind: "none" }
	})
	scopes[0].set("print", {
		kind: "function",
		paramTypes: [{ kind: "none" }],
		returnType: { kind: "none" }
	})

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
	types.set("none", { kind: "none" })

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

	const typeToString = (t: Type): string => {
		switch (t.kind) {
			case "function": {
				let str = "fn("
				for (let param of t.paramTypes) {
					str = str.concat(typeToString(param))
				}
				str = str.concat(") -> ")
				str = str.concat(typeToString(t.returnType))
				return str
			}
			case "userType": {
				return t.name
			}
			default: return t.kind
		}
	}

	const compareParams = (params1: Type[], params2: Type[]): boolean => {
		if (params1.length !== params2.length) return false
		for (let i = 0; i < params1.length; i++) {
			if (!compareTypes(params1[i], params2[i])) return false
		}
		return true
	}

	const compareTypes = (type1: Type, type2: Type): boolean => {
		switch (type1.kind) {
			case "function": {
				return type2.kind === "function" && compareParams(type1.paramTypes, type2.paramTypes) && compareTypes(type1.returnType, type2.returnType)
			}
			case "userType": {
				if (type2.kind !== "userType") return false
				return type1.name === type2.name
			}
			default: {
				return type1.kind === type2.kind
			}
		}
	}

	const parseTypeToken = (token: TypeToken): Type => {
		//console.log("token: ", token)
		let valueType: Type
		switch (token.type) {
			case "INTTYPE":
			case "FLOATTYPE":
			case "STRINGTYPE":
			case "BOOLTYPE":
			case "none":
			case "function":
				break
			default: {

				if (!types.has(token.lexeme)) {
					throw new ParseError(token, "Not a valid type.")
				}
			}
		}
		if (token.type === "function") {
			// FIX ME, cant untangle function typing from function-types in annotations
			let paramTypes: Type[] = []
			//console.log(token.params, "outside")
			for (let param of token.params) {
				//console.log(param, "params")
				let paramType = parseTypeToken(param)
				paramTypes.push(paramType)
			}
			let returnType: Type = parseTypeToken(token.return)
			valueType = {
				kind: "function",
				paramTypes,
				returnType
			} as FunctionType
		} else if (token.type === "none") {
			valueType = { kind: "none" }
		} else {
			valueType = types.get(token.lexeme)!
		}
		return valueType
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
				//console.log(stmt.typeToken, "tnohunotehu")
				if (stmt.typeToken) {
					//console.log(stmt.typeToken, "tnohunotehu")
					valueType = parseTypeToken(stmt.typeToken)
					stmt.valueType = valueType
				}
				if (stmt.initializer) {
					initializerType = typeCheckExpr(stmt.initializer)
					//console.log(initializerType)
				}
				if (initializerType && valueType && !compareTypes(valueType, initializerType)) {
					throw new ParseError(stmt.name, "Invalid assignment type to variable.")
				}
				if (!valueType && !initializerType) {
					throw new ParseError(stmt.name, "Must annotate variable type when cannot be inferred.")
				}
				if (!valueType && initializerType) {
					stmt.valueType = initializerType
				}
				//console.log(stmt.valueType)
				scopes[scopes.length - 1].set(stmt.name.lexeme, stmt.valueType!)

				//console.log(stmt.valueType, stmt.typeToken, stmt.initializer)
				//console.log(scopes)
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
				let paramTypes: Type[] = []
				let returnType: Type = { kind: "none" }
				for (let param of stmt.params) {
					//console.log(param)
					switch (param.typeToken.type) {

						case "none": throw new ParseError(param.name, "Invalid parameter type.")
						case "function": {
							/*let parsTypes: Type[] = []
							for (let parm of param.typeToken.params) {
								parsTypes.push(parseTypeToken(parm))
							}
							paramTypes.push({
								kind: "function",
								paramTypes: parsTypes,
								returnType: parseTypeToken(param.typeToken.return)
							} as FunctionType)
							*/
							break
						}
						default: {
							//console.log(param)
							if (types.has(param.typeToken.lexeme)) {
								paramTypes.push(types.get(param.typeToken.lexeme)!)
							} else {
								throw new ParseError(param.name, "Invalid parameter type.")
							}
						}
					}
				}
				if (stmt.returnTypeToken) returnType = parseTypeToken(stmt.returnTypeToken)
				scopes[scopes.length - 1].set(stmt.name.lexeme, {
					kind: "function",
					paramTypes,
					returnType
				} as FunctionType)


				/*for (let param of stmt.params) {
					if (!types.has(param.typeToken.lexeme))
						return new ParseError(param.typeToken, "Invalid type for parameter.")
					paramTypes.set(param.name.lexeme, { kind: param.typeToken.lexeme })
				}
				if (stmt.returnTypeToken && types.has(stmt.returnTypeToken.lexeme)) {
					returnType = types.get(stmt.returnTypeToken.lexeme)!
				}
				scopes[scopes.length - 1].set(stmt.name.lexeme, { kind: "function", paramTypes, returnType })
				//console.log(scopes)
				*/
				break
			}
			case "ReturnStmt": break
		}
	}

	const typeCheckExpr = (expr: Expr): Type => {
		switch (expr.type) {
			case "BinaryExpr": {
				//console.log("binary")
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
					if (!compareTypes(assignType, varType.valueType)) {
						throw new ParseError(expr.name, `Cannot assign ${typeToString(assignType)} to ${typeToString(varType.valueType)}`)
					}
				}
				break
			}
			case "GroupingExpr": break
			case "UnaryExpr": {
				if (expr.operator.type === "MINUS") {
					if (!isNumericType(typeCheckExpr(expr.right))) {
						throw new ParseError(expr.operator, "Cannot apply '-' operator to a non-number.")
					} else {
						return typeCheckExpr(expr.right)
					}
				}
				break
			}
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
				if (expr.callee.type !== "VariableExpr") {
					throw new ParseError(expr.paren, "Invalid call target.")
				}
				//console.log(nameExists(expr.callee.name.lexeme))
				if (!nameExists(expr.callee.name.lexeme)) {
					//console.log("tesn")
					throw new ParseError(expr.paren, "Invalid call target.")
				}
				let fnLoc = nameExists(expr.callee.name.lexeme)!
				let fn = scopes[fnLoc.scope].get(expr.callee.name.lexeme)!
				if (fn.kind !== "function")
					throw new ParseError(expr.paren, "Invalid call target.")
				if (expr.argumnets.length !== fn.paramTypes.length)
					throw new ParseError(expr.paren, `Incorrect number of arguments for function '${expr.callee.name.lexeme}'.`)
				for (let i = 0; i < expr.argumnets.length; i++) {
					if (fn.paramTypes[i].kind === "none") {
					} else if (!compareTypes(typeCheckExpr(expr.argumnets[i]), fn.paramTypes[i])) {
						throw new ParseError(expr.paren, "Incorrect type of argument.")
					}
				}
				expr.valueType = fn.returnType
				break
			}
			case "StmtExpr": {
				if (expr.stmt.type === "FnStmt") {
					typeCheckStmt(expr.stmt)
					expr.valueType = scopes[scopes.length - 1].get(expr.stmt.name.lexeme)
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
