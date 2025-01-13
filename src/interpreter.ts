import { RuntimeError } from "./error";
import type { Expr } from "./expression";
import type { Stmt } from "./statement";

export const interpret = (stmt: Stmt) => {

	const evaluate = (expr: Expr) => {
		switch (expr.type) {
			case "LiteralExpr": return expr.value;
			case "BinaryExpr": {
				let left: number = evaluate(expr.left)
				let right: number = evaluate(expr.right)
				switch (expr.operator.type) {
					case "PLUS": return left + right
					case "MINUS": return left - right
					case "SLASH": return left / right
					case "STAR": return left * right
					case "EQUAL": throw new RuntimeError(expr.operator, "Invalid operator");
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
		}
	}
	return execute(stmt)
}
