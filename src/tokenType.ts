
export type TokenType = // Single Character tokens
	| "EQUAL"
	| "PLUS"
	| "MINUS"
	| "SLASH"
	| "STAR"
	| "LEFTPAREN"
	| "RIGHTPAREN"
	// Two Character Tokens
	| "EQUALEQUAL"
	| "SEMISEMI"
	// LITERALS
	| "NUMBER"
	| "IDENTIFIER"
	// KEYWORDS
	| "TRUE"
	| "FALSE"
	| "PRINTLN"
