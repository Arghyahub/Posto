import { create } from "zustand";
import { repositories } from "../../wailsjs/go/models";

// ---------- Complete directory ---------------

export type FileJoinType = {
  file_id?: number;
  name: string;
  parent_id?: any;
  collection_id: number;
  is_folder: boolean;
  files?: FileJoinType[];
};

export type CollectionNestedType = {
  collection_id: number;
  name: string;
  files?: FileJoinType[];
};

// collection_id , collection name
type CollectionMapType = Map<
  number,
  CollectionNestedType & {
    fileMap: Map<number, FileJoinType>;
  }
>;

function getCollectionInNestedForm(
  Collections: repositories.CollectionJoinFileType[],
): CollectionNestedType[] {
  const collectionMap: CollectionMapType = new Map();
  const ans: CollectionNestedType[] = [];

  for (const colOrFile of Collections) {
    if (!collectionMap.has(colOrFile.collection_id)) {
      collectionMap.set(colOrFile.collection_id, {
        collection_id: colOrFile.collection_id,
        name: colOrFile.collection_name,
        files: [],
        fileMap: new Map(),
      });
    }

    const collection = collectionMap.get(colOrFile.collection_id);
    if (collection?.files && colOrFile.file_id && colOrFile.file_name) {
      collection.fileMap.set(colOrFile.file_id, {
        file_id: colOrFile.file_id,
        name: colOrFile.file_name,
        parent_id: colOrFile.parent_id,
        collection_id: colOrFile.collection_id,
        is_folder: Boolean(colOrFile.is_folder),
        files: [],
      });
    }
  }

  for (const collection of collectionMap.values()) {
    const fileMap = collection.fileMap;

    for (const [file_id, file] of fileMap.entries()) {
      if (file.parent_id) {
        // Join to someone
        const parent = fileMap.get(file.parent_id);
        if (parent) parent.files?.push(file);
      } else {
        // Push it into collection
        collection.files?.push(file);
      }
    }

    ans.push(collection);
  }

  return ans;
}

export type HttpMethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// ---------- Individual Selection ---------------
export type CurrentDirSelectionType = {
  collection_id: number;
  collection_name: string;
  file_id?: number; // If null then collection
  file_name?: string;
  parent_id?: number; // If null then insertion into collection level
  is_folder?: boolean;
  type: "collection" | "file" | "folder";
} | null;

// ----------- File Selection --------------------
export type FileTabOpenType = {
  file_id: number;
  name: string;
  api_data?: {
    url?: string;
    method?: HttpMethodType;
    body?: Record<any, any>;
    headers?: Record<any, any>;
    response?: any;
  };
};

interface State {
  Collections: repositories.CollectionJoinFileType[];
  setCollection: (Collections: repositories.CollectionJoinFileType[]) => void;
  CollectionInNestedForm: CollectionNestedType[];
  CurrentDirSelection: CurrentDirSelectionType;
  setCurrentDirSelection: (
    CurrentDirSelection: CurrentDirSelectionType,
  ) => void;
  FileTabsOpen: FileTabOpenType[];
  OpenFileTab: (fileTab: FileTabOpenType) => void;
  CloseFileTab: (file_id: number) => void;
  setFileTabsOpen: (FileTabsOpen: FileTabOpenType[]) => void;
  FileIdsOpenHistory: number[];
}

const useQueryStore = create<State>((set, get) => ({
  Collections: [],
  setCollection: (Collections) => {
    const nestedCollection = getCollectionInNestedForm(Collections);
    set({ Collections, CollectionInNestedForm: nestedCollection });
  },
  CollectionInNestedForm: [],
  CurrentDirSelection: null,
  setCurrentDirSelection: (CurrentDirSelection) => set({ CurrentDirSelection }),
  FileTabsOpen: [],
  OpenFileTab: (fileTab) => {
    const FileTabsOpen = get().FileTabsOpen;
    const FileIdx = FileTabsOpen.findIndex(
      (tab) => tab.file_id === fileTab.file_id,
    );
    if (FileIdx == -1) {
      set({
        FileTabsOpen: [...FileTabsOpen, fileTab],
        FileIdsOpenHistory: [...get().FileIdsOpenHistory, fileTab.file_id],
      });
    } else {
      const FileIdHistory = get().FileIdsOpenHistory.filter(
        (id) => id !== fileTab.file_id,
      );
      set({ FileIdsOpenHistory: [...FileIdHistory, fileTab.file_id] });
    }
  },
  CloseFileTab: (file_id) => {
    const FileTabsOpen = get().FileTabsOpen;
    const FileIdx = FileTabsOpen.findIndex((tab) => tab.file_id === file_id);
    if (FileIdx !== -1) {
      FileTabsOpen.splice(FileIdx, 1);
      set({ FileTabsOpen: [...FileTabsOpen] });

      const FileIdHistory = get().FileIdsOpenHistory.filter(
        (id) => id !== file_id,
      );
      set({ FileIdsOpenHistory: [...FileIdHistory] });
    }
  },
  setFileTabsOpen: (FileTabsOpen) => set({ FileTabsOpen }),
  FileIdsOpenHistory: [],
}));

export default useQueryStore;
