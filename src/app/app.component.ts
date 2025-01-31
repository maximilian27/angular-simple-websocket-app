import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { catchError, of, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [ReactiveFormsModule],
})
export class AppComponent implements OnInit {
  private subject: WebSocketSubject<any> | undefined;

  public messages: any[] = [];

  private paginationParamsSubject = new Subject<PaginationParams>();

  protected userId = uuidv4();

  protected messageForm = new FormGroup({
    message: new FormControl('', { nonNullable: true, validators: [] }),
  });

  private platformId = inject(PLATFORM_ID);

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.subject = new WebSocketSubject({ url: 'ws://localhost:8080/comments' });

      this.subject.pipe(catchError((error) => of(error))).subscribe((response: any) => {
        console.log('Message received:', response);
        this.messages = response.allMessages;
      });
    }

    // Send pagination params on initial connection
    // this.paginationParamsSubject.next({ pageNumber: 1, pageSize: 10 });
    //
    // // Send pagination params on changes
    // this.paginationParamsSubject.subscribe((params: PaginationParams) => {
    //   this.subject!.next({
    //     type: 'pagination',
    //     payload: params
    //   });
    // });
  }

  protected sendMessage(formValue: any) {
    this.subject!.next({ userId: this.userId, text: formValue.message });
  }

  // Example of how to change pagination params
  changePagination(pageNumber: number, pageSize: number) {
    this.paginationParamsSubject.next({ pageNumber, pageSize });
  }
}
