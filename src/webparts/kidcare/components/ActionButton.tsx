import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";
import axios from "axios";
import * as React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Dialog, DialogType } from "@fluentui/react/lib/Dialog";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { useId } from "@fluentui/react-hooks";
import { Spinner } from "office-ui-fabric-react/lib/Spinner";
import AddGrowthModal from "./AddGrowthModal";
import { baseAPI } from "./EnvironmentVariables";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react/lib/Dropdown";
import { ReportUploadModal } from "./ReportUploadModal";
import { TextField } from "office-ui-fabric-react";

const dialogStyles = { main: { maxWidth: 450 } };
const dialogContentProps = {
  type: DialogType.normal,
  closeButtonAriaLabel: "Close",
};

export default function ActionButton(props: any) {
  const labelId: string = useId("dialogLabel");
  const subTextId: string = useId("subTextLabel");
  const [OpenDialog, setOpenDialog] = React.useState(false);
  const [OpenReportModel, seOpenReportModal] = React.useState(false);
  const [kidid, setkidid] = React.useState("");
  const [Appointmentid, setAppointmentid] = React.useState("");
  const [Loader, setLoader] = React.useState(false);
  const [OpenGrowthForm, SetOpenGrowthForm] = React.useState(false);
  const [reasons, setReasons] = React.useState<IDropdownOption[]>([]);
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [bedNo, setBedNo] = React.useState("");

  const modalProps = React.useMemo(
    () => ({
      titleAriaId: labelId,
      subtitleAriaId: subTextId,
      isBlocking: false,
      styles: dialogStyles,
    }),
    [labelId, subTextId]
  );

  let WhatsappMsg_Walkin = `https://api.whatsapp.com/send?phone=91${props.Kid_Contact}&text=Hi ${props.parent_Name},%0DI hope you're doing well. This is a friendly reminder about  ${props.Kid_Name}'s upcoming Tele Consultation appointment scheduled via KidCare app.It's set for ${props.appointment_date} at ${props.appointment_Time}. Please ensure your child is prepared for the visit.%0D If you need to reschedule or have any queries, feel free to contact us. We look forward to seeing you soon.%0DBest regards,%0DKidCare`;
  let WhatsappMsg_Tele = `https://api.whatsapp.com/send?phone=91${props.Kid_Contact}&text=Hello ${props.parent_Name},%0DThis is a friendly reminder about the upcoming appointment for ${props.Kid_Name} scheduled on ${props.appointment_date} at ${props.appointment_Time}.%0DIf there are any changes needed or if you require assistance, please let us know. We're here to help.%0DBest regards,%0DKidCare`;
  let Flip_Tele = `Hello ${props.parent_Name},This is a friendly reminder about the upcoming appointment for ${props.Kid_Name} scheduled on ${props.appointment_date} at ${props.appointment_Time}.If there are any changes needed or if you require assistance, please let us know. We're here to help.Best regards, KidCare`;
  let Flip_walking = `Hi ${props.parent_Name},I hope you're doing well. This is a friendly reminder about  ${props.Kid_Name}'s upcoming Tele Consultation appointment scheduled via KidCare app.It's set for ${props.appointment_date} at ${props.appointment_Time}. Please ensure your child is prepared for the visit.If you need to reschedule or have any queries, feel free to contact us. We look forward to seeing you soon.<br>Best regards,<br>KidCare`;
  // let Email_Tele = `Hello ${props.parent_Name},<br>This is a friendly reminder about the upcoming appointment for ${props.Kid_Name} scheduled on ${props.appointment_date} at ${props.appointment_Time}.<br>If there are any changes needed or if you require assistance, please let us know. We're here to help.Best regards, KidCare`;
  // let Email_walking = `Hi ${props.parent_Name},<br>I hope you're doing well. This is a friendly reminder about  ${props.Kid_Name}'s upcoming Tele Consultation appointment scheduled via KidCare app.It's set for ${props.appointment_date} at ${props.appointment_Time}. Please ensure your child is prepared for the visit.<br>If you need to reschedule or have any queries, feel free to contact us. We look forward to seeing you soon.<br>Best regards,<br>KidCare`;

  const menuProps = (kidId: any, appointmentID: any) => ({
    shouldFocusOnMount: true,
    shouldFocusOnContainer: true,
    items: [
      {
        key: "UpdateGrowthDetails",
        text: "Update Growth Details",
        iconProps: { iconName: "EditNote" },
        onClick: () => OpenGrowthDialog(kidId, appointmentID),
      },
      {
        key: "UploadMedicalReports",
        text: "Upload Medical Reports",
        iconProps: { iconName: "Upload" },
        onClick: () => SetCurrentIdsForModal(kidId, appointmentID),
      },

      {
        key: "UpdateStatus",
        text: "Update Status",
        iconProps: { iconName: "Edit" },

        subMenuProps: {
          items: [
            {
              key: "Markaconfirmed",
              text: "Booking Confirmed",
              title: "Mark appoinment as Booked from Block",
              iconProps: { iconName: "ReminderTime" },
              onClick: () => SetDialogOpen(appointmentID),
              disabled: props.appointmentStatus != "Block",
            },
            {
              key: "MarkasComplete",
              text: "Completed",
              title: "Mark as Completed",
              iconProps: { iconName: "Completed" },
              onClick: () => MarksAppointmentVisited(appointmentID),
              disabled: props.appointmentStatus != "Book",
            },
            {
              key: "NotVisited",
              text: "Not Visited",
              title: "Mark as Not Visited",
              iconProps: { iconName: "UserRemove" },
              onClick: () => MarksAppointmentNotVisited(appointmentID),
              disabled: props.appointmentStatus != "Book",
            },
            {
              key: "cancelappointment",
              text: "Cancel Appointment",
              title: "Cancel today's  appointment for selected kid",
              iconProps: { iconName: "Cancel" },
              onClick: () => handelcancelAppointment(appointmentID),
              disabled: props.appointmentStatus == "Completed",
            },
          ],
        },
      },
      {
        key: "sendreminder",
        text: "Send Reminder",
        iconProps: { iconName: "Send" },
        subMenuProps: {
          items: [
            {
              key: "Email",
              text: "Email",
              title: "Send an Email",
              iconProps: { iconName: "MailSolid" },
              disabled: props.Kid_Email == "",
              onClick: () => handleMailClick(),
            },
            {
              key: "Flip",
              text: "Flip",
              title: "Create a Flip",
              iconProps: { iconName: "ContextMenu" },
              onClick: () => handleFlipClick(), // Call the function on click
            },

            {
              key: "WhatsApp",
              text: "WhatsApp",
              title: "Send WhatsApp message",
              iconProps: { iconName: "OfficeChat" },
              href: props.appointment_Type
                ? WhatsappMsg_Walkin
                : WhatsappMsg_Tele,
              target: "_blank",
              disabled: props.Kid_Contact == "" || props.Kid_Contact == "-",
            },
          ],
        },
      },
    ],
  });

  // Add a new function outside the component

  const handelcancelAppointment = (id: any) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    consoleValues();
    if (confirmed) {
      CancelAppointment(id);
    }
  };

  const handleFlipClick = () => {
    console.log("Flip Clicked");
    HandelFlipSent();
  };

  const handleMailClick = () => {
    console.log("Email send Clicked");
    SendMail();
  };

  const HandelFlipSent = async () => {
    try {
      // const imageResponse = await fetch(require("../assets/growth.png"));
      // const imageBlob = await imageResponse.blob();
      const url = `${baseAPI()}/createflip`;
      const formData = new FormData();

      formData.append("Kid_Id", props.kid_Id);
      formData.append("Receiver_Id", props.parent_Id);
      formData.append("Parent_Id", props.parent_Id);
      formData.append("Flip_Type", "Reminder Flip");
      formData.append("Title", " Appointment reminder");
      formData.append(
        "Message",
        props.appointment_Type ? Flip_walking : Flip_Tele
      );
      // formData.append("Image", imageBlob, "images.png");
      formData.append("upload_by", await GetUserName());
      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      });
      console.log(response);
      alert("Appointment reminder Flip sent !");
    } catch (error) {
      console.error(error);
      window.alert("Appointment reminder Flip not sent !");
      throw error;
    }
  };

  const SendMail = async () => {
    try {
      // const response = await axios.get(url);
      // console.log(response.data);
      alert("Appointment reminder E-mail sent !");
      this.handleMenuClose();
      UploadModalClose();
    } catch (error) {
      UploadModalClose();
      console.error("Error fetching data: ", error);
      this.handleMenuClose();
      alert("Appointment reminder E-mail not sent !");
    }
  };

  const SetCurrentIdsForModal = (kidid: any, Appointmentid: any) => {
    setkidid(kidid);
    setAppointmentid(Appointmentid);
    seOpenReportModal(true);
  };

  const SetDialogOpen = (Appointmentid: any) => {
    setAppointmentid(Appointmentid);
    setOpenDialog(true);
  };

  const OpenGrowthDialog = (kidid: any, Appointmentid: any) => {
    setkidid(kidid);
    setAppointmentid(Appointmentid);
    SetOpenGrowthForm(true);
  };

  const MarksAppointmentVisited = async (Appointmentid: any) => {
    try {
      // const url = `${baseAPI()}/markappointment?Appointment_Id=${Appointmentid}&Status=1&Reason=Patitent Visited`;
      // const response = await axios.post(url);
      // console.log(response.data);
      window.alert("Appointment marked as completed !");
      this.handleMenuClose();
      UploadModalClose();
    } catch (error) {
      UploadModalClose();
      console.error("Error fetching data: ", error);
      this.handleMenuClose();
      window.alert("Error in Update !");
    }
  };

  const MarksAppointmentNotVisited = async (Appointmentid: any) => {
    try {
      const url = `${baseAPI()}/markappointment?Appointment_Id=${Appointmentid}&Status=2&Reason=Patitent%20Not%20Visited`;
      const response = await axios.post(url);
      console.log(response.data);
      window.alert("Appointment marked as not completed !");
      this.handleMenuClose();
      UploadModalClose();
    } catch (error) {
      UploadModalClose();
      console.error("Error fetching data: ", error);
      this.handleMenuClose();
      window.alert("Error in Update !");
    }
  };

  const MarksAppointmentBooked = async (Appointmentid: any) => {
    try {
      const url = `${baseAPI()}/markappointment?Appointment_Id=${Appointmentid}&Status=0&Reason=${selectedReason}&Bed_number=${bedNo}`;
      const response = await axios.post(url);
      console.log(response.data);
      if (response.data.status === 1) {
        window.alert("Booking Confirmed !");
      } else {
        window.alert("Error in Booking Appointment!");
      }
      this.handleMenuClose();
      UploadModalClose();
    } catch (error) {
      UploadModalClose();
      console.error("Error fetching data: ", error);
      this.handleMenuClose();
    }
  };

  const CancelAppointment = async (appointmentID: any) => {
    setLoader(true);
    try {
      const response = await axios.get(
        `${baseAPI()}/cancelappointment?Appointment_Id=${appointmentID}`
      );
      console.log(response.data);
      UploadModalClose();
      window.alert("Appointment cancelled !");
      setLoader(false);
    } catch (error) {
      setLoader(false);
      UploadModalClose();
      console.error("Error fetching data: ", error);
      this.handleMenuClose();
      window.alert("Error in status update !");
    }
  };

  const UploadModalClose = () => {
    seOpenReportModal(false);
    props.onCLOSE(); // Call the callback function
    setOpenDialog(false);
    SetOpenGrowthForm(false);
  };

  const GetUserName = async () => {
    const response = await axios.get("/_api/web/currentuser");
    const userTitle = response.data.Email;
    return userTitle;
  };

  const fetchBookingReasons = async () => {
    try {
      const response = await axios.get(
        "https://healthpointsolutions.sharepoint.com/sites/KidsCare/_api/web/lists/getByTitle('MD_Confirm_Reasons')/items?$top=2000&$select=*"
      );

      const ReasonList = response.data.value;
      // console.log(ReasonList);

      const reasonOptions: IDropdownOption[] = ReasonList.map((item: any) => ({
        key: item.Title,
        text: item.Title,
      }));

      setReasons(reasonOptions);
    } catch (error) {
      console.error("Error fetching booking reasons:", error);
      // Handle the error as needed (e.g., show an error message to the user)
    }
  };

  React.useEffect(() => {
    fetchBookingReasons();
  }, []);

  const handleReasonChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    if (option) {
      setSelectedReason(option.key as string);
      console.log("Selected Reason:", option.key);
    }
  };

  const consoleValues = () => {
    console.log(props.kid_Id + "Kid id");
    console.log(props.appointment_Id + "Appointment id");
    console.log(props.Kid_Name + "Kid Name");
    console.log(props.parent_Id + "Parent id");
    console.log(props.parent_Name + "Parent Name");
    console.log(props.appointment_Type + "Appointment type");
    console.log(props.appointment_Time + "Appointment Time");
    console.log(props.appointment_date + "Appointment date");
    console.log(props.Kid_Contact + "Kid contact");
    console.log(props.Kid_Email + "Kid Email");
  };

  return (
    <>
      <div>
        <div>
          {OpenReportModel && (
            <FluentProvider theme={teamsLightTheme}>
              <ReportUploadModal
                KidID={kidid}
                AppointmentID={Appointmentid}
                onCLOSE={UploadModalClose}
              ></ReportUploadModal>
            </FluentProvider>
          )}
        </div>
        {OpenGrowthForm && (
          <div>
            <AddGrowthModal
              KidID={kidid}
              AppointmentID={Appointmentid}
              modal={OpenGrowthForm}
              modalClose={UploadModalClose}
            ></AddGrowthModal>
          </div>
        )}
        <div>
          <DefaultButton
            style={{ background: "bottom", border: "none", cursor: "pointer" }}
            menuIconProps={{ iconName: "" }}
            menuProps={menuProps(props.kid_Id, props.appointment_Id)}
          >
            <MoreVertIcon />
          </DefaultButton>
        </div>
      </div>

      {/* #################################  modal ##################################################### */}
      <Dialog
        hidden={!OpenDialog} // Invert the value to show the dialog when OpenDialog is true
        onDismiss={UploadModalClose}
        dialogContentProps={dialogContentProps}
        modalProps={modalProps}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div>
            <label htmlFor="reasonDropdown">Select Reason:</label>
            <Dropdown
              id="reasonDropdown"
              options={
                props.appointment_Type == "Offline"
                  ? reasons
                  : reasons.filter((reason) => reason.key != "In-Patient")
              }
              selectedKey={selectedReason}
              onChange={handleReasonChange}
              style={{ width: "200px" }}
            />
          </div>
          <br />

          {selectedReason === "In-Patient" && (
            <div>
              <label htmlFor="bedNo">Enter Bed No:</label>
              <TextField
                id="bedNo"
                value={bedNo}
                onChange={(e, newValue) => setBedNo(newValue || "")}
                errorMessage={bedNo == "" ? "Enter a valid Bed Number!" : ""}
                style={{ width: "200px" }}
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "25px",
            }}
          >
            <div style={{ marginRight: "10px", display: "flex" }}>
              <DefaultButton onClick={UploadModalClose}>Cancel</DefaultButton>
            </div>

            {!Loader ? (
              <div>
                <PrimaryButton
                  onClick={() =>
                    selectedReason === "In-Patient" && bedNo == ""
                      ? window.alert("Enter a valid Bed Number to Confirm!")
                      : MarksAppointmentBooked(Appointmentid)
                  }
                >
                  Confirm
                </PrimaryButton>
              </div>
            ) : (
              <div style={{ marginTop: "5px" }}>
                <Spinner
                  ariaLive="assertive"
                  label="Please Wait..."
                  labelPosition="right"
                />
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}
