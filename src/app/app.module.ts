import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { NgxHmDndModule } from './ngx-hm-dnd/ngx-hm-dnd.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxHmDndModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
