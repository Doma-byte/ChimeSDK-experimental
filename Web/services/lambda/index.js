const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid"); // Use uuid package for UUID generation
const AWS = require("aws-sdk");
const cors = require("cors");
require("dotenv").config();

const app = express();
const corsOptions = {
  origin: "*", // Replace with your frontend domain
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

const port = 3001;
app.use(express.json());

AWS.config.update({ region: "us-east-1" });
AWS.config.credentials = new AWS.Credentials(
  process.env.AWS_ACCESS_KEY,
  process.env.AWS_SECRET_KEY
);
const chime = new AWS.Chime();
chime.endpoint = new AWS.Endpoint(
  "https://meetings-chime.us-east-1.amazonaws.com"
);

const json = (statusCode, contentType, body) => {
  return {
    statusCode,
    headers: { "content-type": contentType },
    body: JSON.stringify(body),
  };
};

function create_UUID() {
  return uuidv4();
}

async function doMeeting(event) {
  const query = event.query;
  console.log("Query :",query);
  let meetingId = "";
  let meeting = null;
  let userName = "";

  const theBodyContent = event.body;
  console.log("The body content :",theBodyContent);
  meetingId = theBodyContent.MEETING_ID;
  userName = theBodyContent.USERNAME;

  if (meetingId === "" || meetingId === null || meetingId === "null") {
    // New meeting

    let meetingToken = create_UUID();
    console.log("NOTE: NEW MEETING");
    meeting = await chime
      .createMeeting({
        ClientRequestToken: meetingToken,
        MediaRegion: "us-east-1",
        ExternalMeetingId: meetingToken,
      })
      .promise();
  } else {
    // Join existing meeting

    // Fetch meeting details
    try {
      meetingId = query.meetingId;
      meeting = await chime
        .getMeeting({
          MeetingId: meetingId,
        })
        .promise();
    } catch (e) {
      if (e.code == "NotFound") {
        console.log("Meeting Not Found");
      }
      //console.log("ERROR while Getting Meeting Details " + JSON.stringify(e));
      return json(200, "application/json", {}); //Meeting Id not found, return.
    }
  }

  // Add attendee to the meeting (new or existing)
  const attendee = await chime
    .createAttendee({
      MeetingId: meeting.Meeting.MeetingId,
      ExternalUserId: `${userName}#${query.clientId}`,
    })
    .promise();

  return json(200, "application/json", {
    Info: {
      Meeting: meeting,
      Attendee: attendee,
    },
  });
}

async function deleteAttendee(event) {
  const body = event.body;
  console.log("Exit meeting is :",body);
  const deleteRequest = await chime
    .deleteAttendee({
      MeetingId: body.MEETING_ID,
      AttendeeId: body.ATTENDEE_ID,
    })
    .promise();
  return json(200, "application/json", {});
}

// Delete the meeting
async function deleteMeeting(event) {
  const body = event.body;
  console.log("NOTE end func: Meeting ID Received: " + body.MEETING_ID);
  const deleteRequest = await chime
    .deleteMeeting({
      MeetingId: body.MEETING_ID,
    })
    .promise();
  return json(200, "application/json", {});
}

app.post("/", async (req, res) => {
  const bodyContent = req.body;
  if (bodyContent.action == "DO_MEETING") {
    const result = await doMeeting(req);
    res.json(result);
  } else if (bodyContent.action == "DELETE_ATTENDEE") {
    const result = await deleteAttendee(req);
    res.json(result);
  } else if (bodyContent.action == "END_MEETING") {
    const result = await deleteMeeting(req);
    res.json(result);
  } else {
    console.log("Event Unrecognized");
    res.status(200).json({});
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
