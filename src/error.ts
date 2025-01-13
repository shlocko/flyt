import type { Token } from "./token";

export class RuntimeError extends Error {
	readonly token: Token
	constructor(token: Token, message: string) {
		super(message)
		this.token = token
	}
}

export class ParseError extends Error {
	readonly token: Token
	constructor(token: Token, message: string) {
		super(message)
		this.token = token
	}
}

export class LexError extends Error {
	readonly line: string
	readonly position: { start: number, end: number, lineNumber: number }
	constructor(line: string, position: { start: number, end: number, lineNumber: number }, message: string) {
		super(message)
		this.line = line
		this.position = position
	}
}
