// utils/dateFormatter.js
export const formatDateForMySQL = (date) => {
    if (!date) return null;
    return new Date(date)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');
  };
  
  export const getFutureDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDateForMySQL(date);
  };