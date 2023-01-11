import type { DownloadFileType } from "../back/downloadFile";
import type { BuildGraphType } from "../back/read/graph/buildGraph"; // TODO expose this in a specific file
import type { GetNodeType } from "../back/read/getNode";
import type { TextSearchType } from "../back/read/textSearch";
import type { SettingsStoreType } from "../index";
import type { SaveUpdateNodeType } from "../back/write/saveNodeInfo";
import type { SaveNodeNameType } from "../back/write/saveNodeName";

export const downloadFile = database.downloadFile as DownloadFileType; // TODO do it better maybe expose a mapType
export const buildGraph = database.buildGraph as BuildGraphType;
export const getNode = database.getNode as GetNodeType;
export const textSearch = database.textSearch as TextSearchType;
export const saveNodeInfo = database.saveNodeInfo as SaveUpdateNodeType;
export const saveNodeName = database.saveNodeName as SaveNodeNameType;

// TODO promisify
export const getSettings = settings.get as SettingsStoreType["get"];
export const setSettings = settings.set as SettingsStoreType["set"];
