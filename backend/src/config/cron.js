const cron = require('node-cron');
const dataStore = require('../models/dataStore');
const { sendNotificationBundle } = require('../utils/notifications');
const { decrypt } = require('../utils/security');

const summarizeUpcomingClasses = () =>
  dataStore.classes
    .filter((cls) => new Date(cls.startTime) > new Date())
    .slice(0, 5)
    .map(
      (cls) =>
        `• ${cls.phase} / ${cls.studentGroup} | ${new Date(cls.startTime).toLocaleString('en-IN')}`,
    )
    .join('<br/>');

const archiveOldAttendance = () => {
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 6);

  const [archiveable, recent] = dataStore.attendance.reduce(
    (acc, record) => {
      if (new Date(record.date) < threshold) {
        acc[0].push(record);
      } else {
        acc[1].push(record);
      }
      return acc;
    },
    [[], []],
  );

  dataStore.attendance = recent;
  dataStore.archivedRecords.push(...archiveable);
};

const sendDailyReminders = async () => {
  const tutor = dataStore.tutors[0];
  if (!tutor) return;

  await sendNotificationBundle({
    toEmail: tutor.email,
    toPhone: decrypt(tutor.phone),
    subject: 'KK Daily Schedule Reminder',
    html: `<p>Here is your upcoming schedule:</p><p>${summarizeUpcomingClasses() || 'No classes'}</p>`,
    whatsappMessage: `Upcoming KK classes:\n${summarizeUpcomingClasses()}`,
  });
};

const registerCronJobs = () => {
  cron.schedule('0 7 * * *', sendDailyReminders, { timezone: 'Asia/Kolkata' });
  cron.schedule('0 2 * * 1', archiveOldAttendance);
};

module.exports = {
  registerCronJobs,
};

