import { runCommand } from "@oclif/test";
import { expect } from "chai";

describe("drop", () => {
	it("runs drop cmd", async () => {
		const { stdout } = await runCommand("drop");
		expect(stdout).to.contain("hello world");
	});

	it("runs drop --name oclif", async () => {
		const { stdout } = await runCommand("drop --name oclif");
		expect(stdout).to.contain("hello oclif");
	});
});
