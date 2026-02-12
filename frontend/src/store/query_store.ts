import { create } from "zustand";

// ---------- Complete directory ---------------
type FolderOrFileType =
  | { is_folder: 1; files?: FileJoinType[] }
  | { is_folder: 0 };

export type CollectionJoinType = {
  collection_id?: number;
  name: string;
  files?: FileJoinType[];
};

export type FileJoinType = FolderOrFileType & {
  file_id?: number;
  name: string;
  parent_id?: any;
  collection_id?: number;
  // files?: FileJoinType[];
};

// ---------- Individual Selection ---------------
export type CurrentDirSelectionType = {
  collection_id: number;
  file_id?: number; // If null then collection
  parent_id?: number; // If null then insertion into collection level
  is_folder?: number;
  type: "collection" | "file" | "folder";
} | null;

interface State {
  Collections: CollectionJoinType[];
  setCollection: (Collections: CollectionJoinType[]) => void;
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
  setCollection: (Collections: CollectionJoinType[]) => set({ Collections }),
  CurrentDirSelection: null,
  setCurrentDirSelection: (CurrentDirSelection: CurrentDirSelectionType) =>
    set({ CurrentDirSelection }),
}));

export default useQueryStore;
