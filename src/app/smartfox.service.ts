import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Endpoints } from './config';
// import * as SFS2X from "sfs2x-api";
declare var window: any;
declare var SFS2X: any;
/*
  Generated class for the SmartfoxServiceProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable({
  providedIn: 'root'
})
export class SmartfoxService {

  username: string;
  roomId: string;
  sfs: any = null;
  RoomJoinedEvent = new Subject<any>();
  OpponentJoinedEvent = new Subject<any>();
  ExtensionListenerEvent = new Subject<any>();
  LogInEvent = new Subject<any>();
  LogInErrorEvent = new Subject<any>();
  UserLeaveRoomEvent = new Subject<any>();
  ConnectionLostEvent = new Subject<any>();
  OpponentEnterEvent = new Subject<any>();
  RoomVariablesUpdate = new Subject<any>();
  RoomVariableLockUpdate = new Subject<any>();
  LogInErrorSubscription: Subscription;
  PlayerSpectatorChangeEvent = new Subject<any>();
  constructor(private path: Endpoints, ) {
    //console.log('Hello SmartfoxServiceProvider Provider');
    this.sfs = null
  }
  ngOnDestroy() {
    console.warn("DESTROYED SMARTFOX INSTANCE")
  }
  ngOnInit() {
    console.warn("CREATED SMARTFOX INSTANCE")
  }
  initializeSmartFoxConnection(user) {
    console.log("Smartfox initialization started for "+user+" old value is =", this.sfs)
    if (this.sfs == null) {
      this.sfs = new SFS2X.SmartFox(this.path.smartfoxServerConfig);
      this.initializeEventListeners();
      this.username = user
    }

    //console.log("SMart Fox Service initialized with user "+user,this.username,"lol")
    console.log("SMartfox connected ", this.sfs.isConnected())
    // if (!this.sfs.isConnected())
    //     this.connectSmartFox()
  }
  smartFoxConnectionCheck() {
    return new Promise((f, r) => {
      if (!this.sfs.isConnected()) {
        this.connectSmartFox()
        f(false);
      } else {
        //console.log("assumed that smartfox is connected")
        f(true);
      }
    })
  }
  connectSmartFox() {
    //console.log("called connect smartfox")
    this.sfs.connect()
  }
  checkSmartFoxConnection() {
    //console.log(this.sfs.isConnected())
    //console.warn(this.sfs.roomManager.getJoinedRooms())
    // return this.sfs.isConnected()
  }
  loginSmartFox(game) {
    //console.log("Login Request made with user "+ this.username+' and mode '+ mode)
    // switch (game) {
    //   case 'gk':
    //     zone = "GK";
    //     break;
    //   case 'cricket':
    //     zone = 'Cricket';
    //     break;
    //   default:
    //     zone = null
    //console.log("unknown zone join request")
    // }
    //console.log(zone)
    // localStorage.setItem('username', 'f6354cbe95')
    // this.username = "testuser_" + Math.round(Math.random() * 1000) + '_nik'
    console.log(this.username, typeof this.username)
    let count = 0;
    let zone = 'GK'
    var connectInterval = setInterval(() => {
      if (!this.sfs.isConnected()) {
        this.connectSmartFox();
        if (count == 10) {
          console.warn(count)
          clearInterval(connectInterval);
        } else {
          count++;
        }
      } else {
        clearInterval(connectInterval);
        this.sfs.send(new SFS2X.Requests.System.LoginRequest(this.username, "", null, zone));
      }
    }, 500)

  }
  loginFriendMatch() {
    console.log("Friend Match Login Request made with user " + this.username)

    //console.log(zone)
    var connectInterval = setInterval(() => {
      if (!this.sfs.isConnected()) {
        this.connectSmartFox();
      } else {
        clearInterval(connectInterval);
        this.sfs.send(new SFS2X.Requests.System.LoginRequest(this.username, "", null, 'FM')); //zone friend match hardcoded
      }
    }, 500)

  }
  setUserprofile(obj) {

    var userVars = [];
    userVars.push(new SFS2X.Entities.Variables.SFSUserVariable("un", obj.name));
    userVars.push(new SFS2X.Entities.Variables.SFSUserVariable("ui", obj.profilePic));
    userVars.push(new SFS2X.Entities.Variables.SFSUserVariable("uer", obj.elo));
    userVars.push(new SFS2X.Entities.Variables.SFSUserVariable("qer", obj.qer));
    userVars.push(new SFS2X.Entities.Variables.SFSUserVariable("ubd", obj.ubd));
    userVars.push(new SFS2X.Entities.Variables.SFSUserVariable("uru", obj.uru));
    console.log("u============== uservars" + JSON.stringify(userVars))
    console.log("u============== obj" + JSON.stringify(obj))
    this.sfs.send(new SFS2X.Requests.System.SetUserVariablesRequest(userVars));
  }
  sendLeaderboard(spectator) {
    let leaderboardData = {
      ulb: JSON.stringify(spectator)
    }
    //   leaderboardData.push(new SFS2X.Entities.Variables.SFSUserVariable("ld", JSON.stringify(spectator)));
    // this.sfs.send(new SFS2X.Requests.System.SetUserVariablesRequest(leaderboardData));
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("uid", leaderboardData, this.sfs.lastJoinedRoom));
  }
  sendRematchRequest() {
    //console.log("rematch request")
    let obj = {
      re: 're'
    }
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("r", obj, this.roomId));
  }
  initializeEventListeners() { // try to add all event listeners here
    //console.log("event listeners initializing")
    this.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, this.onConnection, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.LOGIN, this.onLogin, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.LOGOUT, this.onLogout, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, this.onLoginError, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_ADD, this.onRoomCreated, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_CREATION_ERROR, this.onRoomCreationError, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, this.onRoomJoined, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, this.onRoomJoinError, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, this.onUserCountChange, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, this.onUserEnterRoom, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, this.onUserExitRoom, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.PING_PONG, this.pingPong, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.ROOM_VARIABLES_UPDATE, this.roomVariableUpdate, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.PLAYER_TO_SPECTATOR, this.onPlayerToSpectatorSwitch, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.PLAYER_TO_SPECTATOR_ERROR, this.onPlayerToSpectatorSwitchError, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.SPECTATOR_TO_PLAYER, this.onSpectatorToPlayerSwitch, this);
    this.sfs.addEventListener(SFS2X.SFSEvent.SPECTATOR_TO_PLAYER_ERROR, this.onSpectatorToPlayerSwitchError, this);
  }
  destroyEventListeners() { // try to add all event listeners here
    //console.log("event listeners initializing")
    this.sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION, this.onConnection);
    this.sfs.removeEventListener(SFS2X.SFSEvent.CONNECTION_LOST, this.onConnectionLost);
    this.sfs.removeEventListener(SFS2X.SFSEvent.LOGIN, this.onLogin);
    this.sfs.removeEventListener(SFS2X.SFSEvent.LOGOUT, this.onLogout);
    this.sfs.removeEventListener(SFS2X.SFSEvent.LOGIN_ERROR, this.onLoginError);
    this.sfs.removeEventListener(SFS2X.SFSEvent.EXTENSION_RESPONSE, this.onExtensionResponse);
    this.sfs.removeEventListener(SFS2X.SFSEvent.ROOM_ADD, this.onRoomCreated);
    this.sfs.removeEventListener(SFS2X.SFSEvent.ROOM_CREATION_ERROR, this.onRoomCreationError);
    this.sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN, this.onRoomJoined);
    this.sfs.removeEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, this.onRoomJoinError);
    this.sfs.removeEventListener(SFS2X.SFSEvent.USER_COUNT_CHANGE, this.onUserCountChange);
    this.sfs.removeEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, this.onUserEnterRoom);
    this.sfs.removeEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, this.onUserExitRoom);
    this.sfs.removeEventListener(SFS2X.SFSEvent.PING_PONG, this.pingPong);
    this.sfs.removeEventListener(SFS2X.SFSEvent.ROOM_VARIABLES_UPDATE, this.roomVariableUpdate);
    this.sfs.removeEventListener(SFS2X.SFSEvent.PLAYER_TO_SPECTATOR, this.onPlayerToSpectatorSwitch);
    this.sfs.removeEventListener(SFS2X.SFSEvent.PLAYER_TO_SPECTATOR_ERROR, this.onPlayerToSpectatorSwitchError);
    this.sfs.removeEventListener(SFS2X.SFSEvent.SPECTATOR_TO_PLAYER, this.onSpectatorToPlayerSwitch);
    this.sfs.removeEventListener(SFS2X.SFSEvent.SPECTATOR_TO_PLAYER_ERROR, this.onSpectatorToPlayerSwitchError);
  }
  destroySmartfoxService() {
    console.warn("Smartfox has been destroyed buhahahahha!!")
    this.destroyEventListeners()
    this.sfs = null;
  }
  onConnection(evtParams) {
    if (evtParams.success) {
      //console.log("Connected to SmartFoxServer 2X!");
      // this.loginSmartFox()
    } else {
      //console.log("Connection failed. Is the server running at all?");
    }
  }
  onRoomCreationError(evtParams) {
    //console.log("Room creation failure: " + evtParams.errorMessage);
  }

  onRoomJoinError(evtParams) {
    //console.log("Room joining failed: " + evtParams.errorMessage);
  }
  testSFXWorking() {
    //console.log(this.sfs.isConnected());
  }
  pingPong(evt) {

    console.log('ping pong')

  }
  sendGameRoomRequest(group, max_players, lobby_lock_time, eloRating, eloRange, friendMatch, roomName) {
    //console.log("game room request with group ", group, max_players, lobby_lock_time)
    var object: any = {}
    object.rg = group;
    object.mx = max_players;
    object.lt = 8;
    object.el = eloRating
    object.er = eloRange
    if (friendMatch)
      object.fm = friendMatch;
    function randomString(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
      return result;
    }
    if (roomName == null)
      object.rn = "ios" + randomString(7, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'); //room name sent to serverI
    else
      object.rn = roomName
    console.warn("======== sfs object", JSON.stringify(object))
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("g", object));
    // Send two integers to the Zone extension and get their sum in return
  }
  onLogin(evtParams) {
    console.log("Login successful!");
    this.LogInEvent.next(1)
    // this.sfs.enableLagMonitor(true, 2, 10)
  }
  onLoginError(evtParams) {
    console.log("Login failure: " + evtParams.errorCode + " " + evtParams.errorMessage);
    //console.log(evtParams)
    this.LogInEvent.next(2)
    // this.LogInErrorEvent.next(evtParams)
  }
  onRoomCreated(evtParams) {
    //console.log("Room created: " + evtParams.room);// called when room is created on game req
    //console.log(evtParams)
    //this.RoomJoinedEvent.next(evtParams.room.name)
  }
  onRoomJoined(evtParams) {
    //console.log("Room joined successfully: " + evtParams.room);//called when room joined
    console.log(evtParams.room.name, evtParams.room.variables.mk.value, "lobby var", evtParams.room.variables.ll.value)
    let userListObj = this.makePlayerList()
    this.roomId = evtParams.room
    this.RoomJoinedEvent.next([evtParams.room.name, evtParams.room.variables.mk.value, userListObj])
    this.RoomVariableLockUpdate.next(evtParams.room.variables.ll.value)
  }
  roomVariableUpdate(evtParams) {
    var room = this.sfs.lastJoinedRoom
    // console.log("room variable update recd ",room.variables.ll.value,typeof room.variables.ll.value)
    // console.log("updated vars", evtParams, "--")
    if (room.variables.ll.value == true) {
      console.warn("Lobby is locked")
      this.RoomVariableLockUpdate.next(room.variables.ll.value)
    } else {
      // console.log('Lobby is Unlocked', JSON.stringify(room.variables.ll.value))
      this.RoomVariablesUpdate.next(room.variables.lt.value)
      this.RoomVariableLockUpdate.next(room.variables.ll.value)
    }
  }
  onUserEnterRoom(evtParams) {
    var room = evtParams.room;
    var user = evtParams.user;
    let userListObj = this.makePlayerList()
    //console.log('user entered room',user)
    //console.log(evtParams, "User " + user.name + " just joined Room " + room.name);
    this.OpponentEnterEvent.next([evtParams, userListObj])

  }
  onUserCountChange(evtParams, self = this) {
    // console.error("usercount change caught in sfs service", evtParams)
    var room = evtParams.room;
    var uCount = evtParams.uCount;
    var sCount = evtParams.sCount;
    let userListObj = this.makePlayerList()
    // if (uCount == 2) {
    //call ready request
    this.OpponentJoinedEvent.next([evtParams, userListObj])
    // }

    //console.log("Room: " + room.name + " now contains " + uCount + " users and " + sCount + " spectators");
  }
  onUserExitRoom(evtParams) {
    var room = evtParams.room;
    var user = evtParams.user;
    //console.log(evtParams)
    if (!user.isItMe) {
      let userListObj = this.makePlayerList()
      this.UserLeaveRoomEvent.next([evtParams, userListObj])
    }


    //console.log("User " + user.name + " just left Room " + room.name);
    // if (!user.isItMe)
    //     this.sfs.send(new SFS2X.Requests.System.LeaveRoomRequest());
    //console.warn("wo chala gaya so im leaving too , bye")
  }
  onExtensionResponse(evtParams) {// send a subject back to component
    //console.log("extension response-------------------")
    //console.log(evtParams.cmd);
    if (evtParams.cmd == 'cp') {
      console.warn('received cp req sending ping, handled by smartfox at lower level')
      this.sendConfirmationPong()
    }
    else {
      this.ExtensionListenerEvent.next(evtParams)
    }
  }
  sendConfirmationPong() {
    var obj = {
      p: 'p'
    }
    console.warn("sending pong to smartfox")
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("uid", obj, this.sfs.lastJoinedRoom));
  }
  sendQuestionReady(): any {
    var obj = {
      qr: 'qr'
    }
    console.warn("sending question ready to smartfox")
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("uid", obj, this.sfs.lastJoinedRoom));
  }
  makePlayerList() {
    let playerList = this.sfs.lastJoinedRoom.getPlayerList()
    let playerListObj = []
    if (playerList != null)
      playerList.forEach(element => {

        // console.warn("player detail- ", element.name, element.isItMe, element.variables.ui.value, element.variables.ui.value, element.variables.uer.value)
        playerListObj.push({ username: element.name, name: element.variables.un.value, profilePic: element.variables.ui.value, elo: element.variables.uer.value, score: 0 })

      });
    else
      playerListObj = [] // else throws error during leave room
    return playerListObj;
  }
  noOfPlayers() {
    let playerList = this.makePlayerList()
    return playerList.length;
  }
  noOfUsers() {
    let userList = this.makeUserList()
    return userList.length;
  }
  makeUserList() {
    let userlist = this.sfs.lastJoinedRoom.getUserList()
    let userListObj = []
    if (userlist != null)
      userlist.forEach(element => {
        console.log("ubd of user ", element.variables.un.value, " ", element.variables.ubd.value, " obj is - ", JSON.stringify(element.variables.ubd.value), typeof element.variables.ubd.value)
        console.warn("user detail- ", element.name.value, element.isPlayer(), "----", element.name, element.isItMe, element.variables.ui.value, element.variables.ui.value, element.variables.uer.value)
        userListObj.push({
          username: element.name,
          name: element.variables.un.value,
          profilePic: element.variables.ui.value,
          elo: element.variables.uer.value,
          isPlayer: element.isPlayer(),
          qer: element.variables.qer.value,
          badge: element.variables.ubd.value
        })

      });
    else
      userListObj = [] // else throws error during leave room
    return userListObj;
  }
  makeUserListRandom() {
    let userlist = this.sfs.lastJoinedRoom.getUserList()
    let userListObj = []
    if (userlist != null)
      userlist.forEach(element => {
        // console.log("ubd of user ",element.variables.un.value," ",element.variables.ubd.value," obj is - ",JSON.stringify(element.variables.ubd.value),typeof element.variables.ubd.value)
        console.warn("user detail- ", element.name.value, element.isPlayer(), "----", element.name, element.isItMe, element.variables.ui.value, element.variables.ui.value, element.variables.uer.value)
        userListObj.push({
          username: element.name,
          name: element.variables.un.value,
          profilePic: element.variables.ui.value,
          elo: element.variables.uer.value,
          isPlayer: element.isPlayer(),
          // qer: element.variables.qer.value,
          // badge: element.variables.ubd.value
        })

      });
    else
      userListObj = [] // else throws error during leave room
    return userListObj;
  }
  sendConsumptionSuccess(userCount) {
    var obj = {
      pc: true,
      c: parseInt(userCount)
    }
    //console.log("sending consumption success")
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("uid", obj, this.sfs.lastJoinedRoom));
  }
  sendReady() {
    var obj = {
      lr: true,
    }
    //console.log("sending ready from leaderboard")
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("uid", obj, this.sfs.lastJoinedRoom));
  }

  onConnectionLost(evtParams) {
    var reason = evtParams.reason;

    if (reason != SFS2X.Utils.ClientDisconnectionReason.MANUAL) {
      if (reason == SFS2X.Utils.ClientDisconnectionReason.IDLE)
        console.warn("A disconnection occurred due to inactivity");
      else if (reason == SFS2X.Utils.ClientDisconnectionReason.KICK)
        console.warn("You have been kicked by the moderator");
      else if (reason == SFS2X.Utils.ClientDisconnectionReason.BAN)
        console.warn("You have been banned by the moderator");
      else
        console.warn("A disconnection occurred due to unknown reason; please check the server log");
    }
    else {
      //Manual disconnection is usually ignored
      console.warn("manual disconection - ", reason)
    }
    this.ConnectionLostEvent.next(reason)
  }
  // sendReady(evtParams: any) {
  //     var room = evtParams.room;
  //     var uCount = evtParams.uCount;
  //     var sCount = evtParams.sCount;
  //     if (uCount == 2) {
  //         //call ready request
  //         let obj = {
  //             REMATCH: null
  //         }
  //         this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("r", obj, this.roomId));
  //         //console.log("sending the first ready to check if both users are ready, this is not to start showing questions")

  //     }
  //     //console.log("Room: " + room.name + " now contains " + uCount + " users and " + sCount + " spectators");

  // }
  // sendReadyEvent(msg) {
  //     //call ready request
  //     let obj = {
  //         REMATCH: ''
  //     }
  //     this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("r", obj, this.roomId));
  //     //console.log(msg)
  // }
  sendQA(questionno: number, option: string = "no_answer", time: number = 14000) {
    //call ready request
    let obj = {
      qn: questionno,
      ao: option,
      d: time
    }
    // console.log(obj, this.roomId)
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("q", obj, this.roomId));
    console.log("answer sent to server")


  }
  sendPower(power) {
    //call ready request
    let obj = {
      ao: power,
      qn: 500
    }
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("q", obj, this.roomId));
    //console.log("powerup sent", obj)


  }
  leaveRoom() {
    try {
      console.log("sending a room leave request")
      this.sfs.send(new SFS2X.Requests.System.LeaveRoomRequest());
    } catch (error) {
      // console.error(error)
    }
  }
  logoutSFS() {
    try {
      console.warn("Logout from smartfox")
      this.sfs.send(new SFS2X.Requests.System.LogoutRequest());
      this.disconnectSFS()
    } catch (error) {
      // console.error(error)
    }

  }
  disconnectSFS() {
    //console.warn("disconnect from smartfox")
    this.sfs.disconnect();//closes connection
    this.destroySmartfoxService()
  }
  onLogout(evtParams) {
    //console.log("Logout executed!");
  }
  getMatchKey() {
    var room = this.sfs.lastJoinedRoom
    return room.variables.mk.value
  }
  getQuestionData() {

    var qdata = this.sfs.lastJoinedRoom
    if (qdata.variables.rq) {
      console.log("found questions on smartfox")
      return qdata.variables.rq.value

    } else {
      console.log("did not find questions on smartfox")
      return null;
    }
  }
  setQuestionData(data) {
    // var qdata = this.sfs.lastJoinedRoom
    // qdata.rq.value = data
    // var obj = {a:JSON.stringify(data),c:parseInt(data.quiz_count)}
    var obj = { a: JSON.stringify(data), c: parseInt(data.quiz_count) }
    //    var variable =[] ;
    //use extension
    this.sfs.send(new SFS2X.Requests.System.ExtensionRequest("uid", obj, this.sfs.lastJoinedRoom));
    console.log("sent questions to smartfox")
  }
  getRoomName() {
    //console.warn(this.sfs)
    var room = this.sfs.lastJoinedRoom.name
    return this.sfs.lastJoinedRoom.name
  }
  onPlayerToSpectatorSwitch(evtParams) {
    console.log("Player " + evtParams.user + " is now a spectator");
    this.playerChangeHandler(evtParams.user, evtParams.user.isItMe, false)
  }

  onPlayerToSpectatorSwitchError(evtParams) {
    // console.error("Unable to become a spectator due to the following error: " + evtParams.errorMessage);
  }
  onSpectatorToPlayerSwitch(evtParams) {
    console.log("Spectator " + evtParams.user + " is now a player", evtParams.user.isItMe);
    this.playerChangeHandler(evtParams.user, evtParams.user.isItMe, true)
  }

  onSpectatorToPlayerSwitchError(evtParams) {
    console.log("Unable to become a player due to the following error: " + evtParams.errorMessage);
  }
  playerChangeHandler(username, isMe, isPlayer) {
    this.PlayerSpectatorChangeEvent.next({ username: username, isPlayer: isPlayer, isMe: isMe })
  }
  makePlayer() {
    this.sfs.send(new SFS2X.Requests.System.SpectatorToPlayerRequest());
  }
  makeSpectator() {
    this.sfs.send(new SFS2X.Requests.System.PlayerToSpectatorRequest());
  }
}
