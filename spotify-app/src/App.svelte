<script lang="ts">
  import { onMount } from "svelte";
  

  import * as auth from "./utils";
  import {type UserProfile} from "./utils"
  import * as env_vars from "./env_vars";


  onMount(async () => {
    // await onPageLoad();
  })



  let accessToken:string;
  let profileData:UserProfile;

  async function getAccessToken() {
    let params = new URLSearchParams(window.location.search);
    let code = params.get("code");

    if (!code) {
      alert("NO CODE")
      return
    }
    else {
      const _accessToken = await auth.getAccessToken(env_vars.clientId, code);
      accessToken = _accessToken;
    }

    //code searchParam is now invalid btw
    params.delete("code");

  }
  
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
    
  }

</script>

<main>

  <h1> Hello </h1>
  
  <p>
    Access Token: {accessToken}
  </p>
  
  <p class=".json buddy">
    Profile Data: {JSON.stringify(profileData,null,4)}
  </p>
  <!-- <ul>
    <li>Display Name: </li>
    <li>User ID: </li>
    <li>Email: </li>
    <li>Spotify URI: </li>
    <li>Link: <a id="url" href="#"> </a> </li>
    <li>Profile Image: </li>
  </ul> -->
  
  <button on:click={auth.requestUserAuthentication}>
    Request User Authentication
  </button>
  
  <button on:click={getAccessToken}>
    Get Access Token
  </button>

  <button on:click={fetchProfile}>
    Fetch Profile
  </button>

  <button on:click={fetchTopSongs}>
    Fetch Top Songs
  </button>
  
</main>

<style>
</style>
