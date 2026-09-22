import { format } from "date-fns";

export const todayDate = (date = new Date()) => format(date, "yyyy-MM-dd");

