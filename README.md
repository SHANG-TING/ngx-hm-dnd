# NgxHmDnd/BookCateogry

[See ngx-hm-dnd in action!](https://shang-ting.github.io/ngx-hm-dnd/)

<img src="https://i.imgur.com/U39508Y.gif" width="686">


## Installation
------------

install package

```bash
npm install --save ngx-hm-dnd
```

## Usage
-----

import module:

```ts
import { NgxHmDndModule } from 'ngx-hm-dnd';

@NgModule({
  imports: [...something..., NgxHmDndModule],
  ...
})
export class YourModule {}
```

## Examples
--------

app.component.html

```html
<nav id="nav">
  <ul [ngxHmDnd]="'group-1'" [sourceData]="bookCategory" [enable]="false">
    <li *ngFor="let category of bookCategory; let i = index;"
      [ngClass]="{'selected': selectedIndex === i}"
      (click)="selectedIndex = i">
      <a>{{ category.name }}</a>
    </li>
  </ul>
</nav>

<div *ngIf="bookCategory[selectedIndex].books.length > 0" style="padding-top: 90px;">
    <div *ngIf="display" class="image-wrapper"
      [ngxHmDnd]="'group-1'" [sourceData]="bookCategory[selectedIndex].books" (complete)="complete($event)">
      <div class="image-item insta-page"
        *ngFor="let book of bookCategory[selectedIndex].books; let i = index;"
        [attr.sortEnable]="!book.checked"
        [ngClass]="{'selected': book.checked}"
        (click)="book.checked = !book.checked" >
         <a class="image insta-image">
           <img alt="image" [src]="book.path" />
          </a>
       </div>
    </div>
  {{ bookCategory[selectedIndex].books | json }}
</div>
```

app.component.ts

```ts
import { Component } from '@angular/core';
import { IComplete } from 'ngx-hm-dnd';

export class AppComponent {
  private _selectedIndex = 0;
  get selectedIndex(): number {
    return this._selectedIndex;
  }
  set selectedIndex(val: number) {
    if (this._selectedIndex !== val) {
      this._selectedIndex = val;
      this.display = false;
      setTimeout(() => {
        this.display = true;
      }, 0);
    }
  }
  display = true;
  bookCategory = [
    {
      name: 'Book Category 1',
      books: [
        { name: 'Book 1', checked: false, path: 'https://cdn.scotch.io/scotchy-uploads/2015/12/ng-forward-logo.png' },
        { name: 'Book 2', checked: false, path: 'https://www.primefaces.org/wp-content/uploads/2016/10/primeng.png' },
        { name: 'Book 3', checked: false, path: 'https://angularair.com/logo.png' },
        {
          name: 'Book 4', checked: false,
          path: 'https://mdbootstrap.com/wp-content/themes/mdbootstrap4/content/angular/tutorials/main/img/3.png'
        },
        { name: 'Book 5', checked: false, path: 'https://www.infopulse.com/files/images/Angular-20170712-300x300.png' },
        {
          name: 'Book 6', checked: false,
          path: 'https://resources.cloud.genuitec.com/wp-content/uploads/2018/01/authenticationangular-blog.png'
        },
      ]
    },
    {
      name: 'Book Category 2',
      books: [
        { name: 'Book 7', checked: false, path: 'https://cdn-images-1.medium.com/max/1600/0*1rMayMgSu9dxFXuU.png' },
        { name: 'Book 8', checked: false, path: 'https://frontendmasters.com/assets/angular-app-dev-300x300.png' },
      ]
    },
    {
      name: 'Book Category 3',
      books: [
        { name: 'Book 9', checked: false, path: 'https://www.infopulse.com/files/images/angular-2-sharepoint-integration-round.png' },
        { name: 'Book 10', checked: false, path: 'https://www.mobileacademy.ro/wp-content/uploads/2018/01/ionic-angular-300.jpg' }
      ]
    }
  ];

  complete($event: IComplete) {
    const temp = $event.from.data[$event.from.selectedIndex];
    if (temp.checked) {
      const checkedBooks = $event.from.data.filter(x => x.checked);
      checkedBooks.forEach(checkedBook => {
        $event.from.data.splice($event.from.data.indexOf(checkedBook), 1);
        checkedBook.checked = false;
        $event.to.data[$event.to.selectedIndex].books.push(checkedBook);
      });
    } else {
      $event.from.data.splice($event.from.selectedIndex, 1);
      $event.to.data[$event.to.selectedIndex].books.push(temp);
    }
    this.selectedIndex = $event.to.selectedIndex;
  }
}

```

app.component.scss

```scss
$insta-wrapper-max-width: 965px;
$insta-wrapper-min-height: 100px;
$height: 100%;
$width: 100%;
$transition: all .17s cubic-bezier(.4, 0, 1, 1);

.image-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-flow: row wrap;
  flex-grow: 1;
  justify-content: space-around;
  margin: 0 auto 30px;
  max-width: $insta-wrapper-max-width;
  min-height: $insta-wrapper-min-height;
  position: relative;
  width: $width;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

@for $i from 1 through 10 {
  .image-item {
    // 動畫效果
    animation: slide-item .3s ease forwards;
    // transform: translateY(250px);
    // visibility: hidden;

    box-sizing: border-box;
    flex: 1 0 33%;
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
    width: $width;

    // 改善畫面選取效能
    touch-action: none;
    user-select: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    &:nth-child(#{$i}) {
      animation-delay: (#{$i * .1s});
    }
  }

  .insta-page {
    padding: 10px;
  }
  .selected {
    background-color: yellow;
  }
}

.image {
  display: block;
  position: relative;
  transition: $transition;
  width: $width;
  // 防止圖片被抓起來
  pointer-events: none;

  img {
    display: block;
    max-width: $width;
  }
}

@keyframes slide-item {
  60% {
    transform: translateY(-10px);
  }

  100% {
    // opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }
}

@keyframes fadeIn {

  0% {
    transform: translateX(-150px);
  }

  100% {
    transform: translateX(0);
  }
}


nav {
  position: fixed;
  width: 100%;
  top: 0;
  background: #dd1d8d;
  -webkit-transition: all 650ms cubic-bezier(0.22, 1, 0.25, 1);
  transition: all 650ms cubic-bezier(0.22, 1, 0.25, 1);
  z-index: 3;
  &before {
    content: "";
    display: block;
    position: absolute;
    background: rgba(0, 0, 0, 0.27);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  ul {
    position: relative;
    margin: 0;
    z-index: 2;
    text-transform: uppercase;
    text-align: center;
    li {
      display: inline-block;
      padding: 1.35em 0;
      margin-right: 3em;
      font-size: 0.9em;

      // 改善畫面選取效能
      touch-action: none;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
      a {
        margin: 0 25px;
        text-decoration: none;
        color: #fff;
        font-size: 0.9em;
        // 防止文字被選取
        pointer-events: none;
      }
    }
    li.selected {
      background-color: #b61c1c;
      opacity: 0.7;
    }
  }
}

```

[View more examples](https://SHANG-TING.github.io/ngx-hm-dnd)


## Configuration (Input)
-------------

| Argument          | Required | Default value | Type      | Location          | Description                     |
| ----------------- | -------- | ------------- | --------- | ----------------- | ------------------------------- |
| `ngx-hm-dnd`      | no       | none          | string    | container         | 可以定義群組名稱來限制可排序的區域 |
| `source-data`     | no       | []            | any[]     | container         | 需要雙向綁定的資料                |
| `enable`          | no       | true          | boolean   | container         | 此區域是否啟動排序功能            |
| `attr.sortEnable` | no       | true          | boolean   | container-items   | 此項目是否啟動排序功能            |

## Methods (Output)
-------

| Method     | Location  | Description |
| ---------- | --------- | ----------- |
| `complete` | container | 取得目前被移動的element、雙向綁定的資料，以及移動至目標的element、雙向綁定的資料 |


Collaborators
-------------

| [![](https://avatars2.githubusercontent.com/u/12579766?s=80&v=4)](https://github.com/SHANG-TING) |  
|-|
| [@SHANG-TING](https://github.com/SHANG-TING) |


Related projects
----------------

- [SHANG-TING/ngx-hm-dnd/tree/bookCategory](https://github.com/SHANG-TING/ngx-hm-dnd/tree/bookCategory) - Angular 5+ Hammerjs Application
