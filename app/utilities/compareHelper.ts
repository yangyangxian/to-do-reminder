export const isBeforeToday = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();

  // Set the time of today to midnight to compare only the date part
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today;
};

export const isToday = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();

  // Set the time of today to midnight to compare only the date part
  today.setHours(0, 0, 0, 0);

  return inputDate.toDateString() === today.toDateString();
};