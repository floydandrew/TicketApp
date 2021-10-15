import { User } from "./user";


export interface Ticket {
    userId: number;
    id: number;
    title: string;
    completed : boolean;
    user?: User;
    index: number;
}