import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SmartfoxService } from '../smartfox.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.scss'],
  providers:[SmartfoxService]
})
export class InstanceComponent implements OnInit {
  @Output() complete = new EventEmitter();
  currentQuestion: any;
  connectionLostSubscription: Subscription;
  logInErrorEvent: any;
  opponentJoinedEvent: Subscription;
  time: any;
  roomVariablesUpdateSubscription: Subscription;
  roomName: any;
  opponentEnterEvent: Subscription;
  opponentLeaveEvent: Subscription;
  roomJoinedEvent: Subscription;
  userCount: any;
  quizDataVariable: { "ghost_match": any; "intended_score": number; "attack_card": number; "bot_responses": { "answer": boolean; "points": number; "time": number; }[]; "bot_type": string; "game_rules": { "points": number; "time_allowed": number; }[]; "target_mu": number; "info": string; "status": number; "questions": { "question_text": string; "question_type": string; "cc": number; "option_c": string; "option_a": string; "bucket": number; "value": string; "image_link": string; "option_b": string; "option_d": string; "question_category": string; "correct_answer": string; "rn": number; "id": number; "question_category_id": number; }[]; "attack_card_point": number; "bot_info": { "username": string; "photo": string; "bot_attack": number; "name": string; "bot_sub_level_id": number; }; "quiz_count": number; "bot_username": string; "aggression": number; };
  matchStartFlag: boolean;
  playerList: any=[]
  extensionListenerEvent: Subscription;
  lobbyLocked: boolean =false;
  roomLockSubscription: Subscription;
  logInEvent: Subscription;
  @Input() username: string;
  @Input() ip:string;
  smartfoxProfileforPlayer = {
    name: '',
    profilePic: 'assets/images/searching/ic_cyan.svg',
    elo: 1500
  }
  constructor(private sfs:SmartfoxService) {

   }

  ngOnInit() {
    this.smartfoxProfileforPlayer.name = this.username
    this.sfs.initializeSmartFoxConnection(this.username,this.ip)

    this.loginEventListener();
      this.ExtensionListener()
      this.disconnectionListener()
      this.roomJoinListener();
      this.opponentJoinListener();
      this.opponentEnterListener();
      this.opponentLeaveListener();
      this.roomVariablesListener();
      this.roomLockListener();

      this.sfs.loginSmartFox("GK")
  }
  ExtensionListener() {
    /**
    * Stage 6
    * call question received first and handled in function
    */
    this.extensionListenerEvent = this.sfs.ExtensionListenerEvent.subscribe((evt) => {
      console.log("extension listener fired", evt.cmd, "for me ", this.username == evt.params.u)
      console.log(evt)

      if (evt.cmd == 'cq') {
        console.log('received question fetch call', this.username, evt.params.u)
        // if (this.username == evt.params.u)
          this.fetchQuestionCall()

        //console.log(evt)
      }
      if (evt.cmd == 'cc') {
       
        this.fetchQuestionCall()
        console.log('received consumption call', this.username, evt.params.u)
        if (this.username == evt.params.u) {
          this.callConsumption()
        }
      }
      if (evt.cmd == "st") {

        let userlist = this.playerList//this.sfs.makeUserListRandom()
        userlist.forEach(element => {
        })
        this.matchStartFlag = true
      }
      if (evt.cmd == "nq") {
       this.currentQuestion = evt.params.qn
       let atime =  1500+ Math.round(Math.random()*1000)
       setTimeout(()=>{
        this.sfs.sendQA(this.currentQuestion, "option_a",atime)
       },atime)
      }
      if (evt.cmd == 'lb') {
        console.log('show leaderboard')
      }
      if (evt.cmd == 'wn') {
      this.endSequence()    //console.log('other players left so i win')
      }
      if (evt.cmd == 'qa') {
        console.log("question answer received", evt)
        console.log(evt.params.a.qn, evt.params.a.ao, evt.params.a.d, evt.params.a.u)

      }
      if (evt.cmd == 'co') {
        console.log("show correct answer received in gameplay")
      }
      if (evt.cmd == "sp") {
        this.endSequence()//console.log("postmatch show now")
      }
    })
  }
  endSequence(){
    this.sfs.leaveRoom();
    this.sfs.logoutSFS();
    this.complete.emit(this.username);
  }
  loginEventListener() {
    /**
    * Stage 3
    * after login success 
    * set smartfox profile 
    * send extension request
    */
    this.logInEvent = this.sfs.LogInEvent.subscribe((status) => {
      if (status == 1) {
        console.log('login successful sending game room request')
        this.sfs.setUserprofile(this.smartfoxProfileforPlayer)
        this.sfs.sendGameRoomRequest("free", 5,10, 1500, 100, false, null)
        // setTimeout(()=>{
        //   this.endSequence()
        // },10000)
      }
      else {
        console.error("Login failure", status,this.username)
        this.endSequence()
      }
    })

  }
  roomLockListener() {
    /**
    * Stage 4
    * room lock received , show spinner , run bot sequence which checks if there is need for bot
    */
    this.roomLockSubscription = this.sfs.RoomVariableLockUpdate.subscribe(evt => {
      //console.log("Lobby Locked", evt)

      if (evt == true) {
        this.roomLockSubscription.unsubscribe()
        let list = this.sfs.makePlayerList()
        this.updatePlayerList(list)
        console.log("Lobby Locked mil gaya")
        this.lobbyLocked = evt

        //add bot here
        // this.addBotPlayer() // this function handles the bot play sequence , it has check for bot usage so it is called here


      } else {
        this.lobbyLocked = evt
      }
    })
  }
  fetchQuestionCall() {
    console.log("current value of rq variable", this.sfs.getQuestionData())
    if (this.sfs.getQuestionData() == null) {
      console.log("questions not loaded")

      console.warn('question data spoofed')
      let data = { "ghost_match": null, "intended_score": 26, "attack_card": 400, "bot_responses": [{ "answer": false, "points": 0, "time": 3574 }, { "answer": true, "points": 6, "time": 1195 }, { "answer": true, "points": 6, "time": 1694 }, { "answer": true, "points": 6, "time": 1071 }, { "answer": true, "points": 6, "time": 887 }, { "answer": true, "points": 2, "time": 4668 }, { "answer": false, "points": 0, "time": 2602 }, { "answer": false, "points": 0, "time": 3255 }], "bot_type": "avg", "game_rules": [{ "points": 6, "time_allowed": 2000 }, { "points": 4, "time_allowed": 4500 }, { "points": 2, "time_allowed": 10000 }], "target_mu": 3.0, "info": "Success", "status": 200, "questions": [{ "question_text": "Who was the first explorer to sail round the world?", "question_type": "t", "cc": 1, "option_c": "Christopher Columbus", "option_a": "Ferdinand Magellan", "bucket": 4202, "value": "E", "image_link": "", "option_b": "Francis Drake", "option_d": "Vasco da Gama", "question_category": "World History", "correct_answer": "option_a", "rn": 1, "id": 4202, "question_category_id": 15 }, { "question_text": "Which bike is this?", "question_type": "i", "cc": 1, "option_c": "tvs apache rr310", "option_a": "KTM Duke 390", "bucket": 9328, "value": "E", "image_link": "https://d2zj11tk0mshyz.cloudfront.net/153785936174.png", "option_b": "Royal Enfield", "option_d": "rajdoot", "question_category": "IPL", "correct_answer": "option_a", "rn": 2, "id": 9328, "question_category_id": 4 }, { "question_text": "Lassi is a drink made of which dairy product?", "question_type": "t", "cc": 1, "option_c": "Lemon", "option_a": "Curd", "bucket": 4652, "value": "E", "image_link": "", "option_b": "Water", "option_d": "Cheese", "question_category": "Indian Cuisine", "correct_answer": "option_a", "rn": 3, "id": 4652, "question_category_id": 18 }, { "question_text": "Bohag Bihu is a festival in North East India, mainly in the state of ?", "question_type": "t", "cc": 1, "option_c": "Meghalaya", "option_a": "Assam", "bucket": 4480, "value": "H", "image_link": "", "option_b": "Manipur", "option_d": "Tripura", "question_category": "Indian Culture", "correct_answer": "option_a", "rn": 1, "id": 4480, "question_category_id": 22 }, { "question_text": "India's first satellite is named after ___", "question_type": "t", "cc": 1, "option_c": "Bhaskara I", "option_a": "Aryabhatta", "bucket": 4388, "value": "H", "image_link": "", "option_b": "Bhaskara II", "option_d": "Albert Einstein", "question_category": "Technology", "correct_answer": "option_a", "rn": 2, "id": 4388, "question_category_id": 19 }, { "question_text": "Which of the following oceans is NOT touched by Antartica?", "question_type": "t", "cc": 1, "option_c": "Pacific", "option_a": "Indian", "bucket": 4145, "value": "M", "image_link": "", "option_b": "Atlantic", "option_d": "Artic", "question_category": "General", "correct_answer": "option_d", "rn": 1, "id": 4145, "question_category_id": 12 }, { "question_text": "Which is the largest state in India?", "question_type": "t", "cc": 1, "option_c": "Rajasthan", "option_a": "Madhya Pradesh", "bucket": 4417, "value": "M", "image_link": "", "option_b": "Uttar Pradesh", "option_d": "Tamil Nadu", "question_category": "Indian Geography", "correct_answer": "option_c", "rn": 2, "id": 4417, "question_category_id": 21 }, { "question_text": "What is the name of the crack in a volcano from which lava escapes?", "question_type": "t", "cc": 1, "option_c": "Lavone", "option_a": "Fissure", "bucket": 4794, "value": "M", "image_link": "", "option_b": "Magma", "option_d": "Leviosa", "question_category": "Science", "correct_answer": "option_a", "rn": 3, "id": 4794, "question_category_id": 17 }], "attack_card_point": -4, "bot_info": { "username": "mukul", "photo": "https://s3.amazonaws.com/random.avatars/M.png", "bot_attack": 400, "name": "mukul Sharma", "bot_sub_level_id": 3 }, "quiz_count": 8, "bot_username": "mukul", "aggression": 16 }
      console.warn(data)
      this.quizDataVariable = data
      this.sfs.setQuestionData(data)
      console.log("data set to memory provider")
      //console.log(data)

    } else {
      console.log("questions loaded into smartfox")
      let data = this.sfs.getQuestionData()
      //console.log(data, typeof data)
      if (typeof data == 'string') {
        this.quizDataVariable = JSON.parse(data)
      } else {
        this.quizDataVariable = data
      }
      // convert data to object if it comes as string else save as is
      //console.log("data set to memory provider")

    }
  }
  updatePlayerList(list) {
    let initial_count = this.playerList.length
    if (!this.lobbyLocked) {
      // this.playerList.forEach(element => {
      //   element.name = 'Searching...'
      //   element.profilePic = ''
      //   element.joined = false
      //   element.left = false;
      //   element.username = ''
      // });

      this.userCount = list.length;
      
      list.forEach((user, i) => {
        //console.log('user list is ', i, JSON.stringify(user))
        // this.playerList[i].name = user.name
        // this.playerList[i].profilePic = user.profilePic
        // this.playerList[i].joined = true;
        // this.playerList[i].username = user.username
        user.joined = true;
        user.bot = false;
        user.left = false;
      });
      this.playerList = list;
    } else {
      //console.log('player removed after lobby lock', JSON.stringify(list))
      this.userCount = this.playerList.length;
      this.playerList.forEach((element, j) => {
        var flag = false, index: number;
        list.forEach((user, i) => {
          //console.log('//////////////////////////////')
          //console.log('outer element ', j, ' ', element.name, ' ', element.username)
          //console.log('inner element ', i, ' ', user.name, ' ', user.username)
          //console.log('============')
          //console.log(index, 'lol ', element.name, '+', user.name, '+', element.username, '+', user.username)
          if (element.username == user.username) {
            flag = true;
            index = i;
          }
        })
        console.log('remove this player', flag, j, this.playerList[j].name, element.name)
        if (!flag && this.playerList[j].joined) {
          // this.playerList[index].name += ' Left' // remove this once leave bug is finished
          this.playerList[j].left = true
        }
      });
    }
  }
  callConsumption() {
    console.log(this.playerList)
    let userListObj = this.playerList
    this.userCount = userListObj.length;
    console.log(this.userCount)
      this.sfs.sendConsumptionSuccess(this.userCount)
  }
  roomJoinListener() {
    this.roomJoinedEvent = this.sfs.RoomJoinedEvent.subscribe((variables) => {
      //console.log('room joined event')
      this.roomName = variables[0]
      //console.log(variables[1])
      this.updatePlayerList(variables[2])
      //console.log(roomName + "this was called when room joins happen")// got room name , call data api
      // this.fetchQuestionCall()
    })
  }
  opponentLeaveListener() {
    this.opponentLeaveEvent = this.sfs.UserLeaveRoomEvent.subscribe(evt => {
      this.updatePlayerList(evt[1])
    })
  }
  roomVariablesListener() {
    this.roomVariablesUpdateSubscription = this.sfs.RoomVariablesUpdate.subscribe((variable) => {
      // console.warn("room variable update fired ")
        this.time = variable
        // if(this.time==2){
        //   console.warn("exiting")
        //   this.endSequence()
        // }
    })
  }

  opponentEnterListener() {
    // only for opponent profile fetch
    this.opponentEnterEvent = this.sfs.OpponentEnterEvent.subscribe((evt) => {
      //console.log("opponent enter listener fired")
      if (evt[0].room.name == this.roomName) {
        this.updatePlayerList(evt[1])
        //console.log("opponent enter listener fired ", evt)
      }
    })

  }
  opponentJoinListener() {
    this.opponentJoinedEvent = this.sfs.OpponentJoinedEvent.subscribe(([evt, list]) => {
      this.updatePlayerList(list)


    })
  }
  disconnectionListener() {
    this.connectionLostSubscription = this.sfs.ConnectionLostEvent.subscribe((evt) => {
      console.warn("DISCONNECTED----- ", evt)

      // this.router.navigate(['/game/gameplay'])
   
      this.endSequence()
      // this.router.navigate(['/game'])
      //CleverTap.recordEventWithNameAndProps('disconnection',
      // {
      //   'occurence': 'searching',
      //     'lastknownplayercount': this.playerList.length,
      //       'match_key': this.matchKey,
      //         'consumption_fail': this.consumption_fail_flag
      // })
      // this.ts.shortToast("Oops!! Something went wrong")
      // this.navCtrl.setRoot('HomePage', {}, { animate: true, direction: 'backward' })
    })
  }
  unsubscribeAllSfs() {
    if (this.connectionLostSubscription)
      this.connectionLostSubscription.unsubscribe()
    if (this.extensionListenerEvent)
      this.extensionListenerEvent.unsubscribe();
    if (this.logInEvent)
      this.logInEvent.unsubscribe();
    if (this.logInErrorEvent)
      this.logInErrorEvent.unsubscribe()
    if (this.roomJoinedEvent)
      this.roomJoinedEvent.unsubscribe();
    if (this.opponentJoinedEvent)
      this.opponentJoinedEvent.unsubscribe();
    if (this.opponentLeaveEvent)
      this.opponentLeaveEvent.unsubscribe();
    if (this.roomVariablesUpdateSubscription)
      this.roomVariablesUpdateSubscription.unsubscribe()
    if (this.roomLockSubscription) {
      this.roomLockSubscription.unsubscribe();
    }
  }
  ngOnDestroy() {
    //console.log("destroyed")
    this.unsubscribeAllSfs();
  }
}
