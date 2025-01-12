import type { Token } from "./token"
import type { TokenType } from "./tokenType"

export const scan = (source: string): Token[] => {
	let tokens: Token[] = []
	let current = 0
	let start = 0
	let line = 1

	const addToken = (type: TokenType, literal?: string | number) => {
		tokens.push({
			type: type,
			line: line,
			literal: literal,
			lexeme: source.substring(start, current)
		} as Token)
	}

	const isAtEnd = () => {
		return current >= source.length
	}

	const consumeChar = () => {
		let char = source.charAt(current)
		current++
		return char
	}

	const isCharNumber = (char: string) => {
		if (Number(char)) {
			return true
		} else {
			return false
		}
	}

	const matchNext = (expected: string) => {
		if (source[current] == expected)
			return true
		return false
	}

	const peekNext = () => {
		return source[current]
	}

	const peekNextN = (n: number) => {
		return source[current + (n - 1)]
	}

	const scanNumber = () => {
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
			case '*': addToken("STAR"); break;
			case '/': addToken("SLASH"); break;
			case '=': addToken("EQUAL"); break;
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


