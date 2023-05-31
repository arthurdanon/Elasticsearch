const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "electron-preload.js"),
    },
  });

  // Charger l'application React
  mainWindow.loadURL("http://localhost:3000"); // Remplacez l'URL par l'URL de votre application React

  // Gérer les événements spécifiques à Electron ici
  // ...

  // ...

  // ...
}

// Gérer les événements spécifiques à Electron ici
// ...

// ...

// ...

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Gérer les événements spécifiques à Electron ici
// ...

// ...
