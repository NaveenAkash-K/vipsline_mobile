import { StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

export const capitalizeFirstLetter = (string) => {
    if (string === undefined) return;
    return string[0].toUpperCase() + string.slice(1, string.length).toLowerCase();
}

export function formatTime(date, format) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour to 12-hour format for "hh:mm pp" format
    const twelveHour = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    if (format === "hh:mm pp") {
        return `${twelveHour}:${formattedMinutes} ${period}`;
    } else if (format === "hh:mm:ss") {
        return `${hours.toString().padStart(2, '0')}:${formattedMinutes}:${formattedSeconds}`;
    } else {
        throw new Error("Unsupported format");
    }
}

export const formatDate = (date, format) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  const padZero = (num) => num.toString().padStart(2, "0");

    switch (format) {
        case "yyyy-mm-dd":
            return `${year}-${padZero(month + 1)}-${padZero(day)}`;
        case "yyyy/mm/dd":
            return `${year}/${padZero(month + 1)}/${padZero(day)}`;
        case "yyyy-month-dd":
            return `${year}-${months[month]}-${padZero(day)}`;
        case "dd-month-yyyy":
            return `${padZero(day)}-${months[month]}-${year}`;
        case "dd-mm-yyyy":
            return `${padZero(day)}-${padZero(month + 1)}-${year}`
        case "yyyy-dd-mm":
            return `${year}-${padZero(day)}-${padZero(month + 1)}`
        case "d month yyyy":
            return `${day} ${months[month]} ${year}`;
        case "yyyy-d-m":
            return `${day}-${month + 1}-${year}`;
        case "dd short-month year":
            return `${day} ${months[month].slice(0, 3)} ${year}`;
        default:
            return `${day} ${months[month]} ${year}`;
    }
}


export function dateFormatter(date, monthType) {
  if (date === undefined) return;
  date = new Date(date);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: monthType,
    year: "numeric",
  });
}

export function convertTo12HourFormatWithSeconds(railwayTime) {
    if(railwayTime === undefined || railwayTime === null || railwayTime === "") return "";
    let [hours, minutes, seconds] = railwayTime.split(":").map(Number);

    let period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export const checkNullUndefined = (value) => {
  if (value === undefined) return false;
  return value !== null;
};

export const shadowStyling = StyleSheet.create({
  elevation: 4, // Shadow strength
  backgroundColor: "#fff", // Background color
  shadowColor: "#000", // Shadow color
  shadowOffset: { width: 0, height: 10 }, // Offset for bottom shadow
  shadowOpacity: 0.1, // Opacity (optional for cross-platform)
  shadowRadius: 3.84, // Blur radius (optional for cross-platform)
  borderBottomWidth: 0.5, // Helps define a stronger bottom line
  borderColor: "rgba(0,0,0,0.1)", // Subtle color to simulate the bottom shadow
  position: 'relative',
  zIndex: 978,
});

export const shadowStylingTop = StyleSheet.create({
    backgroundColor: '#fff',    // Background color
    shadowColor: '#000',        // Shadow color
    shadowOffset: {width: 0, height: -10}, // Move shadow to the top (negative height)
    shadowOpacity: 0.1,         // Shadow opacity
    shadowRadius: 3.84,         // Shadow blur radius
    borderColor: 'rgba(0,0,0,0.1)',  // Subtle color to simulate the shadow effect
});



export const formatDateWithAddedMonths = (monthsToAdd) => {
  let currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + parseInt(monthsToAdd));
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentDate);
  return formattedDate;
};

export const showToast = (toastOptions) => {
    Toast.show({
        type: toastOptions.type,
        text1: toastOptions.text1,
        text2: toastOptions.text2,
        text1Style: {fontSize: 15},
        text2Style: {fontSize: 12}
    });
}

export const formatNumber = (number) => {
  return number % 1 === 0 ? number.toFixed(0) : number.toFixed(2);
};

export function convertToTitleCase(str) {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const formatDateDDMMYYYY = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateYYYYMMDD = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getFirstDateOfCurrentMonth = () =>
  formatDateYYYYMMDD(1 - new Date().getDate());
export const getLastDateOfCurrentMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Get the last day of the current month
  return lastDay.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
export const formatDateYYYYMMDDD = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensures two digits for month
  const day = String(date.getDate()).padStart(2, "0"); // Ensures two digits for day
  return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
};
export const getFirstDateOfCurrentMonthYYYYMMDD = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1); // Get the first day of the current month
  return formatDateYYYYMMDDD(firstDay);
};

export const getLastDateOfCurrentMonthYYYYMMMDD = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Get the last day of the current month
  return formatDateYYYYMMDDD(lastDay);
};

export function getFirstAndLastDateOfCurrentMonthDDMMYYYY() {
  const today = new Date();

  // Get the first day of the current month
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  // Get the last day of the current month
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Format the date to "DD MMM YYYY"
  const options = { day: "2-digit", month: "short", year: "numeric" };
  const firstDateFormatted = firstDay.toLocaleDateString("en-GB", options);
  const lastDateFormatted = lastDay.toLocaleDateString("en-GB", options);

  return {
    firstDateDDMMYYYY: firstDateFormatted,
    lastDateDDMMYYYY: lastDateFormatted,
  };
}

export const checkAPIError = (response) => {
    if (response.data.status_code > 399) {
        throw response;
    }
}
export function convertAppliedFilters(fromDate, toDate, selectedOptions) {
    return {
        fromDate: (fromDate !== null && fromDate !== "") ? formatDate(fromDate, "yyyy-mm-dd").toString() : "",
        toDate: (toDate !== null && toDate !== "") ? formatDate(toDate, "yyyy-mm-dd").toString() : "",
        filter1: selectedOptions.includes("Male client") ? "male" : undefined,
        filter2: selectedOptions.includes("Female client") ? "female" : undefined,
        filter3: selectedOptions.includes("Membership") ? "membership" : undefined,
        filter4: selectedOptions.includes("Non-Membership") ? "non-membership" : undefined,
        filter5: selectedOptions.includes("New client") ? "new client" : undefined,
    }
}

export function convertDate(dateStr) {
    const monthMap = {
        January: "Jan", February: "Feb", March: "Mar", April: "Apr",
        May: "May", June: "Jun", July: "Jul", August: "Aug",
        September: "Sep", October: "Oct", November: "Nov", December: "Dec"
    };

    const [day, monthYear] = dateStr.split(" ");
    const month = monthYear.slice(0, -5); // Remove ",YYYY" part from monthYear
    const year = monthYear.slice(-4);     // Get the year from monthYear

    return `${day} ${monthMap[month]} ${year}`;
}

export const formatDateToWeekDayDDMMMYYYY = (offset) => {
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const date = new Date();
    date.setDate(date.getDate() + offset);

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayOfWeek}, ${day} ${month} ${year}`;
};

