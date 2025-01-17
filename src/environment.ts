import { RuntimeError } from "./error"
import type { Token } from "./token"

export class Environment {
	env = new Map<string, any>()
	enclosing: Environment | undefined
	constructor(enclosing?: Environment) {
		this.enclosing = enclosing
	}

	define(name: Token, value: any) {
		this.env.set(name.lexeme, value)
	}
	get(name: Token): any {
		let value = this.env.get(name.lexeme)
		if (value === undefined && this.enclosing) {
			return this.enclosing.get(name)
		}
		return value
	}
	assign(name: Token, value: any) {
		if (this.env.has(name.lexeme)) {
			this.env.set(name.lexeme, value)
			return
		} else if (this.enclosing) {
			this.enclosing.assign(name, value)
			return
		}
		throw new RuntimeError(name, "Name '" + name.lexeme + "' does not exist. Cannot assign")
	}
	has(name: Token): boolean {
		let hasName = this.env.has(name.lexeme)
		if (!hasName && this.enclosing) {
			return this.enclosing.has(name)
		}
		return hasName
	}
}
