import * as React from "react";
import {
  useModalAttributes,
  useFocusFinders,
 
} from "@fluentui/react-components";
import {
  DefaultButton,
  Dropdown,
  PrimaryButton,
  Spinner,
} from "office-ui-fabric-react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { baseAPI } from "./EnvironmentVariables";
import { Box, Modal } from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 540,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
};

const Doc_Type_Option = [
  { key: "Prescription", text: "Prescription" },
  { key: "Pathology", text: "Pathology" },
  { key: "Radiology", text: "Radiology" },
];

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const ReportUploadModal = (props: any) => {
  useModalAttributes({
    legacyTrapFocus: true,
    trapFocus: true,
  });
  const { findFirstFocusable } = useFocusFinders();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(true);
  const [selectedDocumentType, SetselectedDocumentType] = React.useState("");
  // const [selectedFile, SetselectedFile] = React.useState("");

  const [selectedFile, SetselectedFile] = React.useState<File | string | null>(
    null
  );

  const [selectedFilename, SetSelectedFileName] = React.useState("");
  const [Loader, SetLoader] = React.useState(false);
  const [userTitle, setLoggedUser] = React.useState("");

  const onClickClose = () => {
    setOpen(false);
    triggerRef.current?.focus();
    props.onCLOSE(); // Call the callback function
  };

  // const onDialogKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  //   if (e.key === "Escape") {
  //     setOpen(false);
  //     triggerRef.current?.focus();
  //   }
  // };

  React.useEffect(() => {
    GetUserName();
    if (open && dialogRef.current) {
      findFirstFocusable(dialogRef.current)?.focus();
    }
  }, [open, findFirstFocusable]);

  const DocTypeChoose = (event: any, data: any) => {
    const selectedItemValue = data.text;
    SetselectedDocumentType(selectedItemValue);
    console.log(selectedItemValue);
  };

  const sanitizeFilename = (filename: string) => {
    return filename
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^\w.-]/g, "");
  };

  const imageUpdated = (event: any) => {
    const file = event.target.files?.[0];

    if (!file) {
      window.alert("No file selected!");
      return;
    }

    const fileType = file.type;
    const fileName = sanitizeFilename(file.name);

    try {
      if (fileType.startsWith("image/")) {
        const imageUrl_ = URL.createObjectURL(file);
        SetselectedFile(imageUrl_);
        SetSelectedFileName(fileName);
        console.log("Selected image file name: " + fileName);
      } else if (fileType === "application/pdf") {
        SetselectedFile(file);
        SetSelectedFileName(fileName);
        console.log("Selected PDF file name: " + fileName);
      } else {
        console.error(
          "Unsupported file type:",
          fileType,
          "File name:",
          fileName
        );
        window.alert(
          "Invalid file type. Please upload only PDF and Image formats for medical records."
        );
        logUploadFailure(
          userTitle,
          fileName,
          fileType,
          "Unsupported file type"
        );
        SetSelectedFileName("");
        SetselectedFile(null);
        return;
      }
    } catch (error) {
      console.error("File upload failed due to a system error:", error);
      window.alert(
        "An error occurred while uploading the file. Please try again later."
      );

      // loging on failure.
      logUploadFailure(userTitle, fileName, fileType, error);
    }
  };

  const logUploadFailure = (
    userTitle: string | null,
    fileName: string,
    fileType: string,
    error?: any
  ) => {
    const userInfo = userTitle ? userTitle : "Unknown User";
    console.log(
      `Logging upload failure - User: ${userInfo}, File name: ${fileName}, File type: ${fileType}, Error:`,
      error || "N/A"
    );
  };

  // const imageUpdated = (event: any) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     const imageUrl_ = URL.createObjectURL(file);
  //     SetselectedFile(imageUrl_);
  //     SetSelectedFileName(file.name);
  //     // console.log("Selected file name: " + file.name);
  //   } else {
  //     window.alert("No Image Selected !");
  //   }
  // };

  const GetUserName = async () => {
    const response = await axios.get("/_api/web/currentuser");
    const userTitle = response.data.Email;
    setLoggedUser(userTitle);
    // console.log(userTitle);
  };

  const UploadDoc_API = async () => {
    if (selectedDocumentType !== "" && selectedFile) {
      SetLoader(true);
      try {
        const url = `${baseAPI()}/addmedicalrecords`;
        const formData = new FormData();
        formData.append("Kid_Id", props.KidID);
        formData.append("Type", selectedDocumentType);
        formData.append("Appointment_Related", "false");
        formData.append("Appointment_Id", "0");
        formData.append("upload_by", userTitle);

        if (
          typeof selectedFile === "string" &&
          (selectedFile as string).startsWith("blob:")
        ) {
          const imageBlob = await fetch(selectedFile).then((response) =>
            response.blob()
          );
          formData.append("Document", imageBlob, selectedFilename);
        } else if (selectedFile instanceof File) {
          formData.append("Document", selectedFile, selectedFilename);
        } else {
          throw new Error("Unsupported file type");
        }
        

        const response = await axios.post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "text/plain",
          },
        });

        console.log("API response:", response.data);
        window.alert(`${selectedDocumentType} report uploaded successfully!`);
        SetLoader(false);
        onClickClose();
      } catch (error) {
        SetLoader(false);
        onClickClose();
        console.error(error);
        window.alert(
          "Error in Upload: " + error.message || "Please try again later."
        );
      }
    } else {
      if (!selectedFile) {
        alert("Please choose a file to upload!");
      } else {
        alert("Please select a document type!");
      }
    }
  };

  // const UploadDoc_API = async () => {
  //   if (selectedDocumentType != "" && selectedFile != "") {
  //     SetLoader(true);
  //     try {
  //       const imageResponse = await fetch(selectedFile);
  //       const imageBlob = await imageResponse.blob();
  //       const url = `${baseAPI()}/addmedicalrecords`;
  //       const formData = new FormData();
  //       formData.append("Kid_Id", props.KidID);
  //       formData.append("Type", selectedDocumentType);
  //       formData.append("Document", imageBlob, "TestReport.png");
  //       formData.append("Appointment_Related", "false");
  //       formData.append("Appointment_Id", "0");
  //       formData.append("upload_by", userTitle);
  //       const response = await axios.post(url, formData, {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           accept: "text/plain",
  //         },
  //       });
  //       console.log("API response:", response.data);
  //       window.alert(`${selectedDocumentType} report uploaded successfully !`);
  //       SetLoader(false);
  //       onClickClose();
  //     } catch (error) {
  //       SetLoader(false);
  //       onClickClose();
  //       console.error(error);
  //       window.alert("Error in Upload !");
  //       throw error;
  //     }
  //   } else {
  //     if (selectedFile == "") {
  //       alert("Please choose a file to upload !");
  //     } else {
  //       alert("Please select `document type` !");
  //     }
  //   }
  // };

  return (
    <div>
      <Modal
        open={open}
        onClose={onClickClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <div
            style={{
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h5 style={{ color: "#03787c" }}>Upload Past Medical Documents</h5>
            <div
              style={{
                width: "390px",
                border: "1px solid black",
                borderStyle: "dashed",
                padding: "16px",
              }}
            >
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                Upload file
                <VisuallyHiddenInput onChange={imageUpdated} type="file" />
              </Button>
              <p className="text-center" style={{
                maxWidth: "100%",
                whiteSpace: "normal",
                wordWrap: "break-word",
                margin: "10px 0"
              }}>Selected File: {selectedFilename}</p>
            </div>
            <div style={{ display: "flex", margin: "10px", padding: "5px" }}>
              <div>
                <Dropdown
                  style={{ width: "200px" }} // Set the width you desire
                  placeholder="Select Document Type"
                  options={Doc_Type_Option}
                  onChange={DocTypeChoose}
                  selectedKey={selectedDocumentType}
                />
              </div>
              <div style={{ marginLeft: "15px", display: "flex" }}>
                <div>
                  <DefaultButton onClick={onClickClose}>Close</DefaultButton>
                </div>
                {!Loader ? (
                  <div style={{ marginLeft: "15px" }}>
                    <PrimaryButton onClick={UploadDoc_API}>Save</PrimaryButton>
                  </div>
                ) : (
                  <div style={{ marginTop: "5px", marginLeft: "15px" }}>
                    <Spinner
                      label="Please Wait..."
                      ariaLive="assertive"
                      labelPosition="right"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};
