import { peek } from "bun"
import type { Expr, VariableExpr } from "./expression"
import type { Token } from "./token"
import type { TokenType } from "./tokenType"
import { ParseError } from "./error"
import type { Stmt } from "./statement"

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
		let expr: Expr = term()
		if (matchNext("EQUAL")) {
			let value = assignment()
			return { type: "AssignExpr", name: (expr as VariableExpr).name, value: value }
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
		let expr: Expr = primary()
		while (matchNext("STAR", "SLASH")) {
			let operator = previous()
			let right = primary()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const primary = (): Expr => {
		let token = consumeNextToken()
		switch (token.type) {
			case "NUMBER": return { type: "LiteralExpr", value: token.literal }
			case "TRUE": return { type: "LiteralExpr", value: true }
			case "FALSE": return { type: "LiteralExpr", value: false }
			case "IDENTIFIER": return { type: "VariableExpr", name: previous() }
			case "STRING": return { type: "LiteralExpr", value: token.literal }
		}
		throw new ParseError(token, "Invalid token.")
	}

	const statement = (): Stmt => {
		let token = consumeNextToken()
		switch (token.type) {
			case "PRINTLN": return printStatement()
			case "LET": return letStatement()
			case "LEFTBRACE": return blockStatement()
		}
		current-- // we need the previously consumed token for the expression statement, so we will step back, hope this doesn't bite me later
		return { type: "ExprStmt", expr: expression() }
		throw new ParseError(token, "Expected statement.")
	}

	const printStatement = (): Stmt => {
		consumeCheck("LEFTPAREN", "Expected '(' after 'print'.")
		let expr = expression()
		consumeCheck("RIGHTPAREN", "Expected ')' after expression.")
		return { type: "PrintStmt", expr: expr }

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
