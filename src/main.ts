import * as vscode from 'vscode';
   
interface PackageInfo {
    projectRoot: string;
    projectName: string;
}

const getAllPrintStatements = (editor: EditorAccess): vscode.Range[] => {
    const statements = [];

    const printRegEx = /(print|debugPrint)\((.*)\);?/g;
    let match: RegExpExecArray | null;
    while ((match = printRegEx.exec(editor.getFile().getText()))) {
      let matchRange = new vscode.Range(editor.getFile().positionAt(match.index), editor.getFile().positionAt(match.index + match[0].length));
      if (!matchRange.isEmpty) {
        statements.push(matchRange);
      }
    }
    return statements;
  };

interface EditorAccess {
    getFileName(): string;
    getFile(): vscode.TextDocument;
    getLineAt(idx: number): string;
    getLineCount(): number;
    replaceLineAt(docUri: vscode.Uri, statements: vscode.Range[]): Thenable<boolean>;
}

const removePrint = async (editor: EditorAccess, packageInfo: PackageInfo, pathSep: string): Promise<number> => {
    const currentPath = editor.getFileName().replace(/(\/|\\)[^/\\]*.dart$/, '');
    const libFolder = `${packageInfo.projectRoot}${pathSep}lib`;
    if (!currentPath.startsWith(libFolder)) {
        const l1 = 'Current file is not on project root or not on lib folder? File must be on $root/lib.';
        const l2 = `Your current file path is: '${currentPath}' and the lib folder according to the pubspec.yaml file is '${libFolder}'.`;
        throw Error(`${l1}\n${l2}`);
    }

    const printStatements = getAllPrintStatements(editor);

    const statements = [];

    const printRegEx = /(print|debugPrint)\((.*)\);?/g;
    let match: RegExpExecArray | null;
    while ((match = printRegEx.exec(editor.getFile().getText()))) {
      let matchRange = new vscode.Range(editor.getFile().positionAt(match.index), editor.getFile().positionAt(match.index + match[0].length));
      if (!matchRange.isEmpty) {
        statements.push(matchRange);
      }
    }
    const lineCount = printStatements.length;
    // let count = 0;
    // for (let currentLine = 0; currentLine < lineCount; currentLine++) {
    await editor.replaceLineAt(editor.getFile().uri, printStatements);
    // count++;
    // }
    return lineCount;
};

export { PackageInfo, EditorAccess, removePrint };