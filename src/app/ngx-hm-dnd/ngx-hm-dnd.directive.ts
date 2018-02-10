import { Directive, Input, Output, EventEmitter, OnInit, AfterViewInit, ElementRef, HostListener, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { NgxHmDndService, NgxHmDndInfo } from './ngx-hm-dnd.service';
import { elementsFromPoint, insertAfter } from './ts/element';

enum MOVE_TYPE {
  UP = 'up',
  DOWN = 'down'
}

export interface IComplete {
  from: ICompleteInfo;
  to?: ICompleteInfo;
}

export interface ICompleteInfo {
  data: any[];
  selectedIndex: number;
}

@Directive({
  selector: '[ngxHmDnd]'
})
export class NgxHmDndDirective implements OnInit, AfterViewInit {
  @Input() public ngxHmDnd: string;
  @Input() public sourceData: any[];
  @Input() public selectedNodeClass: string;
  @Input() public movingNodeClass: string;
  @Input() public enable = true;

  @Output() public complete = new EventEmitter();

  private container: HTMLElement;
  private selectedNode: HTMLElement;
  private movingNode: HTMLElement;
  private selectedIndex: number;
  private nowIndex: number;
  private priAction: MOVE_TYPE;
  private toArea: NgxHmDndInfo;
  private toIndex: number;

  public constructor(
    private el: ElementRef,
    private service: NgxHmDndService,
    private _renderer: Renderer2,
    @Inject(DOCUMENT) private document) {
    this.container = el.nativeElement;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.service.add({
      group: this.ngxHmDnd,
      container: this.container,
      data: this.sourceData,
      enable: this.enable,
      directive: this
    });

    if (this.enable) {
      Array.from(this.getElms(this.container))
      .forEach((el: HTMLElement, index: number) => {
        this.bindingHammer(el);
      });
    }

  }

  public bindingHammer(el: HTMLElement) {
    const hm = new Hammer(el);

    // let the pan gesture support all directions.
    // this will block the vertical scrolling on a touch-device while on the element
    hm.get('pan').set({ direction: Hammer.DIRECTION_ALL });

    hm.on('panstart', (event: HammerInput) => {
      event.preventDefault();

      this.selectedIndex = this.nowIndex = this.getIndex(this.getElms(this.container), event.target);
      // set choiceNode to this start tag
      this.selectedNode = event.target;
      // get distance from this tag's origin
      // set this elem style
      this._renderer.setStyle(this.selectedNode, 'pointerEvents', 'none');

      if (this.selectedIndex < 0) {
        hm.stop(true);
        return ;
      }

      // clone a new tag call sort_clone_obj and hidden it
      this.movingNode = this.createMovingTag(event.center,
        Math.abs(this.selectedNode.getBoundingClientRect().top - event.center.y));
      this.movingNode.style.width = `${this.selectedNode.offsetWidth}px`;

      if (this.selectedNodeClass) {
        this._renderer.addClass(this.selectedNode, this.selectedNodeClass);
      } else {
        this.selectedNode.style.borderColor = '#00ffcc';
        this.selectedNode.style.borderStyle = 'solid';
      }
    });

    hm.on('panmove', (event: HammerInput) => {
      event.preventDefault();

      // this.movingNode.style.transform = `translate(${event.center.x}px, ${event.center.y}px`;
      // console.log(this.movingNode.style.transform);
      this.movingNode.style.top = `${event.center.y - (event.target.offsetHeight / 2)}px`;
      this.movingNode.style.left = `${event.center.x - (event.target.offsetWidth / 2)}px`;
      // console.log('event.deltaY: ', event.deltaY, ', event.deltaX: ', event.deltaX);
      // console.log('event.center.y: ', event.center.y, ', event.center.x: ', event.center.x);
      // console.log('width: ', event.target.offsetWidth, ', height:', event.target.offsetHeight);
      const currentArea = this.service.get(event, this.ngxHmDnd);

      elementsFromPoint(this.document, event.center.x, event.center.y, (item: HTMLElement) => {
        // return this.container.contains(item);
        // 現在的元件的上層是任何一個container才回傳true
        if (currentArea) {
          const container = currentArea.container;

          if (container.contains(item)) {
            if (container === item) {
              return false;
            }
            return true;
          }
        }

        return false;
      }).then((getElm: HTMLElement) => {
        if (!currentArea.enable) {
          const elems = this.getElms(currentArea.container);
          this.toIndex = this.getIndex(elems, getElm);
          this.toArea = currentArea;

          elems.forEach((elm: HTMLElement) => {
            elm.style.borderColor = '';
            elm.style.borderStyle = '';
          });

          this.selectedNode.style.borderColor = '';
          this.selectedNode.style.borderStyle = '';

          getElm.style.borderColor = '#00ffcc';
          getElm.style.borderStyle = 'solid';

          return;
        }

        if (this.toArea) {
          const elms = this.getElms(this.toArea.container) as HTMLElement[];
          const elm = elms[this.toIndex];
          elm.style.borderColor = '';
          elm.style.borderStyle = '';

          this.selectedNode.style.borderColor = '#00ffcc';
          this.selectedNode.style.borderStyle = 'solid';
        }

        this.toArea = undefined;
        this.toIndex = undefined;

        let elmSortEnable = 'true';
        if (event.target.attributes['sortenable']) {
          elmSortEnable = event.target.attributes['sortenable'].value;
        }

        if (this.nowIndex !== -1 && elmSortEnable === 'true') {
          const toIndex = this.getIndex(this.getElms(currentArea.container), getElm);
          if (this.nowIndex !== toIndex) {
            if (this.nowIndex > toIndex) {
              this.insertBefore(getElm, currentArea.container);
            } else {
              this.insertAfter(getElm);
            }
          } else {
            switch (this.priAction) {
              case MOVE_TYPE.UP:
                this.insertAfter(getElm);
                break;
              case MOVE_TYPE.DOWN:
                this.insertBefore(getElm, currentArea.container);
                break;
            }
          }
          this.nowIndex = toIndex;
        }
      });

    });

    hm.on('panend', (event) => {
      if (this.selectedNodeClass) {
        this._renderer.removeClass(this.selectedNode, this.selectedNodeClass);
      } else {
        this.selectedNode.style.borderColor = '';
        this.selectedNode.style.borderStyle = '';
      }
      this._renderer.setStyle(this.selectedNode, 'pointerEvents', '');

      this._renderer.removeChild(this.movingNode.parentNode, this.movingNode);

      const currentArea = this.service.get(event, this.ngxHmDnd);

      if (this.selectedIndex > -1) {
        if (event.target.parentElement === this.container) {
          const tmp = this.sourceData[this.selectedIndex];
          const newIndex = this.getIndex(this.getElms(this.container), event.target);
          this.sourceData.splice(this.selectedIndex, 1);
          this.sourceData.splice(newIndex, 0, tmp);
        } else {
          if (currentArea) {
            const cloneData = this.sourceData[this.selectedIndex];
            let newIndex = 0;

            if (currentArea.data.length > 0) {
              newIndex = this.getIndex(this.getElms(currentArea.container), event.target);
            }

            currentArea.data.splice(newIndex, 0, cloneData);
            this.sourceData.splice(this.selectedIndex, 1);

            setTimeout(() => {
              const elm = this.getElms(currentArea.container)[newIndex] as HTMLElement;
              currentArea.directive.bindingHammer(elm);
            }, 0);
          }
        }
      }

      if (currentArea) {
        if (!currentArea.enable) {
          // console.log(this.toIndex);
          // console.log(this.toArea);

          const elms = this.getElms(this.toArea.container) as HTMLElement[];
          const elm = elms[this.toIndex];
          elm.style.borderColor = '';
          elm.style.borderStyle = '';

          // Output Emit
          this.complete.emit({
            from: {
              data: this.sourceData,
              selectedIndex: this.getIndex(this.getElms(this.container), event.target)
            } as ICompleteInfo,
            to: {
              data: this.toArea.data,
              selectedIndex: this.toIndex
            } as ICompleteInfo
          } as IComplete);
        }
      }

      // when move complete clear all unuse variable
      this.selectedNode = undefined;
      this.movingNode = undefined;
      this.selectedIndex = undefined;
      this.nowIndex = undefined;
      this.priAction = undefined;
      this.toIndex = undefined;
      this.toArea = undefined;
    });
    return hm;
  }

  private createMovingTag(position, disY) {
    const clnElm = this.selectedNode.cloneNode(true) as HTMLElement;
    clnElm.id = 'moving_clone_obj';

    clnElm.style.top = `${position.y - disY}px`;
    clnElm.style.position = 'fixed';
    clnElm.style.pointerEvents = 'none';
    clnElm.style.zIndex = '3';

    if (this.movingNodeClass) {
      this._renderer.addClass(clnElm, this.movingNodeClass);
    } else {
      clnElm.style.opacity = '0.5';
      clnElm.style.backgroundColor = 'lightpink';
    }

    this._renderer.appendChild(this.container, clnElm);
    // this.container.appendChild(clnElm);
    return clnElm;
  }

  private insertBefore(getElm: any, container?: any) {
    this.priAction = MOVE_TYPE.UP;

    if (container) {
      // try {
        container.insertBefore(this.selectedNode, getElm);
      // } catch (e) {
      //   console.log(e);
      // }
    } else {
      this.container.insertBefore(this.selectedNode, getElm);
    }

  }

  /**
   * 將已選取的 element 移動至 畫面上element的上方
   * @param getElm
   */
  private insertAfter(getElm: any) {
    this.priAction = MOVE_TYPE.DOWN;
    insertAfter(this._renderer, this.selectedNode, getElm);
  }

  /**
   * 取得下層的element
   * 排除註解、#moving_clone_obj
   * @param container
   */
  private getElms(container: HTMLElement) {
    const elems = Array.from(container.childNodes)
      .filter((x: HTMLElement) => x.tagName && x.id !== 'moving_clone_obj');
    return elems;
  }

  /**
   * 取得自己的element在父層所有element的index
   * @param elms
   * @param elm
   */
  private getIndex(elms, elm): number {
    let idx = -1;
    for (let i = 0; i < elms.length; i++) {
      if (elms[i] === elm) {
        idx = i;
      }
    }
    return idx;
  }
}
