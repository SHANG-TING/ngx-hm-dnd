import { Directive, Input, OnInit, AfterViewInit, ElementRef, HostListener, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';
import { NgxHmDndService } from './ngx-hm-dnd.service';
import { elementsFromPoint, insertAfter } from './ts/element';

enum MOVE_TYPE {
  UP = 'up',
  DOWN = 'down'
}

@Directive({
  selector: '[ngxHmDnd]'
})
export class NgxHmDndDirective implements OnInit, AfterViewInit {
  @Input() public ngxHmDnd: string;
  @Input() public sourceData: any[];
  @Input() public selectedNodeClass: string;
  @Input() public movingNodeClass: string;
  private container: HTMLElement;
  private selectedNode: HTMLElement;
  private movingNode: HTMLElement;
  private selectedIndex: number;
  private nowIndex: number;
  private priAction: MOVE_TYPE;

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
      directive: this
    });

    Array.from(this.getElms(this.container))
      .forEach((el: HTMLElement, index: number) => {
        this.bindingHammer(el);
      });
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

      this.movingNode.style.transform = `translate(${event.deltaX}px, ${event.deltaY}px`;

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
        if (this.nowIndex !== -1) {
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

      if (this.selectedIndex > -1) {
        if (event.target.parentElement === this.container) {
          const tmp = this.sourceData[this.selectedIndex];
          const newIndex = this.getIndex(this.getElms(this.container), event.target);
          this.sourceData.splice(this.selectedIndex, 1);
          this.sourceData.splice(newIndex, 0, tmp);

          // this.sortComplete.emit(this.sourceObj);
        } else {
          const currentArea = this.service.get(event, this.ngxHmDnd);

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

      // when move complete clear all unuse variable
      this.selectedNode = undefined;
      this.movingNode = undefined;
      this.selectedIndex = undefined;
      this.nowIndex = undefined;
      this.priAction = undefined;
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
