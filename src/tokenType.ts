
export type TokenType = // Single Character tokens
	| "EQUAL"
	| "PLUS"
	| "MINUS"
	| "SLASH"
	| "STAR"
	| "LEFTPAREN"
	| "RIGHTPAREN"
	| "LEFTBRACE"
	| "RIGHTBRACE"
	| "LESSTHAN"
	| "GREATERTHAN"
	// Two Character Tokens
	| "EQUALEQUAL"
	| "SEMISEMI"
	| "LESSEQUAL"
	| "GREATEREQUAL"
	// LITERALS
	| "NUMBER"
	| "IDENTIFIER"
	| "STRING"
	// KEYWORDS
	| "TRUE"
	| "FALSE"
	| "PRINTLN"
	| "LET"
