import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Ticket } from './types/ticket';
import { User } from './types/user';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
baseUrl = environment.apiUrl;

ticket: Ticket;
users: User[];


onTicketsChanged: BehaviorSubject<any>;
onTicketChanged: BehaviorSubject<any>;
onUsersChanged: BehaviorSubject<any>;
onNewIdChanged: BehaviorSubject<any>;
onStatsChanged: BehaviorSubject<any>;

constructor(private _httpClient: HttpClient) { 
  this.onTicketsChanged = new BehaviorSubject({});
  this.onTicketChanged = new BehaviorSubject({});
  this.onUsersChanged = new BehaviorSubject({});
  this.onNewIdChanged = new BehaviorSubject({});
  this.onStatsChanged = new BehaviorSubject({});
}


getTickets() {
  if(this.storedTickets.length == 0) 
  {
    this._httpClient.get<Ticket[]>(this.baseUrl + 'todos')
    .subscribe((result: Ticket[]) => {
      const randomTen = this.randomTen(result); 
      this.updateAll(randomTen, result.length + 1, ['2', '3', '5']); })
  } 
  else
  {
    this.updateAll(this.storedTickets, parseInt(this.newId), this.stats);
  }

}

getUsers() {
  this._httpClient.get<User[]>(this.baseUrl + 'users')
  .subscribe((result: any) => {
    this.users = result;
    this.onUsersChanged.next(result);
  })
}


setTicket(ticket: Ticket) {
  this.onTicketChanged.next(ticket);
  console.log('Index in set ticket' + ticket.index)
}


/**
     * Search contacts with given query
     *
     * @param query
     */

// I have to change this code to just filter the list
 searchContacts(query: string): Observable<Ticket[]>
 {

  let params = new HttpParams();
        params = params.append('name', query);
        
    return this._httpClient.get<Ticket[]>(this.baseUrl, {params})
    .pipe(
        tap((contractors) => {
            this.onTicketsChanged.next(contractors);
        })
    );
 }

 newTicket() {
   this.ticket = {
     id: parseInt(this.newId),
     userId: 0,
     title: '',
     completed: false,
     index: 0,
   }

   console.log(this.ticket);
   this.onTicketChanged.next(this.ticket);
 }



 update(tickets: Ticket[]) {
   this.onTicketsChanged.next(tickets);
   localStorage.removeItem('tickets');
   this.storedTickets = tickets;
 }
 

//  Helper methods

 shuffle(array) {
   let currentIndex = array.length, randomIndex;
   
   while(currentIndex != 0) {
     randomIndex = Math.floor(Math.random() * currentIndex)
     currentIndex--;

     [array[currentIndex], array[randomIndex]] = 
     [array[randomIndex], array[currentIndex]]
   }

   return array;
 }

 randomTen(tickets: Ticket[]) : Ticket[]
 {
    return this.shuffle(tickets).slice(0,10).map(
    (t) => {
      return {...t,user: this.users.find((u)=> u.id === t.userId)}
    }
  );
 }

 updateAll(tickets: Ticket[], id: number, stats: any) {
    this.onTicketsChanged.next(tickets);
    this.onNewIdChanged.next(id);
    this.onStatsChanged.next(stats);

    if(this.storedTickets.length == 0) {
      this.updateStorage(tickets, id, stats);
      // this.storedTickets = tickets;
      // this.newId = id.toString();
      // this.stats = stats;
    }  
    else 
    {
      localStorage.removeItem('tickets');
      localStorage.removeItem('stats')
      localStorage.removeItem('nextId');
      this.updateStorage(tickets, id, stats);
    }
 }

 updateStorage(tickets, id, stats)
 {
  this.storedTickets = tickets;
  this.newId = id.toString();
  this.stats = stats;
 }

 /**
     * Setter & getter for access localStorage
     */
  set storedTickets(tickets: Ticket[])
  {
      localStorage.setItem('tickets', JSON.stringify(tickets));
  }
 
  get storedTickets(): Ticket[]
  {
      if(localStorage.getItem('tickets')){
        return JSON.parse(localStorage.getItem('tickets'))
      }
      return []
  }
 
  set newId(id)
  {
    localStorage.setItem('nextId', id);
  }
 
  get newId()
  {
    return localStorage.getItem('nextId');
  }
 
  set stats(stats)
  {
    localStorage.setItem('stats', JSON.stringify(stats));
  }
 
  get stats()
  {
    if(localStorage.getItem('stats')) {
      return JSON.parse(localStorage.getItem('stats'))
    }
    return []
  }

}
