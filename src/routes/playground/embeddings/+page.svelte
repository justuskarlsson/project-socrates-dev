<script lang="ts">
	import { minEuclideanDist } from '$lib/client/compute';
	import { allEmbeddings, allMessages } from '$lib/client/stores';
  import * as tf from '@tensorflow/tfjs';
  let input = "";

  let refEmbeddings: tf.Tensor2D;

  $ : {
    let data: number[][] = $allEmbeddings.map((e) => e.embedding);
    refEmbeddings = tf.tensor(data);
  }

  async function searchEmbeddings(input: string){
    const res = await fetch("/api/embedding", {
      method: "POST",
      headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify({input})

    });
    const json = await res.json();
    let inputEmbedding = tf.tensor(json["embedding"]) as tf.Tensor1D;

    let matchIdx = await minEuclideanDist(inputEmbedding, refEmbeddings);
    console.log(matchIdx);
    let messageId = $allEmbeddings[matchIdx].messageId;
    let message = $allMessages.find((m) => m.id === messageId);
    if (message) {
      console.log(message.content);
    }
    
  }

  function maybeSubmit(event: KeyboardEvent){
    if (event.key === "Enter") {
      event.preventDefault();
      searchEmbeddings(input);
      input = "";
    }    
  }

</script>


<input class="border-2" bind:value={input} on:keydown={maybeSubmit} />


