import { RuntimeError } from "./error"
import type { Token } from "./token"

export class Environment {
	env = new Map<string, any>()

	define(name: Token, value: any) {
		this.env.set(name.lexeme, value)
	}
	get(name: Token) {
		return this.env.get(name.lexeme)
	}
	assign(name: Token, value: any) {
		if (this.env.has(name.lexeme)) {
			this.env.set(name.lexeme, value)
			return
		}
		throw new RuntimeError(name, "Name '" + name.lexeme + "' does not exist. Cannot assign")
	}
	has(name: Token) {
		return this.env.has(name.lexeme)
	}
}
