import { Component } from '@angular/core';
import { Endpoints } from './config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  serverip: any="stg-sf.sportsunity.co";
  uname = 'nik';//'loadtester'+ Math.round(Math.random()*100);
  users=[]
  counter=0;
  count =100;
  constructor(private endpoint:Endpoints){
    
  }
  start(){
    console.log("values are ",this.uname,this.serverip)
    this.endpoint.smartfox_url=this.serverip
    for(let i=1;i<this.count;i++){
      // setTimeout(()=>{
        this.users.push('nik_'+i)
        this.counter++;
      // },1000*i)
    }
  }
  executed(user){
    console.error(user,this.users,this.users.indexOf(user))
    this.users.splice(this.users.indexOf(user),1)
    this.users.push('nik_'+this.counter++)
}
}