import type { Expr } from "./expression";
import type { Token } from "./token";
import type { Type } from "./types";

export type ExprStmt = { type: "ExprStmt", expr: Expr }
export type LetStmt = { type: "LetStmt", name: Token, typeToken?: Token, initializer?: Expr, valueType: Type | undefined }
export type BlockStmt = { type: "BlockStmt", stmts: Stmt[] }
export type IfStmt = { type: "IfStmt", condition: Expr, thenBlock: Stmt, elseBlock: Stmt | undefined }
export type WhileStmt = { type: "WhileStmt", condition: Expr, doBlock: Stmt }
export type FnStmt = { type: "FnStmt", name: Token, params: Token[], body: BlockStmt }
export type ReturnStmt = { type: "ReturnStmt", expr: Expr }


export type Stmt =
	| ExprStmt
	| LetStmt
	| BlockStmt
	| IfStmt
	| WhileStmt
	| FnStmt
	| ReturnStmt
