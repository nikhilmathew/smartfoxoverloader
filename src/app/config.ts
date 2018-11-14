export class Endpoints {
    // data_url = 'https://api.sportsunity.co'//
    data_url = 'https://stg-chat.sportsunity.co' //'https://api.sportsunity.co'
    // data_url = 'http://192.168.0.26:3000' //'https://api.sportsunity.co'
    // smartfox_url = 'smartfox.qunami.co'//'smartfox-prod.sportsunity.co'//
    smartfox_url = 'stg-sf.sportsunity.co'//'smartfox-prod.sportsunity.co'//
    // smartfox_url = '192.168.0.59'//'192.168.0.27'//'13.126.56.132'///prod 
    login_endpoint = '/v2/login/'
    smartfoxServerConfig: any = {
        host: this.smartfox_url,
        port: 8888,
        useSSL: false,
        zone: "SportsUnity",
        debug: false,
    }
    googleMapsApiKey = 'AIzaSyBPUsTh50p8_Rm3JHleQDPlCW4QG4fWkzg'
    app_version = 220
}
