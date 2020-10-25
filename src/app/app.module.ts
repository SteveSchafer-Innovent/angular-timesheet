import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ListUserComponent } from './user/list-user/list-user.component';
import { LoginComponent } from './login/login.component';
import { AddUserComponent } from './user/add-user/add-user.component';
import { EditUserComponent } from './user/edit-user/edit-user.component';
import { routing } from "./app.routing";
import { ApiService } from "./service/api.service";
import { TokenInterceptor} from "./core/interceptor";
import { ListEventComponent } from './event/list-event/list-event.component';
import { EditEventComponent } from './event/edit-event/edit-event.component';
import { DurationPipe } from './duration.pipe';
import { ProjectsPipe } from './projects.pipe';
import { ListProjectComponent } from './project/list-project/list-project.component';
import { EditProjectComponent } from './project/edit-project/edit-project.component';
import { WeekReportComponent } from './report/week/week-report.component';

@NgModule({
  declarations: [
    AppComponent,
    ListUserComponent,
    LoginComponent,
    AddUserComponent,
    EditUserComponent,
    ListEventComponent,
    EditEventComponent,
    DurationPipe,
    ProjectsPipe,
    ListProjectComponent,
    EditProjectComponent,
    WeekReportComponent
  ],
  imports: [
    BrowserModule,
    routing,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule
  ],
  providers: [
    ApiService, {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi : true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
