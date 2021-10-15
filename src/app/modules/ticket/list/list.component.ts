import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { TicketService } from '../ticket.service';
import { Ticket } from '../types/ticket';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class TicketListComponent implements OnInit, OnDestroy {

  @ViewChild('matDrawer', {static: true}) matDrawer: MatDrawer;
  tickets: Ticket[];

  ticketsCount: number = 0;
  // contractorTableColumns: string[] = ['name'];
  drawerMode: 'side' | 'over';
  searchInputControl: FormControl = new FormControl();
  selectedTicket: Ticket;

  private _unsubscribe: Subject<any>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _ticketService: TicketService,
    private _router: Router,
    private _fuseMediaWatcherService: FuseMediaWatcherService
  ) { this._unsubscribe = new Subject(); }

  ngOnInit() {
    this._ticketService.getUsers();
    this._ticketService.getTickets();
    // this._ticketService.getUsers();

    this._ticketService.onTicketsChanged
    .pipe(takeUntil(this._unsubscribe))
    .subscribe(result => {
      this.tickets = result;
      this.ticketsCount = result.length;
    });



    // Subscribe to search input field value changes
    this.searchInputControl.valueChanges
    .pipe(
        takeUntil(this._unsubscribe),
        switchMap(query =>

            // Search
            this._ticketService.searchContacts(query)
        )
    )
    .subscribe();

    // Subscribe to MatDrawer opened change
    this.matDrawer.openedChange.subscribe((opened) => {
      if ( !opened )
      {
          // Remove the selected contact when drawer closed
          this.selectedTicket = null;
      }
    });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
    .pipe(takeUntil(this._unsubscribe))
    .subscribe(({matchingAliases}) => {

        // Set the drawerMode if the given breakpoint is active
        if ( matchingAliases.includes('lg') )
        {
            this.drawerMode = 'side';
        }
        else
        {
            this.drawerMode = 'over';
        }

    });
  }

  ngOnDestroy(): void {
    this._unsubscribe.next();
    this._unsubscribe.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * On backdrop clicked
   */
  onBackdropClicked(): void
  {
      // Go back to the list
      this._router.navigate(['./'], {relativeTo: this._activatedRoute});
  }

    /**
   * Create ticket
   */
  createTicket(): void
  {
      // Create ticket
      // Open form for new ticket entry
        let newId = this._ticketService.newId;
        console.log("What happens here exactly");
        this._router.navigate(['./', newId], {relativeTo: this._activatedRoute});

  }

  /**
   * Create ticket
   */
   selectTicket(index: number, ticket: Ticket): void
   {
      // Select ticket
      // Open to edit ticket entry
      ticket.index = index;

      this._ticketService.setTicket(ticket);
      this._router.navigate(['./', ticket.id], {relativeTo: this._activatedRoute});
 
   }

  /**
     * Toggle the completed status
     * of the given ticket
     *
     * @param task
     */
   toggleCompleted(ticket: Ticket): void
   {
       // Toggle the completed status
       ticket.completed = !ticket.completed;

       // Update the task on the server
       this._ticketService.update(this.tickets);

   }


}
