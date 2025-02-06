import {
  DefaultButton,
  Dropdown,
  FontWeights,
  getTheme,
  IDropdownOption,
  mergeStyleSets,
  Modal,
  Persona,
  PersonaSize,
  PrimaryButton,
  Spinner,
  TextField,
} from "office-ui-fabric-react";
import * as React from "react";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import axios from "axios";
import { baseAPI } from "./EnvironmentVariables";

require("./custom.css");

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: "flex",
    minWidth: "800px",
    maxWidth: "800px",
  },
  header: [
    theme.fonts.xLargePlus,
    {
      flex: "1 1 auto",
      borderTop: `4px solid #03787c`,
      color: theme.palette.neutralPrimary,
      display: "flex",
      alignItems: "center",
      fontWeight: FontWeights.semibold,
      padding: "12px 12px 14px 24px",
      background: "#53bf9d",
    },
  ],
  body: {
    flex: "4 4 auto",
    padding: "0 24px 24px 24px",
    overflowY: "hidden",
    selectors: {
      p: { margin: "14px 0" },
      "p:first-child": { marginTop: 0 },
      "p:last-child": { marginBottom: 0 },
    },
  },
});

const customStyles = mergeStyleSets({
  boldWhiteText: {
    fontWeight: FontWeights.bold,
    color: "white",
  },
});

interface IFlipModal {
  ModalOpen: boolean;
  ModalClose: any;
  KidDetail: any;
  Reply: any;
}

export default function replyFlipModal(props: IFlipModal) {
  const [IsLoading, setIsLoading] = React.useState(false);
  const [FlipTypeOption, SetFlipTypeOption] = React.useState<any>([]);
  const [FlipTemplate, SetFlipTemplate] = React.useState<any>([]);

  const [selectedFlipType, setSelectedFlipType] = React.useState<any>("");
  const [Title, SetTitle] = React.useState("");
  const [Message, SetMessage] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    fetchFlipTypeData();
    fetchFlipTemplateData();
  }, []);

  const FlipTypeChoose = (event: any, option: any) => {
    setSelectedFlipType(option.key);
  };

  React.useEffect(() => {
    if (!props.Reply) {
      const filteredFlipTemplate = FlipTemplate.filter(
        (item: any) => item.flipType === selectedFlipType
      );

      SetTitle(filteredFlipTemplate[0]?.title);
      const formattedMessage = filteredFlipTemplate[0]?.message.replace(
        "[Patient]",
        props.KidDetail.name
      );
      SetMessage(formattedMessage);
    }
  }, [selectedFlipType || props.KidDetail.name]);

  const fetchFlipTypeData = async () => {
    try {
      const response = await axios.get(`${baseAPI()}/getFlipTypeList`);
      const filteredFlipTypeData = response.data.flipTypeList.filter(
        (item: any) => item.canCreate === "Care Partner"
      );
      const dropdownOptions: IDropdownOption[] = filteredFlipTypeData.map(
        (item: any) => ({
          key: item.flipType,
          text: item.flipType,
        })
      );
      SetFlipTypeOption(dropdownOptions);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchFlipTemplateData = async () => {
    try {
      const response = await axios.get(`${baseAPI()}/getFlipTemplate`);
      console.log(response.data.templates)
      SetFlipTemplate(response.data.templates);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const ModalClose = () => {
    props.ModalClose(false);
    SetMessage("");
    SetTitle("");
    setSelectedFlipType("");
  };

  const handleTitleChange = (event: any) => {
    SetTitle(event.target.value);
  };

  const onTextChange = (newText: string) => {
    SetMessage(newText);
    return newText;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
    }
  };

  const GetUserName = async () => {
    const response = await axios.get("/_api/web/currentuser");
    const userTitle = response.data.Email;
    return userTitle;
  };

  const handleSendFlip = async () => {
    try {
      setIsLoading(true);
      const url = `${baseAPI()}/createflip`;
      const formData = new FormData();
      formData.append("Kid_Id", props.KidDetail.kid_Id);
      formData.append("Receiver_Id", props.KidDetail.parent_Id);
      formData.append("Parent_Id", props.KidDetail.parent_Id);
      formData.append("Flip_Type", selectedFlipType);
      formData.append("Title", Title);
      formData.append("Message", Message);
      if (imageFile) {
        formData.append("Image", imageFile, imageFile.name);
      } else {
        formData.append("Image", ""); // Empty string if no file selected
      }
      formData.append("upload_by", await GetUserName());

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          accept: "text/plain",
        },
      });
      console.log("API response:", response.data);
      window.alert(`Flip sent successfully.`);
      setIsLoading(false);
      ModalClose();
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      window.alert("Flip not sent !");
      throw error;
    }
  };

  return (
    <>
      <Modal
        isOpen={props.ModalOpen}
        onDismiss={() => {
          ModalClose();
        }}
        containerClassName={contentStyles.container}
      >
        <div className={contentStyles.header}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "98%",
            }}
          >
            <Persona
              imageUrl={props.KidDetail.photo}
              size={PersonaSize.size48}
              text={props.KidDetail.name}
              className={customStyles.boldWhiteText}
            />

            <Dropdown
              style={{ width: "200px" }}
              placeholder="Choose Flip Type"
              options={FlipTypeOption}
              onChange={FlipTypeChoose}
              selectedKey={selectedFlipType}
              disabled={props.Reply}
            />
          </div>
        </div>

        <div className={contentStyles.body}>
          <TextField
            label="Title"
            value={Title}
            onChange={handleTitleChange}
            styles={{ root: { marginBottom: 30, marginTop: 20 } }}
          />

          <RichText
            placeholder="Message"
            value={Message}
            onChange={(text: any) => onTextChange(text)}
          />
          <div style={{ marginTop: "15px", marginBottom: "20px" }}>
            <input type="file" onChange={handleFileChange} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "  25%",
              marginTop: "30px",
            }}
          >
            <DefaultButton text="Cancel" onClick={() => ModalClose()} />

            {!IsLoading ? (
              <div>
                <PrimaryButton onClick={handleSendFlip}>Send</PrimaryButton>
              </div>
            ) : (
              <div style={{ marginTop: "5px" }}>
                <Spinner
                  label="Sending..."
                  ariaLive="assertive"
                  labelPosition="right"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
