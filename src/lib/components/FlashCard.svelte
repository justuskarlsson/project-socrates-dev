<script lang="ts">
  export let front: string;
  export let back: string;

  let flipped = false;
  function flip(){
    flipped = !flipped;
  }
</script>


<div class="card w-96 bg-base-100 shadow-xl cursor-pointer"
     on:click={flip}>
  <div class="card-body">
    {flipped ? front : back}
  </div>
</div>