import { expect, test } from "bun:test"
import { run } from "../src/main"

test("1+1", () => {
	expect(run("1+1")).toBe(2)
})

test("3*4", () => {
	expect(run("3*4")).toBe(12)
})

test("1+2*8", () => {
	expect(run("1+2*8")).toBe(17)
})
