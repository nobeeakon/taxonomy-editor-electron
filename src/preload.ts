// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron";
import type { TextSearchArgs } from "./back/read/textSearch";
import type { DownloadFileArgs } from "./back/downloadFile";
import type { BuildGraphArgs } from "./back/read/graph/buildGraph";
import type { SaveNodeInfoArgs } from "./back/write/saveNodeInfo";
import type { SaveNodeNameArgs } from "./back/write/saveNodeName";
import type { GetNodeArgs } from "./back/read/getNode";
import type { SettingsStoreType } from "./index";

contextBridge.exposeInMainWorld("database", {
  downloadFile: (args: DownloadFileArgs) =>
    ipcRenderer.invoke("downloadFile", args),
  textSearch: (args: TextSearchArgs) => ipcRenderer.invoke("textSearch", args),
  getNode: (args: GetNodeArgs) => ipcRenderer.invoke("getNode", args),
  buildGraph: (args: BuildGraphArgs) => ipcRenderer.invoke("buildGraph", args),
  saveNodeInfo: (args: SaveNodeInfoArgs) =>
    ipcRenderer.invoke("saveNodeInfo", args),
  saveNodeName: (args: SaveNodeNameArgs) =>
    ipcRenderer.invoke("saveNodeName", args),
});

contextBridge.exposeInMainWorld("settings", {
  get: async (...args: Parameters<SettingsStoreType["get"]>) => {
    const result = await ipcRenderer.invoke("getSettingsValue", args);
    return result;
  },
  set: async (...args: Parameters<SettingsStoreType["set"]>) => {
    await ipcRenderer.invoke("setSettingsValue", args);
  },
});
