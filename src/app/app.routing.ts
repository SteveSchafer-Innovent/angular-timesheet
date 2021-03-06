import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { LoginComponent } from "./login/login.component";
import { AddUserComponent } from "./user/add-user/add-user.component";
import { ListUserComponent } from "./user/list-user/list-user.component";
import { EditUserComponent } from "./user/edit-user/edit-user.component";
import { ListEventComponent } from "./event/list-event/list-event.component";
import { EditEventComponent } from "./event/edit-event/edit-event.component";
import { ListProjectComponent } from "./project/list-project/list-project.component";
import { EditProjectComponent } from "./project/edit-project/edit-project.component";
import { WeekReportComponent } from "./report/week/week-report.component";
import { UploadFileComponent } from "./upload-file/upload-file.component";
import { TaskComponent } from "./report/netsuite-task/task.component";

const routes: Routes = [
  { path: 'add-user', component: AddUserComponent },
  { path: 'list-user', component: ListUserComponent },
  { path: 'edit-user', component: EditUserComponent },
  { path: 'list-event', component: ListEventComponent },
  { path: 'edit-event', component: EditEventComponent },
  { path: 'list-project', component: ListProjectComponent },
  { path: 'edit-project', component: EditProjectComponent },
  { path: 'report-week', component: WeekReportComponent },
  { path: 'login', component: LoginComponent },
  { path: 'upload-file', component: UploadFileComponent },
  { path: 'report-netsuite-task', component: TaskComponent },
  { path : '', component : environment.username == null ? LoginComponent : ListEventComponent }
];

export const routing = RouterModule.forRoot(routes);