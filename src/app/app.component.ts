import { Component } from '@angular/core';

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
    this._selectedIndex = val;
    this.display = false;
    setTimeout(() => {
      this.display = true;
    }, 0);
  }
  display = true;
  bookCategory = [
    {
      name: 'Book Category 1',
      books: [
        { name: 'Book 1', path: 'https://cdn.scotch.io/scotchy-uploads/2015/12/ng-forward-logo.png' },
        { name: 'Book 2', path: 'http://www.tutorialsavvy.com/wp-content/uploads/2013/08/AngularJS-830-830-300x300.png' },
        { name: 'Book 3', path: 'https://angularair.com/logo.png' },
        { name: 'Book 4', path: 'https://mdbootstrap.com/wp-content/themes/mdbootstrap4/content/angular/tutorials/main/img/3.png' },
        { name: 'Book 5', path: 'https://www.infopulse.com/files/images/Angular-20170712-300x300.png' },
        { name: 'Book 6', path: 'https://resources.cloud.genuitec.com/wp-content/uploads/2018/01/authenticationangular-blog.png' },
      ]
    },
    {
      name: 'Book Category 2',
      books: [
        { name: 'Book 7', path: 'http://peterkellner.net/misc/angularsticker_300x300.png' },
        { name: 'Book 8', path: 'https://frontendmasters.com/assets/angular-app-dev-300x300.png' },
      ]
    },
    {
      name: 'Book Category 3',
      books: [
        { name: 'Book 9', path: 'https://www.infopulse.com/files/images/angular-2-sharepoint-integration-round.png' },
        { name: 'Book 10', path: 'https://www.mobileacademy.ro/wp-content/uploads/2018/01/ionic-angular-300.jpg' }
      ]
    }
  ];
}
