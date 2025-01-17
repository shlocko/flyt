import type { Expr, VariableExpr } from "./expression"
import type { Token } from "./token"
import type { TokenType } from "./tokenType"
import { ParseError } from "./error"
import type { BlockStmt, Stmt } from "./statement"
import { Environment } from "./environment"

export const parse = (source: Token[]) => {
	let current = 0
	let statements: Stmt[] = []

	const isAtEnd = () => {
		return current >= source.length
	}

	const peekNext = () => {
		return source[current]
	}

	const previous = () => {
		return source[current - 1]
	}

	const consumeNextToken = () => {
		let token = source[current]
		current++
		return token
	}

	const consumeCheck = (token: TokenType, message: string) => {
		let consumedToken = consumeNextToken()
		//console.log(consumedToken)
		if (consumedToken && consumedToken.type === token) return consumedToken
		throw new ParseError(consumedToken, message)
	}

	const matchNext = (...types: TokenType[]): boolean => {
		for (let type of types) {
			if (!isAtEnd() && peekNext().type == type) {
				consumeNextToken()
				return true
			}
		}
		return false
	}

	const checkNext = (type: TokenType) => {
		return type == peekNext().type
	}

	const expression = (): Expr => {
		return assignment()
	}

	const assignment = (): Expr => {
		let expr: Expr = equality()
		if (matchNext("EQUAL")) {
			let value = assignment()
			return { type: "AssignExpr", name: (expr as VariableExpr).name, value: value }
		}
		return expr
	}

	const equality = (): Expr => {
		let expr: Expr = comparison()
		while (matchNext("EQUALEQUAL")) {
			let operator = previous()
			let right = equality()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const comparison = (): Expr => {
		let expr: Expr = term()
		while (matchNext("LESSTHAN", "GREATERTHAN", "LESSEQUAL", "GREATEREQUAL")) {
			let operator = previous()
			let right = equality()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const term = (): Expr => {
		let expr: Expr = factor()
		while (matchNext("PLUS", "MINUS")) {
			let operator = previous()
			let right = factor()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const factor = (): Expr => {
		let expr: Expr = unary()
		while (matchNext("STAR", "SLASH", "SLASHSLASH")) {
			let operator = previous()
			let right = unary()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const unary = (): Expr => {
		if (matchNext("BANG", "MINUS")) {
			let operator = previous()
			let expr: Expr = unary()
			return { type: "UnaryExpr", operator: operator, right: expr }
		} else {
			return call()
		}
	}

	const call = (): Expr => {
		let expr = primary()
		while (true) {
			if (matchNext("LEFTPAREN")) {
				expr = finishCall(expr)
			} else {
				break
			}
		}
		return expr
	}

	const finishCall = (callee: Expr): Expr => {
		let args: Expr[] = []
		if (peekNext().type !== "RIGHTPAREN") {
			do {
				args.push(expression())
			} while (matchNext("COMMA"))
		}
		let paren = consumeCheck("RIGHTPAREN", "Expected ')' after arguments.")
		return { type: "CallExpr", callee: callee, paren: paren, argumnets: args }

	}

	const primary = (): Expr => {
		let token = consumeNextToken()
		switch (token.type) {
			case "NUMBER": return { type: "LiteralExpr", value: token.literal }
			case "TRUE": return { type: "LiteralExpr", value: true }
			case "FALSE": return { type: "LiteralExpr", value: false }
			case "IDENTIFIER": {
				return { type: "VariableExpr", name: previous() }
			}
			case "STRING": return { type: "LiteralExpr", value: token.literal }
			case "LEFTPAREN": {
				let expr: Expr = expression()
				consumeCheck("RIGHTPAREN", "Expected ')' after grouping expression")
				return { type: "GroupingExpr", expr: expr }
			}
		}
		throw new ParseError(token, "Invalid token.")
	}

	const statement = (): Stmt => {
		let token = consumeNextToken()
		switch (token.type) {
			case "LET": return letStatement()
			case "LEFTBRACE": return blockStatement()
			case "IF": return ifStatement()
			case "WHILE": return whileStatement()
			case "FN": return functionStatement("function")
		}
		current-- // we need the previously consumed token for the expression statement, so we will step back, hope this doesn't bite me later
		return { type: "ExprStmt", expr: expression() }
		throw new ParseError(token, "Expected statement.")
	}

	const functionStatement = (fnType: string): Stmt => {
		let name = consumeCheck("IDENTIFIER", "Expected " + fnType + " name.")
		consumeCheck("LEFTPAREN", "Expected '(' after " + fnType + " name.")
		let params: Token[] = []
		if (!(peekNext().type === "RIGHTPAREN")) {
			do {
				params.push(consumeCheck("IDENTIFIER", "Expected identifier as " + fnType + " parameter."))
			} while (matchNext("COMMA"))
		}
		consumeCheck("RIGHTPAREN", "Expected ')' after parameters.")
		consumeCheck("LEFTBRACE", "Expected '{' before body")
		let body = blockStatement()
		return { type: "FnStmt", name: name, params: params, body: body as BlockStmt }
	}

	const whileStatement = (): Stmt => {
		let condition = expression()
		let doBlock: Stmt
		if (consumeCheck("LEFTBRACE", "Expected a block.")) {
			doBlock = blockStatement()
		}
		return { type: "WhileStmt", condition: condition, doBlock: doBlock! }
	}

	const ifStatement = (): Stmt => {
		let condition = expression()
		let ifSt: Stmt
		let elseStmt = undefined
		if (consumeCheck("LEFTBRACE", "Expected a block.")) {
			ifSt = blockStatement()
			if (matchNext("ELSE")) {
				if (matchNext("LEFTBRACE", "IF")) {
					let prev = previous()
					if (prev.type === "LEFTBRACE") {
						elseStmt = blockStatement()
					} else if (prev.type === "IF") {
						elseStmt = ifStatement()
					} else {
						throw new ParseError(prev, "Expected 'if' or block.")
					}
				}
			}
		}
		return { type: "IfStmt", condition: condition, thenBlock: ifSt!, elseBlock: elseStmt }
	}


	const letStatement = (): Stmt => {
		let name = consumeCheck("IDENTIFIER", "Expected indentifier after 'let'.");
		let initializer = null
		if (matchNext("EQUAL")) {
			initializer = expression()
			return { type: "LetStmt", name: name, initializer: initializer }
		}
		return { type: "LetStmt", name: name }

	}

	const blockStatement = (): Stmt => {
		let stmts: Stmt[] = []
		while (!isAtEnd() && !matchNext("RIGHTBRACE")) {
			stmts.push(statement())
		}
		return { type: "BlockStmt", stmts: stmts }
	}

	while (!isAtEnd()) {
		statements.push(statement())
	}

	return statements
}
