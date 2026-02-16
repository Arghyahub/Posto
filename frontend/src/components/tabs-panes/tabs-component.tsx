import { Box } from "@mui/material";
import TabSelection from "./tab-selection";
import Panes from "./panes";

type Props = {};

const TabsComponent = (props: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        minWidth: 0,
        height: "100%",
        bgcolor: "#1e1e1e",
      }}
    >
      <TabSelection />
      {/* Content Pane */}
      <Panes />
    </Box>
  );
};

export default TabsComponent;
