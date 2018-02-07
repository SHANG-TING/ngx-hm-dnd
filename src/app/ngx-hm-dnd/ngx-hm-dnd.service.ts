import { Injectable } from '@angular/core';
import { NgxHmDndDirective } from './ngx-hm-dnd.directive';

interface NgxHmDndInfo {
  id?: number;
  container: HTMLElement;
  data: Array<any>;
  directive: NgxHmDndDirective;
}

@Injectable()
export class NgxHmDndService {

  private _infos: Array<NgxHmDndInfo> = [];

  constructor() { }

  getList(): Array<NgxHmDndInfo> {
    return this._infos;
  }

  get(event: HammerInput): NgxHmDndInfo {
    return this._infos.filter(x => {
      const rect = x.container.getBoundingClientRect();

      return rect.left < event.center.x && event.center.x < rect.right
        && rect.top < event.center.y && event.center.y < rect.bottom;
    })
      .shift();
  }

  add(info: NgxHmDndInfo): void {
    info.id = this._infos.length + 1;
    this._infos.push(info);
  }

}
