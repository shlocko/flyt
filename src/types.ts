import type { Token } from "./token"

export type IntType = { kind: "int" }
export type FloatType = { kind: "float" }
export type StringType = { kind: "string" }
export type BooleanType = { kind: "bool" }
export type FunctionType = { kind: "function", paramTypes: Type[], returnType: Type }
export type NoneType = { kind: "none" }
export type UserType = { kind: "userType", name: string }

export type Type =
	| IntType
	| FloatType
	| StringType
	| BooleanType
	| FunctionType
	| NoneType
	| UserType


export type FunctionParameter = { name: Token, typeToken: TypeToken }

export type TypeToken =
	| Token
	| { type: "none" }
	| {
		type: "function",
		params: TypeToken[],
		return: TypeToken
	}

