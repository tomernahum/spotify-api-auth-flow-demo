<script lang="ts">
  
  import { 
    requestUserAuthentication
  } from "../utils";

  export let error:boolean = false;
  


  




</script>

<section>
  <h2>You are not logged in</h2>
  <button on:click={requestUserAuthentication}>
    Request User Authentication
  </button>
  
  {#if error}
    <p>Login Failed</p>
  {/if}

</section>

<style>
  p {
    color: red;
  }
</style>