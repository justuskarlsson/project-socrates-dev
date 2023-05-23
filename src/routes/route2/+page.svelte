<script lang="ts">
  import { count } from '$lib/client/stores';



</script>


<div class="container max-w-2xl max">
  <button class="btn" on:click={()=> count.update(()=> $count + 1)}>
    {$count}
  </button>
</div>
