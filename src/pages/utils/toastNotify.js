import { toast } from "react-toastify";

export const notifyUserEnterToRoom = (user) =>
  toast.info(`В комнату зашел ${user}`);
export const notifyUserLeaveFromRoom = (message) => toast.info(message);
export const notifyEnterToRoom = (message) => toast.info(message);
export const notifyRoomIsFull = (message) => toast.error(message);
