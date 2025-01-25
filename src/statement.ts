import type { Expr } from "./expression";
import type { Token } from "./token";
import type { FunctionParameter, Type, TypeToken } from "./types";

export type ExprStmt = { type: "ExprStmt", expr: Expr }
export type LetStmt = { type: "LetStmt", name: Token, typeToken?: TypeToken, initializer?: Expr, valueType: Type | undefined }
export type BlockStmt = { type: "BlockStmt", stmts: Stmt[] }
export type IfStmt = { type: "IfStmt", condition: Expr, thenBlock: BlockStmt, elseBlock: BlockStmt | IfStmt | undefined }
export type WhileStmt = { type: "WhileStmt", condition: Expr, doBlock: BlockStmt }
export type FnStmt = { type: "FnStmt", name: Token, params: FunctionParameter[], body: BlockStmt, returnTypeToken?: TypeToken, valueType: Type | undefined }
export type ReturnStmt = { type: "ReturnStmt", expr: Expr }


export type Stmt =
	| ExprStmt
	| LetStmt
	| BlockStmt
	| IfStmt
	| WhileStmt
	| FnStmt
	| ReturnStmt
