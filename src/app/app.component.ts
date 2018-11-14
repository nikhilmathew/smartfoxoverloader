import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  uname = 'nik';//'loadtester'+ Math.round(Math.random()*100);
  users=[]
  counter=0;
  constructor(){
    for(var i=1;i<100;i++){
      this.users.push(i)
      this.counter++;
    }
  }
  executed(user){
    console.error(user)
    this.users.splice(user-1,1)
    this.users.push(this.counter++)
  }
}
