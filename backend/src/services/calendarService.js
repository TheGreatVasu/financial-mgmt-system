// Calendar sync stubs; replace with Google/Outlook integrations later
async function createCalendarEvent(mom) {
  // Return fake event ID
  return `evt_${mom.momId || mom._id}`;
}

async function updateCalendarEvent(eventId, mom) {
  return true;
}

async function deleteCalendarEvent(eventId) {
  return true;
}

module.exports = { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent };


