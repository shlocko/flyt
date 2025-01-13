import { peek } from "bun"
import type { Expr } from "./expression"
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
		if (consumedToken && consumedToken.type === token) return true
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
		return term()
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
		//console.log(token)
		switch (token.type) {
			case "NUMBER": return { type: "LiteralExpr", value: token.literal }
			case "TRUE": return { type: "LiteralExpr", value: true }
			case "FALSE": return { type: "LiteralExpr", value: false }
		}
		throw new ParseError(token, "Invalid token.")
	}

	const statement = (): Stmt => {
		let token = consumeNextToken()
		switch (token.type) {
			case "PRINTLN": return printStatement()
		}
		throw new ParseError(token, "Expected statement.")
	}

	const printStatement = (): Stmt => {
		consumeCheck("LEFTPAREN", "Expected '(' after 'print'.")
		let expr = expression()
		consumeCheck("RIGHTPAREN", "Expected ')' after expression.")
		return { type: "PrintStmt", expr: expr }

	}

	while (!isAtEnd()) {
		statements.push(statement())
	}

	return statements
}
