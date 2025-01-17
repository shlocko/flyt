import { Environment } from "./environment"
import { RuntimeError } from "./error";
import type { Expr } from "./expression";
import type { funct } from "./function";
import type { Stmt } from "./statement";
import type { Token } from "./token";

export const interpret = (stmts: Stmt[]) => {
	let globals = new Environment()
	let environment = globals

	// Clock function
	globals.define({ type: "IDENTIFIER", line: -1, lexeme: "clock", literal: "clock" }, {
		type: "function", arity: 0, call: () => {
			return (new Date().getTime())
		}
	} as funct)

	// Print function
	globals.define({ type: "IDENTIFIER", line: -1, lexeme: "print", literal: "print" }, {
		type: "function", arity: 1, call: (args: any) => {
			process.stdout.write(String(args[0]))
		}
	} as funct)

	// Println function
	globals.define({ type: "IDENTIFIER", line: -1, lexeme: "println", literal: "println" }, {
		type: "function", arity: 1, call: (arg: any) => {
			console.log(arg[0])
		}
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
				let args = []
				for (let arg of expr.argumnets) {
					args.push(evaluate(arg))
				}
				if ((callee.type === "function" || callee.type === "method")) {
					if (args.length === callee.arity) {
						return callee.call(args)
					} else {
						throw new RuntimeError(expr.paren, "Incorrect number of arguments. Expected " + callee.arity + ", got " + args.length + ".")
					}
				}
				// Call function, TODO
			}
		}
	}

	const execute = (stmt: Stmt) => {
		switch (stmt.type) {
			case "ExprStmt": {
				evaluate(stmt.expr)
				break;
			}
			case "LetStmt": {
				if (stmt.initializer || stmt.initializer == 0) {
					environment.define(stmt.name, evaluate(stmt.initializer))
				} else {
					environment.define(stmt.name, undefined)
				}
				break
			}
			case "BlockStmt": {
				executeBlock(stmt.stmts, new Environment(environment))
				break
			}
			case "IfStmt": {
				let cond = evaluate(stmt.condition)
				if (isTruthy(cond)) {
					execute(stmt.thenBlock)
				} else if (stmt.elseBlock) {
					execute(stmt.elseBlock)
				}
				break
			}
			case "WhileStmt": {
				while (isTruthy(evaluate(stmt.condition))) {
					execute(stmt.doBlock)
				}
				break
			}
			case "FnStmt": {
				//console.log(JSON.stringify(stmt.body.stmts))
				environment.define(stmt.name, {
					type: "function",
					arity: stmt.params.length,
					call: (args: Expr[]) => {
						let prevEnv = environment
						environment = new Environment(globals)
						for (let i = 0; i < stmt.params.length; i++) {
							environment.define(stmt.params[i], args[i])
						}
						execute(stmt.body)
						environment = prevEnv
					}
				} as funct)
				break
			}

		}
	}

	const executeBlock = (stmts: Stmt[], env: Environment) => {
		let prevEnv = environment
		environment = env
		for (let st of stmts) {
			execute(st)
		}
		environment = prevEnv
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
