<script lang="ts">
	import { euclideanDists, pairwiseCosineDist } from '$lib/client/compute';
	import { Message, allEmbeddings, allMessages } from '$lib/client/stores';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
  import * as tf from '@tensorflow/tfjs';
  let input = "";

  const numMatches = 2000;
  let matches: Message[] = [];
  let refEmbeddings: tf.Tensor2D;
  let messagesById: Record<string, Message> = {};
  $: {
    $allMessages.map((m) => {
      messagesById[m.id] = m;
    });

  }
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

    let distances: number[] = await euclideanDists(inputEmbedding, refEmbeddings);
    let distancesAndIdx = distances.map((val, idx) => [val, idx])
    distancesAndIdx.sort();
    matches = [];
    console.log(input);
    for (let i = 0; i < numMatches && i < distances.length; i++) {
      let [dist, idx] = distancesAndIdx[i];
      console.log(dist);
      matches.push(messagesById[$allEmbeddings[idx].ref]);
    }
    matches = matches;
    inputEmbedding.dispose();
    let pairwiseDist = await pairwiseCosineDist(refEmbeddings);
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

{#each matches as {content, role}}
  <ChatMessage {content} {role} />
{/each}
