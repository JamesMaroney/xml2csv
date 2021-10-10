import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';

import { appReducer } from './app.reducer';
import { EffectsModule } from '@ngrx/effects';
import {AppEffects} from "./app.effects";
import {GetValuePipe} from "./app.pipes";
import {ItemTemplateDirective, SelectorComponent} from './selector/selector.component';
import {CommonModule} from "@angular/common";

@NgModule({
  declarations: [
    AppComponent,
    GetValuePipe,
    SelectorComponent,
    ItemTemplateDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    StoreModule.forRoot({app: appReducer}, {}),
    EffectsModule.forRoot([AppEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
