import { User } from "app/core/user/user.types";

export interface Ticket {
    userId: number;
    id: number;
    title: string;
    completed : boolean;
    user?: User;
    index: number;
}