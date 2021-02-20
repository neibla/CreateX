import * as vscode from 'vscode';
import commands from './create-commands';

interface Command {
	title: string;
	command: () => Promise<void>;
	extension: string;
}

export function activate(context: vscode.ExtensionContext) {
	commands.forEach((command) => {
		const disposable = register(command);
		context.subscriptions.push(disposable);
	});
}

const resolveExtension = (extension: string) => `extension.createx.${extension}`;

const register = (command: Command) => {
	const disposable = vscode.commands.registerCommand(resolveExtension(command.extension), async () => {
		command.command();
	});
	return disposable;
};


export function deactivate() { }

