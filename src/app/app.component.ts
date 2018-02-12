import { Component } from '@angular/core';
import { IComplete } from './ngx-hm-dnd/ts/model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
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
