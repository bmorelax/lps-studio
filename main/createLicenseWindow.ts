import { app, Menu, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import buildAboutMenu from './buildAboutMenu';

const args = process.argv.slice(1);
const serve = args.some(val => val === '--serve');

const urlPath = '/license';

const licenseDialogSize = [600, 600];

let licenseWindowMenu = null;

let licenseWindowSingleton: BrowserWindow = null;

let forceCloseWindow: boolean = false;

export function setForceCloseWindow() {
  forceCloseWindow = true;
}

export default function createLicenseWindow() {
  if (licenseWindowSingleton !== null) {
    licenseWindowSingleton.show();
    licenseWindowSingleton.focus();
    return;
  }
  if (licenseWindowMenu === null) {
    licenseWindowMenu = buildAboutMenu();
  }
  const screenSize = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  licenseWindowSingleton = new BrowserWindow({
    x: screenSize.width / 2 - licenseDialogSize[0] / 2,
    y: screenSize.height / 2 - licenseDialogSize[1] / 2,
    title: 'About LPS Studio',
    width: licenseDialogSize[0],
    height: licenseDialogSize[1],
    minimizable: false,
    resizable: false,
    maximizable: false,
    show: false
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/../node_modules/electron`)
    });
    licenseWindowSingleton.loadURL('http://localhost:4200/#' + urlPath);
  } else {
    licenseWindowSingleton.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      hash: urlPath,
      slashes: true
    }));
  }

  licenseWindowSingleton.on('focus', () => {
    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(licenseWindowMenu);
    }
  });
  licenseWindowSingleton.setMenu(null);

  licenseWindowSingleton.once('ready-to-show', () => {
    licenseWindowSingleton.show();
  });

  // Emitted when the window is closed.
  licenseWindowSingleton.once('close', (event) => {
    if (forceCloseWindow) {
      return;
    }
    // hide window for reuse
    event.preventDefault();
    licenseWindowSingleton.hide();
  });
}
