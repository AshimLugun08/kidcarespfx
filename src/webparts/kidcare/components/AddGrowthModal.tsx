import * as React from "react"
import { useState } from "react";
import {
  DefaultButton,
  PrimaryButton,
} from "office-ui-fabric-react/lib/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Box, TextField } from "@mui/material";
import axios from "axios";
import { VscAdd } from "react-icons/vsc";
import { Spinner } from "office-ui-fabric-react";
// import { baseAPI } from "./EnvironmentVariables";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function AddGrowthModal(props: any) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCircumference, setHeadCircumference] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const CancelButton = () => {
    handleClose();
    props.modalClose(false);
  };

  const GetUserName = async () => {
    const response = await axios.get("/_api/web/currentuser");
    const userTitle = response.data.Email;
    return userTitle;
  };
  const handleClick = async () => {
    // Check if at least one field has a value
    if (!weight && !height && !headCircumference) {
      window.alert("Enter at least one value.");
      return;
    }

    setLoading(true);
    const loggeduser = await GetUserName();
    try {
      const imageResponse = await fetch(require("../assets/growth.png"));
      const imageBlob = await imageResponse.blob();

      // const url = `${baseAPI()}/addgrowthdetails`;

      const formData = new FormData();
      formData.append("Kid_Id", props.KidID);
      formData.append("Height", height ? height : "0");
      formData.append("Weight", weight ? weight : "0");
      formData.append(
        "Head_Circumference",
        headCircumference ? headCircumference : "0"
      );
      formData.append("Image", imageBlob, "images.png");
      formData.append("Appointment_Related", "true");
      formData.append("Appointment_Id", props.AppointmentID);
      formData.append("upload_by", loggeduser);

      // const response = await axios.post(url, formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //     accept: "text/plain",
      //   },
      // });

      // console.log("API response:", response.data);
      handleClose();
      CancelButton();
      setLoading(false);
      window.alert("Growth details added !");
    } catch (error) {
      console.error(error);
      handleClose();
      setLoading(false);

      window.alert("Error in update !");
      throw error;
    }
  };

  return (
    <div>
      {!props.modal && (
        <PrimaryButton
          onClick={handleOpen}
          style={{
            marginLeft: "10.3125em",
            marginBottom: "1em",
            backgroundColor: "#337ab7",
            border: "none",
          }}
        >
          {" "}
          <VscAdd></VscAdd> Add Growth Details
        </PrimaryButton>
      )}
      <div>
        <Modal
          open={props.modal || open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ textAlign: "center" }}
            >
              Add Growth Details
            </Typography>

            <Typography
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "20px",
              }}
            >
              <TextField
                onChange={(event) => setWeight(event.target.value)}
                id="standard-basic"
                label="Weight (Kg)"
                variant="standard"
                InputProps={{
                  sx: { fontSize: "13px" },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: "13px", // Adjust the font size for the label
                  },
                }}
              />
            </Typography>

            <Typography
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "20px",
              }}
            >
              <TextField
                onChange={(event) => setHeight(event.target.value)}
                id="standard-basic"
                label="Height (Cm)"
                variant="standard"
                InputProps={{
                  sx: { fontSize: "13px" },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: "13px", // Adjust the font size for the label
                  },
                }}
              />
            </Typography>

            <Typography
              sx={{
                display: "flex",
                flexDirection: "column",
                marginTop: "20px",
              }}
            >
              <TextField
                onChange={(event) => setHeadCircumference(event.target.value)}
                id="standard-basic"
                label="Head Circ. (Cm)"
                variant="standard"
                InputProps={{
                  sx: { fontSize: "13px" },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: "13px", // Adjust the font size for the label
                  },
                }}
              />
            </Typography>
            <Typography
              sx={{
                marginTop: "10px",
                textAlign: "right",
                justifyItems: "right",
              }}
            >
              <div
                style={{
                  marginTop: "20px",
                  marginLeft: "145px",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <div
                  style={{
                    justifyContent: "right",
                    textAlign: "right",
                    marginLeft: "-23px",
                    marginRight: "10px",
                  }}
                >
                  <DefaultButton onClick={CancelButton}>Close</DefaultButton>
                </div>
                {!loading ? (
                  <div style={{ marginRight: "10px" }}>
                    <PrimaryButton onClick={handleClick}>Save</PrimaryButton>
                  </div>
                ) : (
                  <div style={{ marginTop: "5px", marginRight: "10px" }}>
                    <Spinner ariaLive="assertive" labelPosition="right" />
                  </div>
                )}
              </div>
            </Typography>
          </Box>
        </Modal>
      </div>
    </div>
  );
}
