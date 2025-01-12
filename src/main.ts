import fs from "node:fs";
import path from "node:path";
import { scan } from "./scanner";
import { parse } from "./parser";

const runFile = (scriptName: string) => {
	const filePath = path.join(__dirname, scriptName);

	try {
		const fileContents = fs.readFileSync(filePath, 'utf8'); // Read file and store contents in a string
		console.log("Executing: " + scriptName);
		console.log(parse(scan(fileContents)))
	} catch (err) {
		console.error('An error occurred:', err.message);
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

