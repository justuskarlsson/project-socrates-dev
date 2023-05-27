<script lang="ts">
  import { auth } from "$lib/client/stores"
  import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'

  let email = "";
  let password = "";

  async function login(){
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login:", res);
  }


  async function register(){
    let res = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Register:", res)
  }

</script>


<div class="container">

  <div class="form-control w-full max-w-xs">
    <label class="label">
      <span class="label-text">Email:</span>
    </label>
    <input type="email" placeholder="Type here" bind:value={email} 
          class="input input-bordered w-full max-w-xs" />
  </div>
  <div class="form-control w-full max-w-xs">
    <label class="label">
      <span class="label-text">Password:</span>
    </label>
    <input type="password" placeholder="Type here" bind:value={password} 
    class="input input-bordered w-full max-w-xs" />
  </div>
  <div>
    <button class="btn" on:click={login} >Login</button>
    <button class="btn" on:click={register} >Register</button>
  </div>
</div>
