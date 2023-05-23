<script lang="ts">
  import { count } from '$lib/client/stores';

  let messages = [
    {
      role: "user",
      content: "Hello!"
    },
    {
      role: "assistant",
      content: "Hi, how may I help you?"
    }
  ];

</script>


<div class="container max-w-2xl max">
  {#each messages as {role, content}}
  <div class="chat chat-{role === "user" ? 'end' : 'start'}">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img src="{role === "user" ? "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" : "/favicon.png"}" alt="{role}" />
      </div>
    </div>
    <div class="chat-bubble">{content}</div>
  </div>
  {/each}
  <button class="btn" on:click={()=> count.update(()=> $count + 1)}>
    {$count}
  </button>
  <a href="/route2">route 2</a>
</div>
