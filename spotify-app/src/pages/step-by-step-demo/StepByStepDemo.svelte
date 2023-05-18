<script lang="ts">
  import * as auth from "./utils";
  import {type UserProfile} from "./utils"
  import * as env_vars from "../../env_vars";


  let clientId = env_vars.clientId

  let accessToken:string;
  let refreshToken:string;

  let profileData:UserProfile;
  let topSongs:string[];


  async function requestUserAuthentication() {
    auth.requestUserAuthentication(clientId)
  }

  async function getAccessToken() {
    let params = new URLSearchParams(window.location.search);
    let code = params.get("code");

    if (!code) {
      alert("NO CODE")
      return
    }
    else {
      const res = await auth.getAccessTokenFromCode(clientId, code);
      accessToken = res.access_token;
      refreshToken = res.refresh_token;

      console.log("hi", accessToken, refreshToken, res)
      
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
    }

    //code searchParam is now invalid btw
    params.delete("code");

  }

  async function restoreTokensFromLocalStorage() {
    accessToken = localStorage.getItem("accessToken")
    refreshToken = localStorage.getItem("refreshToken");
  }

  async function getAccessTokenFromRefreshToken() {
    alert("Not Yet Implemented")
  }
  

  //TODO error checking for fetch requests
  async function fetchProfile() {
    if (accessToken) {
      profileData = await auth.fetchProfile(accessToken)
      console.log(profileData)
    }

    else {
      alert("NO ACCESS TOKEN")
    }
  }

  async function fetchTopSongs() {
    if (accessToken) {
      const topSongsData = await auth.fetchTopSongs(accessToken)
      console.log(topSongsData)
      
      topSongs = [...topSongsData.items.map((song) => `${song.name} by ${song.artists[0].name}`), "(See console for full response)"];
    }

    else {
      alert("NO ACCESS TOKEN")
    }
  }

</script>

<main>

  <h1> Step By Step Auth Flow Demo </h1>
  
  <div>
    <label>
      Spotify Client ID:
      <input type="text" bind:value={clientId}>
    </label>

    <button class="small-button" on:click={()=>{clientId = env_vars.clientId}}>
      mine
    </button>
    <!-- <button class="small-button" on:click={()=>{clientId = "2f25e56a808b4317a8034c45eaf49327"}}>
      recieptify's (doesn't work because invalid redirect URL. I still feel like there is a way to get it to work, just need to redirect in a container and grab the code)
    </button> -->
  </div>

  <br>
  
  <p class="wrap">
    Access Token: {accessToken}
  </p>
  <p>
    Refresh Token: {refreshToken}
  </p>
  
  <button on:click={requestUserAuthentication}>
    Request User Authentication
  </button>
  
  <button on:click={getAccessToken}>
    Get Access Token From Auth Code
  </button>

  <br>
  
  <button on:click={restoreTokensFromLocalStorage}>
    Restore Tokens From LocalStorage
  </button>
  <button on:click={getAccessTokenFromRefreshToken}>
    Get New Access Token From Refresh Token
  </button>

  <hr>
  <p class="json-display">
    Profile Data: {JSON.stringify(profileData,null,4)}
  </p>
  <p class="json-display">
    Favorite Songs: {JSON.stringify(topSongs,null,4)}
  </p>

  <button on:click={fetchProfile}>
    Fetch Profile
  </button>

  <button on:click={fetchTopSongs}>
    Fetch Top Songs
  </button>
  
</main>

<style>
  hr {
    margin: 40px 0;
  }

  .json-display {
    white-space: pre;
  }

  input {
    width: 275px;
    margin-left: 5px;
    margin-right: 5px;
    
    vertical-align:baseline;
    font-size: inherit;
  }

  .small-button {
    padding: 1px 8px;
    font-weight: inherit;
    margin:0;
    text-align: center;
    display: inline;
  }

  .wrap {
    word-wrap: break-word;
  }
</style>
