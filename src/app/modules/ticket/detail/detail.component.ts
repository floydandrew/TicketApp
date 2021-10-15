import { Overlay } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketListComponent } from '../list/list.component';
import { TicketService } from '../ticket.service';
import { Ticket } from '../types/ticket';
import { User } from '../types/user';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy {

  ticket: Ticket;
  tickets: Ticket[];
  nextId: number;
  stats: [];

  users: User[];
  ticketForm: FormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _renderer2: Renderer2,
    private _router: Router,
    private _ticketListComponent: TicketListComponent,
    private _ticketService: TicketService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit() {
    // Open the drawer
    let ticketId = this._activatedRoute.snapshot.params.id;
    this.nextId = parseInt(this._ticketService.newId);
    this._ticketListComponent.matDrawer.open();

    // Create the ticket form
    this.ticketForm = this._formBuilder.group({
      index    : [''],
      userId   : [''],
      id       : [''],
      title    : [''],  
      completed: [false],
  });

  
  if(ticketId == this.nextId)
  {
    this._ticketService.newTicket();
  }

  //Get users list
  this._ticketService.onUsersChanged
  .pipe(takeUntil(this._unsubscribeAll))
  .subscribe((users: User[]) => {
    this.users = users;
  });

  // Get tickets list
  this._ticketService.onTicketsChanged
  .pipe(takeUntil(this._unsubscribeAll))
  .subscribe((tickets: Ticket[]) => {
    this.tickets = tickets;
  });

  // Get stats
  this._ticketService.onStatsChanged
  .pipe(takeUntil(this._unsubscribeAll))
  .subscribe((stats: []) => {
     this.stats = stats;
  });

  // Get the ticket
  this._ticketService.onTicketChanged
  .pipe(takeUntil(this._unsubscribeAll))
  .subscribe((ticket: Ticket) => {
     this._ticketListComponent.matDrawer.open();
     this.ticket = ticket;
     this.ticketForm.patchValue(ticket, {emitEvent: false});
  });
  }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        this.closeDrawer();
    }

// -----------------------------------------------------------------------------------------------------
// @ Public methods
// -----------------------------------------------------------------------------------------------------

/**
* Close the drawer
*/
closeDrawer(): Promise<MatDrawerToggleResult>
{
    return this._ticketListComponent.matDrawer.close();
}

/**
 * Update the ticket
 */
updateTicket(): void
{
    // Get the contact object
    this.ticket = Object.assign({}, this.ticketForm.value);
    let newId = this._ticketService.newId;
    // Update the contact on the server
    if(this.ticket.id == this.nextId)
    {
        this.tickets.push(this.ticket);
        this.nextId += 1;
        this._ticketService.updateAll(this.tickets, this.nextId, this.stats);
        this._ticketService.getTickets();
        // this._ticketService.newId((newId + 1);
    }
    else 
    {
        this.tickets.splice(this.ticket.index,1, this.ticket);
        this._ticketService.updateAll(this.tickets, this.nextId, this.stats);
        this._ticketService.getTickets();

    }
}


toggleCompleted() {

}
   
    /**
     * Delete the ticket
     */
     deleteTicket(): void
     {
         // Open the confirmation dialog
         const confirmation = this._fuseConfirmationService.open({
             title  : 'Delete ticket',
             message: 'Are you sure you want to delete this ticket? This action cannot be undone!',
             actions: {
                 confirm: {
                     label: 'Delete'
                 }
             }
         });
 
         // Subscribe to the confirmation dialog closed action
         confirmation.afterClosed().subscribe((result) => {
 
             // If the confirm button pressed...
             if ( result === 'confirmed' )
             {
                 // Get the current contact's id
                 this.tickets.splice(this.ticket.index,1);
                 this._ticketService.updateAll(this.tickets, this.nextId, this.stats);
                 this.closeDrawer();
 
    
             }
         });
 
     }

}
