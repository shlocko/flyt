import { Environment } from "./environment";
import { RuntimeError } from "./error";
import type { Expr } from "./expression";
import type { Stmt } from "./statement";

export const interpret = (stmts: Stmt[]) => {
	let environment = new Environment()

	const evaluate = (expr: Expr) => {
		switch (expr.type) {
			case "LiteralExpr": return expr.value;
			case "BinaryExpr": {
				let left: number = evaluate(expr.left)
				let right: number = evaluate(expr.right)
				switch (expr.operator.type) {
					case "MINUS": return left - right
					case "SLASH": return left / right
					case "STAR": return left * right
					case "EQUAL": throw new RuntimeError(expr.operator, "Invalid operator");
					case "PLUS": {
						if (typeof left === "string" && typeof right === "string") {
							return left + right
						} else if (typeof left === "number" && typeof right === "number") {
							return left + right
						}
						throw new RuntimeError(expr.operator, "Can not add two values of different types.")
					}
				}
				throw new RuntimeError(expr.operator, "Invalid Operator.")
			}
			case "VariableExpr": {
				if (environment.has(expr.name)) {
					return environment.get(expr.name)
				}
				return new RuntimeError(expr.name, "Variable '" + expr.name.lexeme + "' is not defined.")
			}
			case "AssignExpr": {
				if (environment.has(expr.name)) {
					environment.assign(expr.name, evaluate(expr.value))
					return environment.get(expr.name)
				}
			}
		}
	}

	const execute = (stmt: Stmt) => {
		switch (stmt.type) {
			case "PrintStmt": {
				console.log(evaluate(stmt.expr))
				break;
			}
			case "ExprStmt": {
				evaluate(stmt.expr)
				break;
			}
			case "LetStmt": {
				environment.define(stmt.name, evaluate(stmt.initializer))
				break
			}
			case "BlockStmt": {
				let prevEnv = environment
				environment = new Environment(environment)
				for (let st of stmt.stmts) {
					execute(st)
				}
				environment = prevEnv
				break
			}
		}
	}
	for (let stmt of stmts) {
		execute(stmt)
	}
}
