// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const mic = require("mic");
const path = require("path");
const fs = require("fs");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

async function recordAudio(filename) {
 return new Promise((resolve, reject) => {
  const micInstance = mic({
   rate: "16000",
   channels: "1",
   fileType: "wav",
   //  soxPath: "/opt/homebrew/bin/sox",
   //  exitOnSilence: 2,
   debug: false,
  });

  const micInputStream = micInstance.getAudioStream();
  const outputFileStream = fs.WriteStream(filename);

  micInputStream.pipe(outputFileStream);

  micInstance.start();
  setTimeout(() => {
   micInstance.stop();
  }, 5000);

  micInputStream.on("startComplete", () => {
   console.log("Recording...");
  });

  micInputStream.on("stopComplete", () => {
   console.log("Finished recording");
   resolve();
  });

  micInputStream.on("data", (data) => {
   console.log("Received data chunk:", data.length);
  });

  micInputStream.on("error", (err) => {
   console.log("Error in Input Stream: " + err);
   reject(err);
  });

  outputFileStream.on("error", (err) => {
   console.log("Error in Output Stream: " + err);
   reject(err);
  });
 });
}

async function getFilename() {
 // Get the path of the currently open folder in the workspace
 const workspaceFolders = vscode.workspace.workspaceFolders;
 if (!workspaceFolders) {
  vscode.window.showErrorMessage("No workspace is currently open.");
  return;
 }

 const workspacePath = workspaceFolders[0].uri.fsPath;
 const recordingsFolder = "recordings"; // You can also prompt the user for a name
 const newFolderPath = path.join(workspacePath, recordingsFolder);

 try {
  // Create the folder
  await vscode.workspace.fs.createDirectory(vscode.Uri.file(newFolderPath));
 } catch (error) {
  vscode.window.showErrorMessage(`Error creating folder: ${error}`);
 }

 // Create file path with random name.
 const fileName = path.join(newFolderPath, "last-command.wav");
 console.log("Writing new recording file at:", fileName);

 return fileName;
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
 // The command has been defined in the package.json file
 // Now provide the implementation of the command with  registerCommand
 // The commandId parameter must match the command field in package.json
 let disposable = vscode.commands.registerCommand(
  "helloworld.helloWorld",
  async function () {
   // The code you place here will be executed every time your command is executed

   vscode.window.showInformationMessage("I am listening...");

   const fileName = await getFilename();
   const record = await recordAudio(fileName);

   vscode.window.showInformationMessage("Ok, one second...");

   // Display a message box to the user
  }
 );

 context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
 activate,
 deactivate,
};
