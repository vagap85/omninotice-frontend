import { User } from "@/api/types";

export interface SelectedUsersContextType {
  selectedUsers: User[];
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  clearUsers: () => void;
}

export interface PushNotificationFormValues {
  title: string;
  text: string;
  buttonText: string;
}