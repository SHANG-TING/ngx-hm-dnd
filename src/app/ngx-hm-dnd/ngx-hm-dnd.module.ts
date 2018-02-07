import 'hammerjs';

import { NgModule } from '@angular/core';
import { NgxHmDndDirective } from './ngx-hm-dnd.directive';
import { NgxHmDndService } from './ngx-hm-dnd.service';

@NgModule({
  declarations: [NgxHmDndDirective],
  exports: [NgxHmDndDirective],
  providers: [NgxHmDndService]
})
export class NgxHmDndModule { }
