import type { Expr } from "./expression";
import type { Stmt } from "./statement";

export const typeCheckAST = (stmts: Stmt[]) => {

	let scopes = []

	const typeAssignStmt = (stmt: Stmt) => {

	}

	const typeAssignExpr = (expr: Expr) => {

	}

	const typeCheckStmt = (stmt: Stmt) => {
		switch (stmt.type) {
			case "IfStmt": {

			}
		}
	}

	const typeCheckExpr = (expr: Expr) => {
		switch (expr.type) {
			case "BinaryExpr": {
				switch (expr.operator.type) {
					case "EQUALEQUAL":
					case "BANGEQUAL":
					case "LESSTHAN":
					case "LESSEQUAL":
					case "GREATERTHAN":
					case "GREATEREQUAL": {

					}
				}
			}
		}
	}

	for (let stmt of stmts) {
		typeAssignStmt(stmt)
	}

	for (let stmt of stmts) {
		typeCheckStmt(stmt)
	}


}
