
import * as vscode from 'vscode';
import * as chokidar from 'chokidar';
import * as commands from './commands.json';
import * as path from 'path';

export default commands.map(({ title, command, extension }) => ({ title, extension, command: () => selectParentFolderAndRun(command) }));

async function selectParentFolderAndRun(command: string) {
    const projectFolder = await selectProjectFolder();
    if (!projectFolder) {
        return;
    }
    const [parentPath, projectName, uri] = projectFolder;
    
    const result = await selectVSCodeWindow(uri);
    await executeCreateCommand(parentPath, projectName, uri, command);
}

async function selectVSCodeWindow(path: vscode.Uri) {
    // TODO: actually make the new window flow work!
    vscode.workspace.updateWorkspaceFolders(0, 0, {
        uri: path,
    });

    // const option = await vscode.window.showQuickPick([
    //     'Open in current workspace',
    //     'Open in new window',
    //     'Cancel'],
    // );

    // if (option === 'Open in current workspace') {
    //     vscode.workspace.updateWorkspaceFolders(0, 0, {
    //         uri: path,
    //     });
    // } else if (option === 'Open in new window') {
    //     await vscode.commands.executeCommand('vscode.openFolder', path);
    // }
}

// chokidar.watch('.', {depth: 0, ignoreInitial: true }).on('addDir', function(path) {console.log('File', path, 'has been added');});

async function selectProjectFolder(): Promise<[string, string, vscode.Uri] | null> {
    const value = await vscode.window.showQuickPick(["Select project folder", "Cancel"], {
        placeHolder: "Select project folder",
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
    const seperator = path.sep;
    const projectName = pathToProject.split(seperator).slice(-1)[0];
    const parentPath = pathToProject.substring(0, pathToProject.lastIndexOf(seperator));

    return [parentPath, projectName, result[0]];
}

async function executeCreateCommand(path: string, projectName: string, projectPath: vscode.Uri, commandTemplate: string) {
    const terminal = vscode.window.createTerminal({
        cwd: path
    });
    terminal.show();
    const projectPathString = projectPath.path;
    const command = commandTemplate
                        .replace("{name}", projectName)
                        .replace("{projectPath}", projectPathString);
    terminal.sendText(command, true);
}
