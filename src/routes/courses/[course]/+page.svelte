


<script lang="ts">
    import type * as Req from '$lib/request_types'
    import { selectedCourse } from "$lib/client/courses"


    let messages: Req.ChatCompletionRequestMessage[] = [
      {
        role: "user",
        content: "Hello! Who was Socrates?"
      },
      {
        role: "assistant",
        content: "Socrates was a classical Greek philosopher who lived between 469/470 BCE and 399 BCE. He is considered one of the founders of Western philosophy, known for his teaching style of asking questions to challenge assumptions and beliefs. Socrates believed in objective truth and the importance of self-knowledge, and he was known for his commitment to ethics and morality. His ideas and teachings were recorded by his followers, including Plato, and have been studied and debated for centuries. Socrates was famously sentenced to death by drinking hemlock, after being accused of corrupting the youth of Athens and challenging the authority of the city's leaders."
      }
    ];
  
    async function sendChat(content: string) {
      messages = [...messages, {
        content,
        role: "user"
      }];
      const body: Req.Chat = { messages };
  
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const answers = await res.json();
      console.log(answers);
      messages = [...messages, ...answers];
    }
  
  
  </script>
  
  
  <div class="container">
    {#each messages as {role, content}}
    <div class="chat chat-start">
      <div class="chat-image avatar">
        <div class="w-14 rounded-full">
          <img src="{role === "user" ? "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png" : "https://banner2.cleanpng.com/20190613/wvj/kisspng-socrates-classical-athens-ancient-greek-philosophy-socrates-on-emaze-5d02ab1271b305.4589557715604559544657.jpg"}"
            alt="{role}" />
        </div>
      </div>
      <div class="chat-bubble {role === "user" ? "chat-bubble-success" : "chat-bubble-info"}">{content}</div>
    </div>
    {/each}
  </div>
  
  