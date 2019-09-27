'use strict'
const axios = require('axios').default

class WebClient {
  constructor(email, pass, userID, clientID, clientSecret) {
    this.email = email
    this.pass = pass
    this.userID = userID
    this.clientID = clientID
    this.clientSecret = clientSecret
    this.http = axios.create({
      baseURL: 'https://account.enmasse.com',
      timeout: 5000
    })
    this.http.defaults.headers.common = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.80 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Referer': 'https://launcher.enmasse.com/index2.html'
    }
  }

  async getLogin(callback) {
    let response, cookie

    response = await this.http.post('oauth/token',
      {
        'client_id': this.clientID,
        'client_secret': this.clientSecret,
        'grant_type': 'password',
        'password': this.pass,
        'scope': 'public',
        'username': this.email
      }
    )

    console.error(response.data)
    if (response.status !== 200) {
      console.error(response.data)
      console.error('Login failed.')
      return callback(new Error('Login failed.'))
    }
    let oAuthToken = response.data['access_token']
    console.log(`Token: ${oAuthToken}`)
    // Simulate an actual log in by requesting the server list
    // For some reason, this is necessary for the server to issue a cookie that will
    // generate a valid token for logging in with a fake client.
    // response = await this.http.post('API/Account/ServerList', null, {
    //   headers: {
    //     cookie: cookie
    //   }
    // })

    // cookie = response.headers['set-cookie'][0].split(';')[0]

    // Get the ticket

    response = await this.http.get('api/public/launcher_v3/tera_support/request_auth_token/' + this.userID,
      {
        headers: {
          'Authorization': 'Bearer ' + oAuthToken
        }
      }
    ).catch((reason) => {
      console.error(reason)
    })

    console.error(response.data)
    if (response.status !== 200 || !response.data.success) {
      console.error(`Invalid ticket: ${response}`)
      return callback(new Error('Invalid ticket.'))
    }

    console.log(`[web] got ticket (${response.data.token})`)

    callback(null, {
      ticket: response.data.auth_token
    })
  }
}

module.exports = WebClient
