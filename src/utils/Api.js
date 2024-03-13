const SERVER_URL = '';
const SERVER_REGION = 'us-east-1';

export function createMeetingRequest(meetingName, attendeeName) {

  let url = encodeURI(SERVER_URL + "/join?" + `title=${meetingName}&name=${attendeeName}&region=${SERVER_REGION}`);

  return fetch(url, { method: 'POST' }).then(j => j.json());
}
