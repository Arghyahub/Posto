import { create } from "zustand";
import { repositories } from "../../wailsjs/go/models";

// ---------- Complete directory ---------------

export type FileJoinType = {
  file_id?: number;
  name: string;
  parent_id?: any;
  collection_id?: number;
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

// ---------- Individual Selection ---------------
export type CurrentDirSelectionType = {
  collection_id: number;
  collection_name: string;
  file_id?: number; // If null then collection
  parent_id?: number; // If null then insertion into collection level
  is_folder?: boolean;
  type: "collection" | "file" | "folder";
} | null;

interface State {
  Collections: repositories.CollectionJoinFileType[];
  setCollection: (Collections: repositories.CollectionJoinFileType[]) => void;
  CollectionInNestedForm: CollectionNestedType[];
  CurrentDirSelection: CurrentDirSelectionType;
  setCurrentDirSelection: (
    CurrentDirSelection: CurrentDirSelectionType,
  ) => void;
  //   count: number;
  //   increment: () => void;
  //   decrement: () => void;
  //   reset: () => void;
}

const useQueryStore = create<State>((set) => ({
  Collections: [],
  setCollection: (Collections) => {
    const nestedCollection = getCollectionInNestedForm(Collections);
    set({ Collections, CollectionInNestedForm: nestedCollection });
  },
  CollectionInNestedForm: [],
  CurrentDirSelection: null,
  setCurrentDirSelection: (CurrentDirSelection) => set({ CurrentDirSelection }),
}));

export default useQueryStore;
