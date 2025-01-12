import type { Expr } from "./expression";

export const interpret = (expr: Expr) => {

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
					case "EQUAL": throw Error;
				}
			}
		}
	}
	return evaluate(expr)
}
