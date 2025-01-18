import { Environment } from "./environment"
import { RuntimeError } from "./error";
import type { Expr } from "./expression";
import type { funct } from "./function";
import type { FnStmt, Stmt } from "./statement";
import type { Token } from "./token";

export const interpret = (stmts: Stmt[]) => {

	let globals = new Environment()
	let environment = globals

	// Clock function
	globals.define({ type: "IDENTIFIER", line: -1, lexeme: "clock", literal: "clock" }, {
		type: "function", arity: 0, call: () => {
			return (new Date().getTime())
		},
		closure: globals
	} as funct)

	// Print function
	globals.define({ type: "IDENTIFIER", line: -1, lexeme: "print", literal: "print" }, {
		type: "function", arity: 1, call: (args: any) => {
			process.stdout.write(String(args[0]))
		},
		closure: globals
	} as funct)

	// Println function
	globals.define({ type: "IDENTIFIER", line: -1, lexeme: "println", literal: "println" }, {
		type: "function", arity: 1, call: (arg: any) => {
			console.log(arg[0])
		},
		closure: globals
	} as funct)

	const evaluate = (expr: Expr): any => {
		switch (expr.type) {
			case "LiteralExpr": return expr.value;
			case "BinaryExpr": {
				let left: number = evaluate(expr.left)
				let right: number = evaluate(expr.right)
				switch (expr.operator.type) {
					case "MINUS": return left - right
					case "SLASH": return left / right
					case "SLASHSLASH": return Math.floor(left / right)
					case "STAR": return left * right
					case "PLUS": {
						if (typeof left === "string" && typeof right === "string") {
							return left + right
						} else if (typeof left === "number" && typeof right === "number") {
							return left + right
						}
						throw new RuntimeError(expr.operator, "Can not add two values of different types.")
					}
					case "GREATERTHAN": {
						if (typeof left === "number" && typeof right === "number") {
							return left > right
						}
						throw new RuntimeError(expr.operator, "Can only compare numbers.")
					}
					case "LESSTHAN": {
						if (typeof left === "number" && typeof right === "number") {
							return left < right
						}
						throw new RuntimeError(expr.operator, "Can only compare numbers.")
					}
					case "LESSEQUAL": {
						if (typeof left === "number" && typeof right === "number") {
							return left <= right
						}
						throw new RuntimeError(expr.operator, "Can only compare numbers.")
					}
					case "GREATEREQUAL": {
						if (typeof left === "number" && typeof right === "number") {
							return left >= right
						}
						throw new RuntimeError(expr.operator, "Can only compare numbers.")
					}
					case "EQUALEQUAL": {
						if (typeof left === typeof right) {
							return left === right
						}
						throw new RuntimeError(expr.operator, "Can only compare values of the same type.")
					}
				}
				throw new RuntimeError(expr.operator, "Invalid Operator.")
			}
			case "VariableExpr": {
				if (environment.has(expr.name)) {
					return environment.get(expr.name)
				}
				throw new RuntimeError(expr.name, "Name '" + expr.name.lexeme + "' is not defined.")
			}
			case "AssignExpr": {
				if (environment.has(expr.name)) {
					environment.assign(expr.name, evaluate(expr.value))
					return environment.get(expr.name)
				}
				throw new RuntimeError(expr.name, "Name '" + expr.name.lexeme + "' does not exist.")
			}
			case "GroupingExpr": {
				return evaluate(expr.expr)
			}
			case "UnaryExpr": {
				if (expr.operator.lexeme === "-") {
					let val: any = evaluate(expr.right)
					if (typeof val === "number") {
						return -val
					} else {
						throw new RuntimeError(expr.operator, "Cannot negate non-number: '" + val + "'.")
					}
				} else if (expr.operator.lexeme === "!") {
					return !isTruthy(evaluate(expr.right))
				}
				break
			}
			case "CallExpr": {

				let callee = evaluate(expr.callee) as funct
				if (!callee.closure || !callee.call || !callee.type) throw new RuntimeError(expr.paren, "Invalid call target")
				let args = []
				for (let arg of expr.argumnets) {
					args.push(evaluate(arg))
				}
				if ((callee.type === "function" || callee.type === "method")) {
					if (args.length === callee.arity) {
						//console.log(callee.closure)
						return callee.call(args, callee.closure)
					} else {
						throw new RuntimeError(expr.paren, "Incorrect number of arguments. Expected " + callee.arity + ", got " + args.length + ".")
					}
				}
				break
			}
			case "StmtExpr": {
				if (expr.stmt.type === "FnStmt") {
					return executeFnStmt(expr.stmt)
				}
				throw new RuntimeError(expr.name, "Invalid statement expression.")
			}
		}
	}

	const execute = (stmt: Stmt): any => {
		switch (stmt.type) {
			case "ExprStmt": {
				return evaluate(stmt.expr)
			}
			case "LetStmt": {
				if (stmt.initializer || stmt.initializer == 0) {
					if (stmt.initializer.type === "FnStmt") {
						environment.define(stmt.name, executeFnStmt(stmt.initializer))
					} else {
						environment.define(stmt.name, evaluate(stmt.initializer))
					}
				} else {
					environment.define(stmt.name, undefined)
				}
				return undefined
			}
			case "BlockStmt": {
				return executeBlock(stmt.stmts, new Environment(environment))

			}
			case "IfStmt": {
				let cond = evaluate(stmt.condition)
				if (isTruthy(cond)) {
					execute(stmt.thenBlock)
				} else if (stmt.elseBlock) {
					execute(stmt.elseBlock)
				}
				return undefined
			}
			case "WhileStmt": {
				while (isTruthy(evaluate(stmt.condition))) {
					execute(stmt.doBlock)
				}
				return undefined
			}
			case "FnStmt": {
				//console.log(JSON.stringify(stmt.body.stmts))
				//console.log(environment)
				executeFnStmt(stmt as FnStmt)
				return undefined
			}
			case "ReturnStmt": {
				let value = evaluate(stmt.expr)
				throw value
			}

		}
	}

	const executeFnStmt = (stmt: FnStmt) => {
		let func = {
			type: "function",
			arity: stmt.params.length,
			call: (args: Expr[], closure: Environment) => {
				let returnValue = undefined
				let prevEnv = environment
				environment = new Environment(closure)
				for (let i = 0; i < stmt.params.length; i++) {
					environment.define(stmt.params[i], args[i])
				}
				try {
					returnValue = executeBlock(stmt.body.stmts, environment)
				} catch (returnValue) {
					environment = prevEnv
					return returnValue
				}
			},
			closure: environment
		} as funct
		environment.define(stmt.name, func)
		return func
	}

	const executeBlock = (stmts: Stmt[], env: Environment) => {
		let prevEnv = environment
		environment = env
		let returnValue = undefined
		for (let st of stmts) {
			if (st.type === "ReturnStmt") {
				returnValue = execute(st)
				break
			} else {
				execute(st)
			}
		}
		environment = prevEnv
		return returnValue
	}

	const isTruthy = (value: any) => {
		if (value === false) return false
		if (value === undefined) return false
		return true
	}

	for (let stmt of stmts) {
		execute(stmt)
	}
}
