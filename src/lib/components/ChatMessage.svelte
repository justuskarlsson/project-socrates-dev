<script lang="ts">
  import Markdown from "$lib/components/Markdown.svelte"

  export let role: string = "user";
  export let content: string;
</script>


<div class="chat chat-start">
  <div class="chat-image avatar">
    <div class="w-14 rounded-full">
      <img src="{role === "user" ? "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" : "https://banner2.cleanpng.com/20190613/wvj/kisspng-socrates-classical-athens-ancient-greek-philosophy-socrates-on-emaze-5d02ab1271b305.4589557715604559544657.jpg"}"
        alt="{role}" />
    </div>
  </div>
  <div class="chat-bubble {role === "user" ? "chat-bubble-success" : "chat-bubble-info"}">
    <Markdown content={content} />
  </div>
</div>