const moment = require('moment');

const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  return moment(date).format(format);
};

const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return null;
  return moment(date).format(format);
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  return moment(dateString).toDate();
};

const isValidDate = (date) => {
  return moment(date).isValid();
};

const addDays = (date, days) => {
  return moment(date).add(days, 'days').toDate();
};

const subtractDays = (date, days) => {
  return moment(date).subtract(days, 'days').toDate();
};

const getDaysDifference = (date1, date2) => {
  return moment(date2).diff(moment(date1), 'days');
};

const isDateInRange = (date, startDate, endDate) => {
  return moment(date).isBetween(startDate, endDate, null, '[]');
};

const getCurrentDate = () => {
  return moment().toDate();
};

const getCurrentDateTime = () => {
  return moment().toDate();
};

const getStartOfMonth = (date = new Date()) => {
  return moment(date).startOf('month').toDate();
};

const getEndOfMonth = (date = new Date()) => {
  return moment(date).endOf('month').toDate();
};

const getStartOfYear = (date = new Date()) => {
  return moment(date).startOf('year').toDate();
};

const getEndOfYear = (date = new Date()) => {
  return moment(date).endOf('year').toDate();
};

module.exports = {
  formatDate,
  formatDateTime,
  parseDate,
  isValidDate,
  addDays,
  subtractDays,
  getDaysDifference,
  isDateInRange,
  getCurrentDate,
  getCurrentDateTime,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear
};
