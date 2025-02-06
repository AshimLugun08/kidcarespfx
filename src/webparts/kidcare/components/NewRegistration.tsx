import * as React from "react";
import {
  
  TextField,
  
  DatePicker,
  DefaultButton,
  PrimaryButton,
  Spinner,
  Dropdown,
} from "office-ui-fabric-react";
import axios from "axios";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { baseAPI, baseURL } from "./EnvironmentVariables";
import { Box, Modal } from "@mui/material";

//const productionAPI = "https://kidcarehealthpointapi.azurewebsites.net";
require("./mycss.css");

interface NewRegistrationFormProps {
  isOpen: boolean;
  ALLdata: any;
  onDismiss: () => void;
  onSaveSuccess: () => void;
}

// const styleold = {
//   position: "absolute" as "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   width: 420,
//   bgcolor: "background.paper",
//   border: "2px solid #000",
//   boxShadow: 24,
//   p: 2,
// };

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 420,
  maxHeight: "90vh", // Limits the height to 90% of the viewport
  overflowY: "auto", // Adds vertical scrolling if content exceeds the height
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 2,
};

interface NewRegistrationFormProps {
  isOpen: boolean;
  ALLdata: any;
  onDismiss: () => void;
  onSaveSuccess: () => void;
}

const NewRegistrationForm: React.FC<NewRegistrationFormProps> = ({
  isOpen,
  ALLdata,
  onDismiss,
  onSaveSuccess,
}) => {
  const [uhid, setUHID] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [gender, setGender] = React.useState("Male");
  const [parentsName, setParentsName] = React.useState("");
  const [relation, setRelation] = React.useState("Father");
  const [contactCountryCode, setContactCountryCode] = React.useState("+91");
  const [contact, setContact] = React.useState("");
  const [whatsappCountryCode, setWhatsappCountryCode] =
    React.useState<any>("+91");
  const [whatsapp, setWhatsapp] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [state, setState] = React.useState("");
  const [city, setCity] = React.useState("");
  const [pin, setPIN] = React.useState<any>("");
  const [copyPhoneNumber, setCopyPhoneNumber] = React.useState(false);
  const [loading, setloading] = React.useState(false);
  const [saveClicked, setsaveclicked] = React.useState(false);
  const formattedDate = selectedDate
    ? new Date(
      selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0]
    : "";

  const handleGenderChange = (
    ev: React.ChangeEvent<HTMLInputElement>,
    newValue: string
  ) => {
    setGender(newValue);
  };

  const fetchLocationInfo = async (pin: string) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pin}`
      );
      const data = await response.json();

      if (
        Array.isArray(data) &&
        data.length > 0 &&
        data[0].Status === "Success"
      ) {
        const locationData = data[0].PostOffice[0];
        setState(locationData.State);
        setCity(locationData.District);
      } else {
        console.error("Invalid PIN or no data found.");
      }
    } catch (error) {
      console.error("Error fetching location info:", error);
    }
  };

  React.useEffect(() => {
    if (pin && pin.length === 6 && !isNaN(pin)) {
      fetchLocationInfo(pin);
    }
  }, [pin]);

  const GetUserName = async () => {
    const response = await axios.get("/_api/web/currentuser");
    const userTitle = response.data.Email;
    return userTitle;
  };

  const isUhidPresent = (uhidToCheck: any) => {
    return ALLdata.some((item: { uhid: any }) => item.uhid === uhidToCheck);
  };

  //########################################################################################################################

  const SaveRegistrationForm = async () => {
    try {
      setsaveclicked(true);
      console.log("Save Clicked:", saveClicked);

      if (
        firstName === "" ||
        lastName === "" ||
        contact.length != 10 ||
        contact.length != 10 ||
        parentsName === ""
      ) {
        alert("Required Fields are Empty!");
      } else {
        setloading(true);
        const imageResponse = await fetch(require("../assets/Kid.png"));
        const imageBlob = await imageResponse.blob();

        let data = new FormData();
        data.append("UHID", "0000");
        data.append("Name", parentsName);
        data.append("Relation", relation);
        data.append("Email", email ? email : "-");
        data.append("Phone", `${contactCountryCode}${contact}`);
        data.append(
          "Whatsapp",
          whatsapp ? `${whatsappCountryCode}${whatsapp}` : "-"
        );
        data.append("Address", address ? address : "-");
        data.append("City", city ? city : "-");
        data.append("State", state ? state : "-");
        data.append("Pincode", pin ? pin : "-");
        data.append("Upload_By", await GetUserName());
        data.append("Image", imageBlob, "Kid.png");

        let config = {
          method: "post",
          url: `${baseAPI()}/register`,
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "text/plain",
          },
          data: data,
        };

        const response = await axios(config);
        const parentID = response.data.id;
        console.log("parentID =" + parentID);

        await registerKid(parentID); // Adding A Kid Now
      }
    } catch (error) {
      console.error(error);
      setloading(false);
      alert("Registration Failed !");
      onDismiss(); // close dialog
    }
  };

  const registerKid = async (parentID_new: string) => {
    try {
      const imageResponse = await fetch(require("../assets/p.png"));
      const imageBlob = await imageResponse.blob();
      const url = `${baseAPI()}/registerkid`;

      const formData = new FormData();
      formData.append("Parent_Profile_Id", parentID_new);
      formData.append("UHID", uhid);
      formData.append("Name", `${firstName} ${lastName}`);
      formData.append("Gender", gender);
      formData.append("DOB", formattedDate);
      formData.append("Image", imageBlob, "images.png");
      formData.append("upload_by", await GetUserName());

      console.log(formData);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      });
      console.log("Kid Registration :" + response);
      setloading(false);
      setsaveclicked(false);
      onSaveSuccess();
      alert(" Registration Successfull. Opening Pediatrics History Form !");
      window.location.href = `${baseURL()}/Pediatrics-History-Form.aspx?kid_Id=${response.data.id
        }`;

      // window.open(
      //   `${baseURL()}/Pediatrics-History-Form.aspx?kid_Id=${response.data.id}`,
      //   "_blank"
      // );
    } catch (error) {
      console.error(error);
      setloading(false);
      setsaveclicked(true);
      onDismiss(); // close dialog
      alert("Registration Failed !!");
      throw error;
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onDismiss}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <label
          style={{
            fontWeight: "bold",
            color: "#53bf9d",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          New Patient Registration
        </label>
        <div style={{ padding: "5px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontSize: "13px" }}>
              UHID<span style={{ color: "red" }}>*</span>
            </label>
            <TextField
              errorMessage={
                isUhidPresent(uhid)
                  ? "UHID already Exist !"
                  : (uhid && uhid.length < 10) ||
                    (saveClicked && uhid.length < 10)
                    ? "Enter valid UHID !"
                    : ""
              }
              value={uhid}
              onChange={(e, newValue) => setUHID(newValue ?? "")}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "7px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginRight: "10px" }}>
                <label style={{ fontSize: "13px" }}>
                  First Name<span style={{ color: "red" }}>*</span>
                </label>
                <TextField
                  value={firstName}
                  onChange={(e, newValue) => setFirstName(newValue || "")}
                  errorMessage={
                    saveClicked && firstName == ""
                      ? "First name is required !"
                      : ""
                  }
                />
              </div>
              <div>
                <label style={{ fontSize: "13px" }}>
                  Last Name<span style={{ color: "red" }}>*</span>
                </label>
                <TextField
                  value={lastName}
                  onChange={(e, newValue) => setLastName(newValue || "")}
                  errorMessage={
                    saveClicked && lastName == "" ? "Last name required !" : ""
                  }
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "7px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginRight: "10px" }}>
                <label style={{ fontSize: "13px" }}>
                  Date of Birth<span style={{ color: "red" }}>*</span>
                </label>
                <DatePicker
                  firstDayOfWeek={1}
                  showWeekNumbers={false}
                  firstWeekOfYear={1}
                  showMonthPickerAsOverlay={true}
                  placeholder="Select date"
                  onSelectDate={(date: any) => setSelectedDate(date)}
                  value={selectedDate}
                  styles={{ textField: { textAlign: "left" } }}
                  maxDate={new Date()}
                  formatDate={(date: any) => date.toLocaleDateString()}
                  style={{ width: "177px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px" }}>
                  Gender<span style={{ color: "red" }}>*</span>
                </label>
                <RadioGroup
                  value={gender}
                  onChange={handleGenderChange}
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  style={{
                    gap: "15px",
                    fontFamily: "Segoe UI",
                    fontSize: "14px",
                  }}
                >
                  <FormControlLabel
                    value="Male"
                    control={<Radio />}
                    label="Male"
                  />
                  <FormControlLabel
                    value="Female"
                    control={<Radio />}
                    label="Female"
                  />
                </RadioGroup>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "7px",
                justifyContent: "space-between",
              }}
            >
              <div style={{ marginRight: "10px" }}>
                <label style={{ fontSize: "13px" }}>
                  Parent's Name<span style={{ color: "red" }}>*</span>
                </label>
                <TextField
                  value={parentsName}
                  onChange={(e, newValue) => setParentsName(newValue || "")}
                  errorMessage={
                    saveClicked && parentsName == ""
                      ? "Parent name required !"
                      : ""
                  }
                />
              </div>
              <div>
                <label style={{ fontSize: "13px" }}>
                  Relation<span style={{ color: "red" }}>*</span>
                </label>
                <Dropdown
                  options={[
                    { key: "Mother", text: "Mother" },
                    { key: "Father", text: "Father" },
                  ]}
                  selectedKey={relation}
                  onChange={(e, option: any) => setRelation(option?.key || "")}
                  style={{ width: "177px" }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: "7px",
                justifyContent: "space-between",
                flexDirection: "column",
              }}
            >
              <label style={{ fontSize: "13px" }}>
                Country Code & Phone Number
                <span style={{ color: "red" }}>*</span>
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <Dropdown
                    options={[{ key: "+91", text: "+91 (India)" }]}
                    selectedKey={contactCountryCode}
                    onChange={(e, option: any) =>
                      setContactCountryCode(option?.key || "")
                    }
                    style={{ width: "120px" }}
                  />
                </div>
                <div>
                  <TextField
                    placeholder="Enter 10 digit mobile number"
                    value={contact}
                    onChange={(e, newValue) => {
                      const sanitizedValue = (newValue || "").replace(
                        /[^0-9]/g,
                        ""
                      );
                      setContact(sanitizedValue);
                    }}
                    style={{ width: "240px" }}
                    errorMessage={
                      (saveClicked && contact.length != 10) ||
                        (contact && contact.length != 10)
                        ? "Enter a valid phone number !"
                        : ""
                    }
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex" }}>
              <input
                type="checkbox"
                checked={copyPhoneNumber}
                onChange={(e) => setCopyPhoneNumber(e.target.checked)}
              />
              <label
                style={{
                  marginLeft: "5px",
                  marginTop: "13px",
                  fontSize: "13px",
                }}
              >
                My WhatsApp number is the same as my phone number
              </label>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "7px",
                justifyContent: "space-between",
              }}
            >
              <label style={{ fontSize: "13px" }}>
                WhatsApp Country Code & Number
              </label>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  <Dropdown
                    options={[{ key: "+91", text: "+91 (India)" }]}
                    selectedKey={whatsappCountryCode}
                    onChange={(e, option) =>
                      setWhatsappCountryCode(option?.key || "")
                    }
                    style={{ width: "120px" }}
                  />
                </div>
                <div>
                  <TextField
                    placeholder="Enter 10 digit mobile number"
                    value={copyPhoneNumber ? contact : whatsapp}
                    onChange={(e, newValue) => {
                      const sanitizedValue = (newValue || "").replace(
                        /[^0-9]/g,
                        ""
                      );
                      setWhatsapp(sanitizedValue);
                    }}
                    style={{ width: "240px" }}
                    errorMessage={
                      whatsapp && whatsapp.length != 10
                        ? "Enter a valid Whatsapp number !"
                        : ""
                    }
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "7px",
              }}
            >
              <label style={{ fontSize: "13px" }}>Email</label>
              <TextField
                value={email}
                onChange={(e, newValue) => setEmail(newValue || "")}
                placeholder="example@email.com"
                errorMessage={
                  email && !isValidEmail(email)
                    ? "Enter a valid Email address!"
                    : ""
                }
              />
            </div>

            <div style={{ marginTop: "7px" }}>
              <label style={{ fontSize: "13px" }}>Address</label>
              <TextField
                multiline
                rows={2}
                value={address}
                onChange={(e, newValue) => setAddress(newValue || "")}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "7px",
              }}
            >
              <div style={{ marginRight: "10px" }}>
                <TextField
                  placeholder="State"
                  value={state}
                  onChange={(e, newValue) => setState(newValue || "")}
                />
              </div>
              <div style={{ marginRight: "10px" }}>
                <TextField
                  placeholder="City"
                  value={city}
                  onChange={(e, newValue) => setCity(newValue || "")}
                />
              </div>
              <div>
                <TextField
                  placeholder="e.g. 834004"
                  value={pin}
                  onChange={(e, newValue) => {
                    const sanitizedValue = (newValue || "").replace(
                      /[^0-9]/g,
                      ""
                    );
                    setPIN(sanitizedValue);
                  }}
                  errorMessage={
                    pin && pin.length < 6 ? "Enter a valid PIN !" : ""
                  }
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                gap: "15px",
              }}
            >
              <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
              {!loading ? (
                <div>
                  <PrimaryButton onClick={SaveRegistrationForm}>
                    Save
                  </PrimaryButton>
                </div>
              ) : (
                <div style={{ marginTop: "5px" }}>
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
  );
};

export default NewRegistrationForm;

// Function to validate email address
const isValidEmail = (email: string) => {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
