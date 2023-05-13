
//most of the code provided by spotify API documentation tutorial

export interface UserProfile{
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean,
    filter_locked: boolean
  },
  external_urls: { spotify: string; };
  followers: { href: string; total: number; };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}


function generateRandomString(length:number) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier:string) {
  function base64encode(string) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}


//-----

import { clientId, redirectUri } from "./env_vars";

let scope = 'user-read-private user-read-email user-top-read';
export function requestUserAuthentication() {
  let codeVerifier = generateRandomString(128);

  generateCodeChallenge(codeVerifier)
  .then(codeChallenge => {
    let state = generateRandomString(16);

    localStorage.setItem('code_verifier', codeVerifier);

    let args = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge
    }); //this creates a thing like ?v="iwheiwfe"&x="iihfe"

    window.location.href = 'https://accounts.spotify.com/authorize?' + args;
  });

}

export async function getAccessToken(clientId: string, code: string): Promise<string> {
  
  let codeVerifier = localStorage.getItem('code_verifier');

  let body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
  });

  //TODO Error Handling maybe
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body
  });

  const res = await result.json();

  console.log("Access token response", res)

  return res.access_token;

  //now code is invalid fyi
}

/*

GetAccessToken()
3 ways:
  - Saved (localstorage)
  - from saved refresh token
  - from code gotten from user auth

*/

export async function fetchProfileOld(token: string) {
  const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}


//TODO FIGURE OUT TYPESCRIPTS RELATION TO JSON WEB APIS EXPECTED STRUCTURE STUFF
async function fetchDataFromSpotifyApi(
  token:string, 
  endpoint:string, method:string, body=undefined
)/*: Promise<JSON>*/ {
  
  console.log(`Fetching https://api.spotify.com/${endpoint}`)
  
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body:JSON.stringify(body)
  });
  return await res.json();


  //TODO ERROR HANDLING / promise.reject maybe todo
}


export async function fetchProfile(token: string): Promise<UserProfile> {
  
  const x = await (fetchDataFromSpotifyApi(token, `v1/me`, "GET" ))

  return x;
  
  
  
  //TODO double Check this is the same
  // return fetch(
  //   "https://api.spotify.com/v1/me", 
  //   {
  //     method: "GET", 
  //     headers: { Authorization: `Bearer ${token}` }
  //   }
  // )
  // .then ((result) => {
  //   return result.json();
  // })
  // .catch((error)=> {
  //   console.error(error)
  //   throw "Couldn't Fetch Profile"
  // })
}

export async function fetchTopSongs(token:string) {
  
  let args = new URLSearchParams({
    time_range: "long_term",
    limit: "3"
  });
  
  const x = await fetchDataFromSpotifyApi(token, `v1/me/top/tracks?${args}`, "GET" );
  
  return x;
}

async function test(token:string) {
  let test:JSON;
  //test = await fetchProfile(token);
}

//TODO LEARN

//---
import { writable } from "svelte/store";

let authed; //Not used
let loggedIn = writable(false);
let profile = writable(null)

export async function onPageLoad() {
  let params = new URLSearchParams(window.location.search);
  let code = params.get("code");


  /*
    Expected Param States:
    1) No params
    2) code=... &state=...              (after successful requestUserAuthentication)
    3) error=access_denied &state=...   (after canceled requestUserAuthentication)
  */



  if (!code) {
    authed = false;
    //Frontend code will allow user to auth, when that happens page will be reloaded with code in URLSearchParams
  }
  else {
    //we just got back from auth page successfully
    authed = true;
    
    try {
      console.log("Code provided, getting access token,")
      const accessToken = await getAccessToken(clientId, code);
      
      console.log("fetching profile data")
      
      const profile_var:UserProfile = await fetchProfile(accessToken) 
      profile.set(profile_var)
      console.log("profile:", profile_var)

      loggedIn.set(true)
    }
    catch(e) {
      console.error(e)
    }
  }
}





/*
  Cases:

  1) User has not logged in

  2) Auth code got but not access token

  3) access token gotten
*/



/*
  Here's the situation


  1) User starts not logged in
  2) User clicks log in
  3) User is redirected to spotify auth page
  4) (if user auths) User is redirected back to our page with code in the URLSearchParams
  5) Our page uses that code to request an Access Token
  ...

*/



