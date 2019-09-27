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
    // Get OAuth token
    let response = await this.http.post('oauth/token',
      {
        'client_id': this.clientID,
        'client_secret': this.clientSecret,
        'grant_type': 'password',
        'password': this.pass,
        'scope': 'public',
        'username': this.email
      }
    )
    if (response.status !== 200) {
      console.error('Login failed.\n' + response.data)
      return callback(new Error('Login failed.'))
    }
    let oAuthToken = response.data['access_token']

    // Get TERA auth token
    let url = 'api/public/launcher_v3/tera_support/request_auth_token/' + this.userID
    response = await this.http.get(url, { headers: { 'Authorization': 'Bearer ' + oAuthToken } })
    if (response.status !== 200 || !response.data.success) {
      console.error('Invalid ticket\n' + response)
      return callback(new Error('Invalid ticket.'))
    }

    console.log(`[web] got ticket (${response.data.auth_token})`)

    callback(null, {
      ticket: response.data.auth_token
    })
  }
}

module.exports = WebClient
