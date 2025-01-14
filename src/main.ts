import fs from "node:fs";
import path from "node:path";
import { scan } from "./scanner";
import { parse } from "./parser";
import { interpret } from "./interpreter";
import { LexError, ParseError, RuntimeError } from "./error";

const runFile = (scriptName: string) => {
	const filePath = path.join(__dirname, scriptName);

	try {
		const fileContents = fs.readFileSync(filePath, 'utf8'); // Read file and store contents in a string
		console.log("Executing: " + scriptName);
		run(fileContents)
	} catch (err) {
		console.error('An error occurred:', err.message);
	}
}

export const run = (source: any) => {
	let tokens
	try {
		tokens = scan(source)
		return interpret(parse(tokens))
	} catch (err) {
		if (err instanceof LexError) {
			console.error("An error occurred at line " + err.position.lineNumber + ": " + err.message)
		} else if (err instanceof ParseError) {
			console.error("An error occurred at line " + err.token.line + ": " + err.message)
		} else if (err instanceof RuntimeError) {
			console.error("An error occurred at line " + err.token.line + ": " + err.message)
		} else {
			console.error(err)
		}


	}
}

const main = () => {
	if (Bun.argv.length > 3) {
		console.log("Usage: flyt [script]");
	} else if (Bun.argv.length == 3) {
		runFile(Bun.argv[2]);
	} else {
		//runPrompt();
	}
}


main();

