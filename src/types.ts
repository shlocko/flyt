export type IntType = { kind: "int" }
export type FloatType = { kind: "float" }
export type StringType = { kind: "string" }
export type BooleanType = { kind: "bool" }
export type FunctionType = { kind: "function" }
export type NoneType = { kind: "none" }
export type UserType = { userType: true, kind: string }

export type Type =
	| IntType
	| FloatType
	| StringType
	| BooleanType
	| FunctionType
	| NoneType
	| UserType
