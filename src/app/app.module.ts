import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InstanceComponent } from './instance/instance.component';
import { Endpoints } from './config';

@NgModule({
  declarations: [
    AppComponent,
    InstanceComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [Endpoints],
  bootstrap: [AppComponent]
})
export class AppModule { }
