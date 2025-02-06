import * as React from "react";
import { DataGrid, GridLocaleText, GridToolbar } from "@mui/x-data-grid";
import "@fontsource/roboto/500.css";
import axios from "axios";
import NewRegistrationForm from "./NewRegistration";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import { ReportUploadModal } from "./ReportUploadModal";
import { PrimaryButton } from "office-ui-fabric-react";
import { VscAdd } from "react-icons/vsc";
import { styled } from "@mui/system";
import { gridClasses } from "@mui/x-data-grid";
import { GridColDef, GridValueGetter } from "@mui/x-data-grid";
import { DefaultButton } from "@fluentui/react/lib/Button";
import { baseAPI, baseURL } from "./EnvironmentVariables";
import ReplyFlipModal from "./replyFlipModal";
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIphoneSharp from "@mui/icons-material/PhoneIphoneSharp";
import LanguageIcon from "@mui/icons-material/Language";
import { Web as Web1 } from "@pnp/sp/webs";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
// import { useKidContext } from "./context/kidcontext";
// import { sp } from "@pnp/sp";
import "@pnp/sp/site-users";
import "@pnp/sp/attachments";
// import pnp, {
//   Item,
//   ItemAddResult,
//   ItemUpdateResult,
//   Web,
//   Items,
// } from "sp-pnp-js";

const baseUrl =
  "https://healthpointsolutions.sharepoint.com/sites/KidCare_Staging";
// "https://healthpointsolutions.sharepoint.com/sites/KidsCare";

const StripedDataGrid = styled(DataGrid)(({ }) => ({
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: "#d9d9d9c2",
  },
  // Add styles for the search bar here
  "& .MuiDataGrid-toolbarContainer": {
    border: "1px solid #ccc", // Add border
    borderRadius: "4px", // Optional: Add border-radius for a rounded appearance
    padding: "8px", // Optional: Adjust padding for size
  },
}));

require("./mycss.css");




let KidPageUrl = `${baseURL()}/KidProfile.aspx`;
let ParentPAgeUrl = `${baseURL()}/ParentProfile.aspx`;
// let BookMeetingUrl = `${baseURL()}/BookAppointment.aspx`;
// let Pediatricsurl = `${baseURL()}/Pediatrics-History-Form.aspx`;

export default function QuickFilteringGrid() {
  const [isRegistrationFormOpen, setRegistrationFormOpen] =
    React.useState(false);
  const [selectedKidId, setSelectedKidId] = React.useState("");
  const [RadioUIStatus, Setradiotoggle] = React.useState(false);
  const [Clicked, setClicked] = React.useState(false);
  const [allData, setAllData] = React.useState<any[]>([]);
  const [isNewDataFetched, setIsNewDataFetched] = React.useState(false);
  const [UploadModal, SetUploadModal] = React.useState(false);
  const [ActionSelectedKidId, SetActionSelectedKidId] = React.useState(false);
  const [ModalOpen, SetModalOpen] = React.useState(false);
  const [KidDetailData, SetKidDetailData] = React.useState([]);
  const [UnreadFlips, setUnreadFlips] = React.useState(0);

  const UploadModalClose = () => {
    SetUploadModal(false);
  };
  const UploadModalOpen = (kidid___: any) => {
    SetUploadModal(true);
    SetActionSelectedKidId(kidid___);
  };

  const openKidProfile = (kidId: any) => {
    window.location.href = `${KidPageUrl}?kid_Id=${kidId}`;
  };

  const openPArentProfile = (P_Id: any) => {
    window.location.href = `${ParentPAgeUrl}?parent_Id=${P_Id}`;
  };

  const handleRadioClick = (
    kidId: any,
    selectedkidName: any,
    kidPhoto: any,
    ParentName: any
  ) => {
    if (!Clicked) {
      setSelectedKidId(kidId);
      const event = new CustomEvent("sharedMessageSet", {
        detail: [kidId, selectedkidName, kidPhoto, ParentName],
      });
      document.dispatchEvent(event);
      console.log("selected = " + kidId);
      setClicked(true);
      Setradiotoggle(true);
    } else {
      setSelectedKidId("");
      console.log("Not selected");
      const event = new CustomEvent("sharedMessageSet", {
        detail: null,
      });
      document.dispatchEvent(event);
      setClicked(false);
      Setradiotoggle(false);
    }
  };


  const openRegistrationForm = () => {
    setRegistrationFormOpen(true);
  };

  const closeRegistrationForm = () => {
    setRegistrationFormOpen(false);
    fetchData();
  };

  const fetchData = async () => {
    const apiBaseUrl = baseAPI();

    // console.log(apiBaseUrl);
    try {
      setIsNewDataFetched(true);

      const response = await axios.get(apiBaseUrl + "/getallkids");
      console.log(response);
      const data = await Promise.all(
        response.data.data.map(async (item: any, index: number) => {
          try {
            const loginStatusResponse = await axios.get(
              `${baseAPI()}/MobileAppLoginStatus?ParentProfileId=${
                item.parent_Id
              }`
            );

            return {
              ...item,
              LoginStatus: loginStatusResponse.data.login,
              id: index + 1,
            };
          } catch (loginError) {
            console.error("Error fetching login status: ", loginError);
            return {
              ...item,
              LoginStatus: null,
              id: index + 1,
            };
          }
        })
      );

      setAllData(data);
      console.log(JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching data: ", error);
      alert("Network Error !");
    }
  };

  //##################################################################

  React.useEffect(() => {
    fetchData();
    FetchAllFlip();
  }, []);

  const GetUserName = async () => {
    const response = await axios.get("/_api/web/currentuser");
    const userTitle = response.data.Email;
    return userTitle;
  };

  const checkIfCurrentUserDoctor = (email: string) => {
    return new Promise((resolve, reject) => {
      try {
        let web = Web1(baseUrl);
        web.lists
          .getByTitle("MD_Flip_Emails")
          .items.select("Title", "Email")()
          .then((result: any[] | null | undefined) => {
            if (result != null || result != undefined) {
              let arr = result.filter((it: { Email: string; }) => it.Email === email);
              if (arr.length === 0) {
                resolve(false);
              } else {
                resolve(true);
              }
            }
          });
      } catch (ex) {}
    });
  };

  async function FetchAllFlip() {
    let userName = await GetUserName();
    // userName = "Ila.Binaykia@healthpointranchi.com"
    let isDoctor = await checkIfCurrentUserDoctor(userName);

    let apiUrlDoctor = `${baseAPI()}/getfliplistforcareteam?id=${userName}`;
    let apiUrlCarePartner = `${baseAPI()}/getfliplistforcareteam?id=${"Care_Partner"}`;

    try {
      let allFlipData: any[] = [];

      if (isDoctor) {
        const response = await axios.get(apiUrlDoctor);
        allFlipData = [...response.data.data];
      } else {
        userName = "Ila.Binaykia@healthpointranchi.com";
        apiUrlDoctor = `${baseAPI()}/getfliplistforcareteam?id=${userName}`;

        const response = await axios.get(apiUrlDoctor);
        const response2 = await axios.get(apiUrlCarePartner);
        allFlipData = [...response.data.data, ...response2.data.data];
      }

      // Filter the array based on "read_flag" being "false"
      const unreadFlips = allFlipData.filter(
        (flip: { read_flag: string }) =>
          flip.read_flag.toLowerCase() === "false"
      );

      // Log the number of unread flips
      console.log(
        "Number of flips with read_flag set to false:",
        unreadFlips.length
      );
      setUnreadFlips(unreadFlips.length ? unreadFlips.length : 0);
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  //##################################################################

  React.useEffect(() => {
    if (isNewDataFetched) {
      const resetTimeout = setTimeout(() => {
        setIsNewDataFetched(false);
      }, 30000);

      return () => {
        clearTimeout(resetTimeout);
      };
    }
  }, [isNewDataFetched]);

  const columns: (
    | GridColDef
    | {
        field: string;
        headerName: string;
        width: number;
        valueGetter: (params: GridValueGetter) => string;
      }
  )[] = [
    {
      field: "select",
      headerName: "",
      width: 3,
      renderCell: (params: any) => (
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div
            onClick={() =>
              handleRadioClick(
                params.row.kid_Id,
                params.row.name,
                params.row.photo,
                params.row.parent_Name
              )
            }
            style={{
              cursor: "pointer",
              border: "1px solid #ccc",
              padding: "5px",
              background:
                params.row.kid_Id === selectedKidId && RadioUIStatus
                  ? "lightblue"
                  : "white",
            }}
          ></div>
        </div>
      ),
    },
    { field: "id", headerName: "Sl. No.", width: 60 },
    { field: "uhid", headerName: "UHID", width: 110 },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      renderCell: (params: any) => (
        <div
          onClick={() => openKidProfile(params.row.kid_Id)}
          style={{
            display: "flex",
            alignItems: "center", // Vertically center the content
            width: "100%",
            height: "100%",
            color: "#056DB5",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: "gender", headerName: "Gender", width: 70 },

    {
      field: "dob",
      headerName: "Date Of Birth",
      width: 100,
      valueGetter: (params: any) => {
        if (!params?.row) return "";
        return formatDateOfBirth(params.row.dob);
      }
    },
    {
      field: "parent_Name",
      headerName: `Parent's Name`,
      width: 140,
      renderCell: (params: any) => (
        <div
          onClick={() => openPArentProfile(params.row.parent_Id)}
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            height: "100%",
            textDecoration: "none",
            color: "#056DB5",
            cursor: "pointer",
          }}
        >
          {params.value}
        </div>
      ),
    },
    { field: "phone", headerName: "Contact", width: 110 },
    {
      field: "app_Login_Code",
      headerName: "App Login Code",
      width: 100,
      renderCell: (params: any) => {
        const [showCode, setShowCode] = React.useState(false);

        return (
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center", // Vertically center the content
            }}
          >
            <div
              onClick={() => setShowCode(!showCode)}
              style={{ cursor: "pointer" }}
            >
              {showCode ? (
                <span>{params.row.app_Login_Code}</span>
              ) : (
                <span>********</span>
              )}
            </div>
            <span style={{ marginLeft: "8px" }}>
              <PhoneIphoneSharp
                titleAccess={
                  params.row.LoginStatus == "true"
                    ? "App login detected"
                    : "No App login detected"
                }
                style={{
                  color:
                    params.row.LoginStatus == "true" ? "#53bf9d" : "#f94c66",
                }}
              />
            </span>
          </div>
        );
      },
    },
    {
      field: "dietPlan_Status",
      headerName: "",
      width: 50,
      renderCell: (params: any) => {
        return (
          <LanguageIcon
            titleAccess={
              params.row.dietPlan_Status ? "Published" : "Not Published"
            }
            style={{
              color: params.row.dietPlan_Status ? "#53bf9d" : "#f94c66",
            }}
          />
        );
      },
    },
    {
      field: "Action",
      headerName: "",
      width: 10,
      renderCell: (params: any) => (
        <div style={{ marginLeft: "-4px" }}>
          <DefaultButton
            style={{ background: "bottom", border: "none", cursor: "pointer" }}
            menuIconProps={{ iconName: "" }}
            menuProps={menuProps(params.row)}
          >
            <MoreVertIcon />
          </DefaultButton>
        </div>
      ),
    },
  ];

  const menuProps = (row: any) => ({
    shouldFocusOnMount: true,
    shouldFocusOnContainer: true,
    items: [
      {
        key: "bookappointment",
        text: "Book Appointment",
        iconProps: { iconName: "AddOnlineMeeting" },
        onClick: () => open_Booking_form(row.kid_Id),
      },
      {
        key: "pediatricform",
        text: "Pediatrics History Form",
        iconProps: { iconName: "EditNote" },
        onClick: () => open_Pediatrics_form(row.kid_Id),
      },
      {
        key: "uploadpastrecords",
        text: "Upload Past Records",
        iconProps: { iconName: "Upload" },
        onClick: () => UploadModalOpen(row.kid_Id),
      },
      {
        key: "SendFlip",
        text: "Send Flip",
        iconProps: { iconName: "ContextMenu" },
        onClick: () => FlipComponentModal(row),
      },
    ],
  });

  const FlipComponentModal = (Data: any) => {
    console.log(JSON.stringify(Data));
    SetKidDetailData(Data);
    CreateFlip();
  };

  const CreateFlip = () => {
    SetModalOpen(true);
  };

  const ModalCCloseCallback = (value: any) => {
    SetModalOpen(false);
  };

  const open_Pediatrics_form = (kid__Id: any) => {
    window.location.href = `${baseURL()}/Pediatrics-History-Form.aspx?kid_Id=${kid__Id}`;

    // const newTab = window.open(
    //   `${baseURL()}/Pediatrics-History-Form.aspx?kid_Id=${kid__Id}`,
    //   "_blank"
    // );
    // if (newTab) {
    //   newTab.focus();
    // }
  };

  const open_Booking_form = (kid__Id: any) => {
    window.location.href = `${baseURL()}/BookAppointment.aspx?kid_Id=${kid__Id}`;

    // const newTab = window.open(
    //   `${baseURL()}/BookAppointment.aspx?kid_Id=${kid__Id}`,
    //   "_blank"
    // );
    // if (newTab) {
    //   newTab.focus();
    // }
  };

  const formatDateOfBirth = (dateOfBirth: string | undefined | null) => {
    if (!dateOfBirth) return ""; // Handle null/undefined cases
    
    try {
      const parts = dateOfBirth.split(" ")[0].split("/");
      if (parts.length !== 3) return dateOfBirth; // Return original if format is unexpected
      
      const month = parts[0];
      const day = parts[1];
      const year = parts[2];
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.warn("Error formatting date:", error);
      return dateOfBirth; // Return original value if formatting fails
    }
  };
  const BatchClicked = () => {
    console.log("BatchClicked");
    window.location.href = `${baseURL()}/Flip-List.aspx`;
  };

  return (
    <div style={{ width: "100%", maxWidth: "90%", marginLeft: "auto" }}>
      <div>
        <div>
          {UploadModal && (
            <FluentProvider theme={teamsLightTheme}>
              <ReportUploadModal
                KidID={ActionSelectedKidId}
                onCLOSE={UploadModalClose}
              ></ReportUploadModal>
            </FluentProvider>
          )}
        </div>
      </div>
      <div>
        <div
          style={{
            backgroundColor: "#53bf9d",
            height: "40px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              color: "white",
              fontSize: "15px",
              fontWeight: "500",
              marginLeft: "10px",
              marginTop: "10px",
            }}
          >
            All registered patients list
          </p>
          <div
            style={{ marginRight: "20px", cursor: "pointer" }}
            onClick={BatchClicked}
          >
            <Badge badgeContent={UnreadFlips} color="primary">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                Flip
                <MailIcon
                  color="action"
                  style={{ fontSize: 30, transform: "scaleX(-1)" }}
                />
              </div>
            </Badge>
          </div>
        </div>
        <div>
          <PrimaryButton
            style={{
              backgroundColor: "#056db5",
              border: "none",
              marginBottom: "10px",
              width: "max-content",
            }}
            onClick={openRegistrationForm}
          >
            <VscAdd></VscAdd> New Registration
          </PrimaryButton>



        
<StripedDataGrid
  style={{ fontSize: "12px" }}
  rows={allData}
  columns={columns}
  disableColumnFilter
  disableColumnSelector
  disableDensitySelector
  localeText={{
    columnsPanelTextFieldLabel: "Search Column",
    columnsPanelTextFieldPlaceholder: "Enter Column Title",
    toolbarFiltersLabel: "Search Text",
  } as unknown as GridLocaleText}
  slots={{
    toolbar: GridToolbar,
  }}
  slotProps={{
    toolbar: {
      showQuickFilter: true,
    },
  }}
  initialState={{
    pagination: {
      paginationModel: { page: 0, pageSize: 10 },
    },
  }}
  getRowClassName={(params: { indexRelativeToCurrentPage: number }) =>
    params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
  }
/>



        </div>
      </div>

      {/* <div
        style={{
          color: "#f94c66",
          position: "absolute",
          marginTop: "-588px",
          marginLeft: "185px",
          rotate: "-31deg",
        }}
      >
        {isRegistrationFormOpen ? "New" : ""}
      </div> */}

      <div>
        <NewRegistrationForm
          isOpen={isRegistrationFormOpen}
          ALLdata={allData}
          onDismiss={closeRegistrationForm}
          onSaveSuccess={async () => {
            closeRegistrationForm();
            await fetchData(); // Call this function when new data is added
          }}
        />
      </div>
      <ReplyFlipModal
        ModalOpen={ModalOpen}
        KidDetail={KidDetailData}
        ModalClose={(value: any) => ModalCCloseCallback(value)}
        Reply={false}
      />
      
    </div>
  );
}
