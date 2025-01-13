import { LexError } from "./error"
import type { Token } from "./token"
import type { TokenType } from "./tokenType"

export const scan = (source: string): Token[] => {
	let tokens: Token[] = []
	let current = 0
	let start = 0
	let line = 1

	const keywords = new Map<string, TokenType>([
		["true", "TRUE"],
		["false", "FALSE"],
		["println", "PRINTLN"],
		["let", "LET"],
	])


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
		if (Number(char) || char === '0') {
			return true
		} else {
			return false
		}
	}

	const isAlpha = (char: string): boolean => {
		return (
			char.length === 1 && (
				(char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_'
			)
		)
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

	const scanIdent = () => {
		while (!isAtEnd() && isAlpha(peekNext())) {
			consumeChar()
		}
		return source.substring(start, current)
	}

	const isKeyword = (str: string) => {
		return keywords.has(str)
	}

	const comment = () => {
		while (!isAtEnd() && peekNext() !== '\n') {
			consumeChar()
		}
	}

	const string = () => {
		while (!isAtEnd() && peekNext() !== '"') {
			consumeChar()
		}
		let str = source.substring(start + 1, current)
		consumeChar()
		addToken("STRING", str)
	}

	while (!isAtEnd()) {
		start = current
		let char = consumeChar()
		switch (char) {
			case '\n': line++; break;
			case '(': addToken("LEFTPAREN"); break;
			case ')': addToken("RIGHTPAREN"); break;
			case '{': addToken("LEFTBRACE"); break;
			case '}': addToken("RIGHTBRACE"); break;
			case '+': addToken("PLUS"); break;
			case '-': addToken("MINUS"); break;
			case '*': addToken("STAR"); break;
			case '/': addToken("SLASH"); break;
			case ';': {
				if (peekNext() === ';') {
					comment()
				} else {
					throw new LexError("", { start: start, end: current, lineNumber: line }, "Expected ';'.")
				}
				break
			}
			case '=': {
				if (peekNext() === "=") {
					consumeChar()
					addToken("EQUALEQUAL")
				} else {
					addToken("EQUAL");
				}
				break;
			}
			case '<': {
				if (peekNext() === "=") {
					consumeChar()
					addToken("LESSEQUAL")
				} else {
					addToken("LESSTHAN")
				}
				break
			}
			case '>': {
				if (peekNext() === '=') {
					consumeChar()
					addToken("GREATEREQUAL")
				} else {
					addToken("GREATERTHAN")
				}
				break
			}
			case '"': {
				string()
				break
			}
			default: {
				if (isCharNumber(char)) {
					let num = scanNumber()
					addToken("NUMBER", num)
				} else if (isAlpha(char)) {
					let ident = scanIdent()
					if (isKeyword(ident)) {
						addToken(keywords.get(ident) as TokenType)
					} else {
						addToken("IDENTIFIER", ident)
					}
				}
			}
		}

	}

	//console.log(tokens)
	return tokens
}


