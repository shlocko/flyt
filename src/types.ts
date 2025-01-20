
export type IntType = { kind: "int" }
export type FloatType = { kind: "float" }
export type StringType = { kind: "string" }
export type BooleanType = { kind: "bool" }


export type Type =
	| IntType
	| FloatType
	| StringType
	| BooleanType
