import type { Token } from "./token"
import type { TokenType } from "./tokenType"

export let scan = (source: string): Token[] => {
	let tokens: Token[] = []
	let current = 0
	let start = 0
	let line = 1

	let addToken = (type: TokenType, literal?: string | number) => {
		tokens.push({
			type: type,
			line: line,
			literal: literal,
			lexeme: source.substring(start, current)
		} as Token)
	}

	let isAtEnd = () => {
		return current >= source.length
	}

	let consumeChar = () => {
		let char = source.charAt(current)
		current++
		return char
	}

	let isCharNumber = (char: string) => {
		if (Number(char)) {
			return true
		} else {
			return false
		}
	}

	let matchNext = (expected: string) => {
		if (source[current] == expected)
			return true
		return false
	}

	let peekNext = () => {
		return source[current]
	}

	let peekNextN = (n: number) => {
		return source[current + (n - 1)]
	}

	let scanNumber = () => {
		while (!isAtEnd() && (isCharNumber(peekNext()) || peekNext() == '.')) {
			consumeChar()
		}
		return Number(source.substring(start, current))
	}

	while (!isAtEnd()) {
		start = current
		let char = consumeChar()
		switch (char) {
			case '\n': line++; break;
			case '+': addToken("PLUS"); break;
			case '-': addToken("MINUS"); break;
			default: {
				if (isCharNumber(char)) {
					let num = scanNumber()
					addToken("NUMBER", num)
				}
			}
		}

	}


	return tokens
}


