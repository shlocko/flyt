import { peek } from "bun"
import type { Expr } from "./expression"
import type { Token } from "./token"
import type { TokenType } from "./tokenType"

export const parse = (source: Token[]) => {
	let current = 0

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
		if (matchNext("PLUS", "MINUS")) {
			let operator = previous()
			let right = expression()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const factor = (): Expr => {
		let expr: Expr = primary()
		if (matchNext("STAR", "SLASH")) {
			let operator = previous()
			let right = expression()
			expr = { type: "BinaryExpr", left: expr, right: right, operator: operator }
		}
		return expr
	}

	const primary = (): Expr => {
		let token = consumeNextToken()
		if (token.type == "NUMBER") {
			return { type: "LiteralExpr", value: token.literal }
		}

		throw Error
	}

	return expression()
}
