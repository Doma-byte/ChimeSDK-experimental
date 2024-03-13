const SERVER_URL = 'https://vuonmhwri0.execute-api.us-east-1.amazonaws.com/Prod/';
const SERVER_REGION = 'us-east-1';

export function createMeetingRequest(meetingName, attendeeName) {

  let url = encodeURI(SERVER_URL + "/join?" + `title=${meetingName}&name=${attendeeName}&region=${SERVER_REGION}`);

  return fetch(url, { method: 'POST' }).then(j => j.json());
}
