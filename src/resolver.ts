import type { Expr } from "./expression";
import type { Stmt } from "./statement";


export const resolveProgram = (stmts: Stmt[]) => {
	for (let stmt of stmts) {
		resolveStmt(stmt)
	}

}

export const resolveStmt = (stmt: Stmt) => {

}

export const resolveExpr = (expr: Expr) => {

}
