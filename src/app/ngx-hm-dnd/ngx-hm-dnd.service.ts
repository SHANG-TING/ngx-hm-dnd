import { Injectable } from '@angular/core';
import { NgxHmDndDirective } from './ngx-hm-dnd.directive';

export interface NgxHmDndInfo {
  id?: number;
  group: string;
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

  get(event: HammerInput, group: string): NgxHmDndInfo {
    const areas = this._infos.filter(x => {
      if (x.group !== group) {
        return false;
      }

      const rect = x.container.getBoundingClientRect();

      return rect.left < event.center.x && event.center.x < rect.right
        && rect.top < event.center.y && event.center.y < rect.bottom;
    });

    // 主要是使用在有樹狀的情況下
    if (areas.length > 1) {
      return areas.map(x => {
        const rect = x.container.getBoundingClientRect();
        return { size: rect.width * rect.height, area: x };
      }).sort((a, b) => {
        return b.size - a.size;
      }).pop().area;
    }

    return areas.shift();
  }

  add(info: NgxHmDndInfo) {
    info.id = this._infos.length + 1;
    this._infos.push(info);
  }

}
