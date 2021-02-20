
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import * as commands from './commands.json';

export default commands.map(({ title, command, extension }) => ({ title, extension, command: () => selectParentFolderAndRun(command) }));

async function selectParentFolderAndRun(command: string) {
    const projectFolder = await selectProjectFolder();
    if (!projectFolder) {
        return;
    }
    const [parentPath, projectName] = projectFolder;
    await executeCreateCommand(parentPath, projectName, command);
}

// chokidar.watch('.', {depth: 0, ignoreInitial: true }).on('addDir', function(path) {console.log('File', path, 'has been added');});

async function selectProjectFolder(): Promise<string[] | null> {
    const value = await vscode.window.showQuickPick(["Select Project Folder", "Cancel"], {
        placeHolder: "Select Project Folder",
    });
    if (value === "Cancel") {
        return null;
    }

    const result = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
    });

    if (!result) {
        return null;
    }
    const pathToProject = result[0].path;
    const projectName = pathToProject.split("/").slice(-1)[0];
    const parentPath = pathToProject.substring(0, pathToProject.lastIndexOf('/'));

    return [parentPath, projectName];
}

async function executeCreateCommand(path: string, projectName: string, command: string) {
    const terminal = vscode.window.createTerminal({
        cwd: path
    });
    terminal.show();
    terminal.sendText(command + " " + projectName, true);
}
