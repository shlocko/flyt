import type { TokenType } from "./tokenType"

export type Token = {
	type: TokenType,
	line: number,
	literal: string | number | undefined,
	lexeme: string,
}
